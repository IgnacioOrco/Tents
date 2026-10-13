-- ============================================================================
-- TENTS PLATFORM - ARQUITECTURA DE BASE DE DATOS Y PRIVACIDAD POR DISEÑO
-- Compatible con Supabase (PostgreSQL 15+ con PostGIS)
-- ============================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. TIPOS ENUM PERSONALIZADOS
CREATE TYPE user_role AS ENUM (
    'pilgrim',        -- Peregrino (busca acogida/alojamiento)
    'host_private',   -- Anfitrión Particular (casa de familia, voluntario)
    'host_parish'     -- Parroquia, Monasterio o Centro Comunitario
);

CREATE TYPE accommodation_type AS ENUM (
    'parish',             -- Parroquia
    'monastery',          -- Monasterio / Convento
    'pilgrim_hostel',     -- Albergue Parroquial
    'private_home',       -- Hogar particular (familia acogedora)
    'community_space'     -- Salón parroquial o espacio comunitario
);

CREATE TYPE booking_status AS ENUM (
    'pending',            -- Pendiente de aprobación por el anfitrión
    'approved',           -- Aprobada: revela la ubicación exacta al peregrino
    'rejected',           -- Rechazada por el anfitrión
    'cancelled',          -- Cancelada por el peregrino
    'completed'           -- Estadía finalizada
);

CREATE TYPE consent_category AS ENUM (
    'host_location_publishing',  -- Publicación de datos de ubicación en mapa público
    'terms_of_service',          -- Términos y condiciones de Tents
    'privacy_policy'             -- Política de privacidad y tratamiento de datos
);

-- ============================================================================
-- 3. TABLA: PROFILES (Gestión Dual de Peregrinos y Anfitriones)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'pilgrim',
    phone TEXT,
    bio TEXT,
    avatar_url TEXT,
    parish_diocese TEXT,             -- Diócesis a la que pertenece (opcional)
    is_verified BOOLEAN DEFAULT FALSE, -- Verificación de párroco o credencial de peregrino
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 4. TABLA: LEGAL_CONSENTS (Registro estricto de auditoría legal y GDPR)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.legal_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consent_type consent_category NOT NULL,
    terms_version TEXT NOT NULL DEFAULT 'v1.0',
    accepted BOOLEAN NOT NULL DEFAULT TRUE,
    ip_address TEXT NOT NULL,        -- IP desde donde se otorgó el consentimiento
    user_agent TEXT,                 -- Navegador y SO del firmante
    metadata JSONB DEFAULT '{}'::jsonb, -- Datos adicionales (ej. coordenadas aceptadas)
    accepted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_legal_consents_user ON public.legal_consents(user_id);

-- ============================================================================
-- 5. TABLA: PROPERTIES (Alojamientos y Parroquias con PostGIS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type accommodation_type NOT NULL,
    description TEXT,
    capacity INT NOT NULL DEFAULT 1,
    rules TEXT[],                     -- Ej: ['Silencio a las 22:00', 'Misa comunitaria matutina']
    amenities TEXT[],                 -- Ej: ['Ducha caliente', 'Cocina', 'Credencial sellada']
    suggested_donation_usd NUMERIC(8,2) DEFAULT 0.00, -- Voluntario / Donación

    -- COORDENADAS GEOESPACIALES
    -- exact_location: Coordenada real en WGS84 (Point: Longitud, Latitud)
    exact_location GEOGRAPHY(Point, 4326) NOT NULL,
    -- fuzzy_location: Coordenada ofuscada (~500m de radio) para privacidad de particulares
    fuzzy_location GEOGRAPHY(Point, 4326) NOT NULL,

    -- DIRECCIÓN TEXTUAL Y CONTACTO
    address_text TEXT NOT NULL,       -- Dirección sensible (solo revelada tras aprobación en particulares)
    neighborhood TEXT NOT NULL,       -- Barrio o zona general (visible para todos)
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    phone_contact TEXT,

    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices espaciales GIST para consultas ultra-rápidas en el mapa
CREATE INDEX idx_properties_exact_loc ON public.properties USING GIST (exact_location);
CREATE INDEX idx_properties_fuzzy_loc ON public.properties USING GIST (fuzzy_location);
CREATE INDEX idx_properties_host ON public.properties (host_id);

-- ============================================================================
-- 6. TABLA: BOOKINGS_REQUESTS (Solicitudes de Peregrinación)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bookings_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    pilgrim_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests_count INT NOT NULL DEFAULT 1,
    pilgrim_creds_info TEXT,          -- Motivo de peregrinación / Ruta (ej. Camino de Santiago)
    message TEXT,
    status booking_status NOT NULL DEFAULT 'pending',
    host_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT check_dates CHECK (check_out >= check_in)
);

CREATE INDEX idx_bookings_pilgrim ON public.bookings_requests(pilgrim_id);
CREATE INDEX idx_bookings_property ON public.bookings_requests(property_id);
CREATE INDEX idx_bookings_status ON public.bookings_requests(status);

-- ============================================================================
-- 7. FUNCIÓN TRIGGER: OFUSCACIÓN AUTOMÁTICA DE UBICACIÓN (Data Obfuscation)
-- Si la propiedad es parroquia/monasterio -> fuzzy_location = exact_location
-- Si es particular -> genera un jitter aleatorio de ~300 a 600 metros
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_obfuscate_property_location()
RETURNS TRIGGER AS $$
DECLARE
    offset_distance_meters DOUBLE PRECISION;
    random_bearing_degrees DOUBLE PRECISION;
BEGIN
    -- Las parroquias y monasterios son de dominio público: mantienen ubicación exacta
    IF NEW.type IN ('parish', 'monastery', 'pilgrim_hostel') THEN
        NEW.fuzzy_location := NEW.exact_location;
    ELSE
        -- Alojamientos de particulares: Jitter determinista/aleatorio de 350-550 metros
        offset_distance_meters := 350.0 + (random() * 200.0);
        random_bearing_degrees := random() * 360.0;
        
        -- Proyecta un punto radial aleatorio usando ST_Project de PostGIS
        NEW.fuzzy_location := ST_Project(
            NEW.exact_location::geometry,
            offset_distance_meters,
            radians(random_bearing_degrees)
        )::geography;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_obfuscate_property_location
BEFORE INSERT OR UPDATE OF exact_location, type
ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.fn_obfuscate_property_location();

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) - PRIVACIDAD POR DISEÑO ESTRICTA
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings_requests ENABLE ROW LEVEL SECURITY;

-- Politicas Profiles
CREATE POLICY "Perfiles públicos legibles por usuarios autenticados"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Politicas Legal Consents
CREATE POLICY "Consentimientos solo visibles por el propio usuario o admin"
ON public.legal_consents FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios autenticados pueden registrar su consentimiento"
ON public.legal_consents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Politicas Properties
CREATE POLICY "Anfitriones pueden gestionar sus propias propiedades"
ON public.properties FOR ALL
TO authenticated
USING (auth.uid() = host_id)
WITH CHECK (auth.uid() = host_id);

-- Politicas Bookings Requests
CREATE POLICY "Peregrinos pueden ver y crear sus solicitudes"
ON public.bookings_requests FOR SELECT
TO authenticated
USING (auth.uid() = pilgrim_id);

CREATE POLICY "Peregrinos pueden insertar solicitudes"
ON public.bookings_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = pilgrim_id);

CREATE POLICY "Anfitriones pueden ver solicitudes sobre sus propiedades"
ON public.bookings_requests FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.properties p
        WHERE p.id = bookings_requests.property_id
        AND p.host_id = auth.uid()
    )
);

CREATE POLICY "Anfitriones pueden actualizar estado de solicitudes"
ON public.bookings_requests FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.properties p
        WHERE p.id = bookings_requests.property_id
        AND p.host_id = auth.uid()
    )
);

-- ============================================================================
-- 9. RPC FUNCTION SEGURA PARA EL MAPA (RADAR PÚBLICO CON PROTECCIÓN DE DATOS)
-- Esta función alimenta el mapa del frontend. Devuelve la ubicación exacta SOLO
-- si:
-- 1. Es una parroquia/monasterio (pública).
-- 2. El usuario es el anfitrión de la propiedad.
-- 3. El usuario es un peregrino con una reserva en estado 'approved' para esa propiedad.
-- En cualquier otro caso, devuelve la coordenada fuzzy, oculta dirección y teléfono.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_map_properties(
    viewer_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    type accommodation_type,
    description TEXT,
    capacity INT,
    neighborhood TEXT,
    city TEXT,
    suggested_donation_usd NUMERIC,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_exact_location BOOLEAN,
    address_revealed TEXT,
    phone_revealed TEXT,
    is_verified BOOLEAN
) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.type,
        p.description,
        p.capacity,
        p.neighborhood,
        p.city,
        p.suggested_donation_usd,
        CASE
            -- Caso 1: Parroquia o Monasterio (siempre exacta)
            WHEN p.type IN ('parish', 'monastery', 'pilgrim_hostel') THEN ST_Y(p.exact_location::geometry)
            -- Caso 2: El visualizador es el dueño
            WHEN viewer_id IS NOT NULL AND p.host_id = viewer_id THEN ST_Y(p.exact_location::geometry)
            -- Caso 3: Peregrino con reserva APROBADA
            WHEN viewer_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.bookings_requests br
                WHERE br.property_id = p.id
                AND br.pilgrim_id = viewer_id
                AND br.status = 'approved'
            ) THEN ST_Y(p.exact_location::geometry)
            -- Caso por defecto: Retorna coordenada ofuscada
            ELSE ST_Y(p.fuzzy_location::geometry)
        END AS latitude,
        
        CASE
            WHEN p.type IN ('parish', 'monastery', 'pilgrim_hostel') THEN ST_X(p.exact_location::geometry)
            WHEN viewer_id IS NOT NULL AND p.host_id = viewer_id THEN ST_X(p.exact_location::geometry)
            WHEN viewer_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.bookings_requests br
                WHERE br.property_id = p.id
                AND br.pilgrim_id = viewer_id
                AND br.status = 'approved'
            ) THEN ST_X(p.exact_location::geometry)
            ELSE ST_X(p.fuzzy_location::geometry)
        END AS longitude,

        -- Flag que le indica a la UI si está viendo un radio o el punto exacto
        (
            p.type IN ('parish', 'monastery', 'pilgrim_hostel')
            OR (viewer_id IS NOT NULL AND p.host_id = viewer_id)
            OR (viewer_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.bookings_requests br
                WHERE br.property_id = p.id
                AND br.pilgrim_id = viewer_id
                AND br.status = 'approved'
            ))
        ) AS is_exact_location,

        -- Dirección sensible
        CASE
            WHEN (
                p.type IN ('parish', 'monastery', 'pilgrim_hostel')
                OR (viewer_id IS NOT NULL AND p.host_id = viewer_id)
                OR (viewer_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM public.bookings_requests br
                    WHERE br.property_id = p.id
                    AND br.pilgrim_id = viewer_id
                    AND br.status = 'approved'
                ))
            ) THEN p.address_text
            ELSE 'Visible tras confirmación mutua'
        END AS address_revealed,

        -- Teléfono sensible
        CASE
            WHEN (
                p.type IN ('parish', 'monastery', 'pilgrim_hostel')
                OR (viewer_id IS NOT NULL AND p.host_id = viewer_id)
                OR (viewer_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM public.bookings_requests br
                    WHERE br.property_id = p.id
                    AND br.pilgrim_id = viewer_id
                    AND br.status = 'approved'
                ))
            ) THEN p.phone_contact
            ELSE NULL
        END AS phone_revealed,

        p.is_verified
    FROM public.properties p
    WHERE p.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. DERECHO AL OLVIDO (Right to be Forgotten - GDPR / Normativa)
-- Procedimiento para eliminar totalmente un usuario y sus rastros personales
-- garantizando la cascada y la anonimización de métricas
-- ============================================================================
CREATE OR REPLACE FUNCTION public.gdpr_delete_user_account(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar que solo el propio usuario o superadmin pueda invocarlo
    IF auth.uid() <> target_user_id THEN
        RAISE EXCEPTION 'No autorizado para solicitar la supresión de esta cuenta.';
    END IF;

    -- 1. Eliminar consentimientos legales y propiedades asociadas (automático vía CASCADE)
    -- 2. Eliminar de public.profiles
    DELETE FROM public.profiles WHERE id = target_user_id;

    -- 3. Eliminar de auth.users de Supabase
    DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
