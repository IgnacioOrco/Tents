# ⛺ Tents - Progressive Web App (PWA) de Acogida Cristiana

**Tents** ("Airbnb Católico") conecta a **Peregrinos** con **Parroquias, Monasterios y Hogares Familiares**. Esta versión evoluciona el código base a una **PWA de nivel de producción** con diseño mobile-first nativo, autenticación sin contraseñas y un mapa interactivo sin fricción.

---

## 📱 Nuevas Capacidades PWA y App Shell

1. **Layout Nativo (App Shell):**
   - **Bottom Navigation Bar (Móvil):** Acceso rápido con un toque a *Explorar Mapa*, *Mis Solicitudes*, *Ofrecer Espacio* y *Mi Perfil*.
   - **Sidebar Adaptativo (Desktop):** Panel lateral estilizado con identidad de marca, navegación y acceso rápido.
2. **Sistema de Diseño y Componentes Reutilizables:**
   - [`Button`](file:///c:/Users/Admin/Documents/TENTS/src/components/ui/Button.tsx): Variantes `primary` (carmesí), `secondary` (madera), `outline`, `ghost` y `danger`, con estados de carga (`isLoading`).
   - [`Input`](file:///c:/Users/Admin/Documents/TENTS/src/components/ui/Input.tsx): Validación y feedback de error en tiempo real, soporte de iconos y anillos de foco adaptados.
   - [`Card`](file:///c:/Users/Admin/Documents/TENTS/src/components/ui/Card.tsx): Contenedores con curvatura `rounded-tent`, sombras `shadow-tent` y tonos crema/madera.
3. **Micro-interacciones:**
   - **Skeleton Loader:** Animación de carga geométrica litúrgica mientras el mapa y las teselas se inicializan.
   - **Toasts (`react-hot-toast`):** Notificaciones instantáneas para geolocalización GPS, envío de reservas y Magic Links.
4. **PWA Standalone:**
   - Manifiesto [`public/manifest.json`](file:///c:/Users/Admin/Documents/TENTS/public/manifest.json), vector icon [`public/icon.svg`](file:///c:/Users/Admin/Documents/TENTS/public/icon.svg) y meta tags para instalación como app nativa en iOS y Android.

---

## 🔐 Autenticación Sin Contraseñas (Zero Friction)

- **Magic Links (OTP por correo):** El usuario solo ingresa su correo electrónico y recibe un enlace directo de un toque.
- **Google OAuth:** Inicio de sesión instantáneo con cuenta de Google.
- Eliminación total de campos de contraseña en toda la plataforma.
- Rutas: [`/auth/login`](file:///c:/Users/Admin/Documents/TENTS/src/app/auth/login) y [`/auth/callback`](file:///c:/Users/Admin/Documents/TENTS/src/app/auth/callback).

---

## 🗺️ Experiencia de Mapa Fluida y Bottom Sheet

- **FAB "Centrar en mi ubicación":** Botón flotante que utiliza `navigator.geolocation` para centrar el mapa en la posición actual del peregrino y mostrar un pin GPS animado.
- **Bottom Sheet Nativo:** Reemplaza los popups invasivos de Leaflet. Al tocar cualquier pin:
  - Se despliega suavemente desde la parte inferior.
  - Muestra insignia con cruz (parroquia) o tienda (hogar), capacidad, donativo y aviso de privacidad (radio de 500m si es particular).
  - Incluye el botón principal **"Solicitar Alojamiento"**, con formulario embebido en el mismo panel.
  - **Mantiene el mapa 100% visible e interactivo en segundo plano.**
- **Autocompletado Geográfico:** Barra de búsqueda integrada en [`LocationPickerMap`](file:///c:/Users/Admin/Documents/TENTS/src/components/forms/LocationPickerMap.tsx) con API Nominatim para que el anfitrión encuentre su zona antes de ajustar el pin.
- **Barra de Progreso Visual:** Indicador en tiempo real del onboarding (*"Paso 2 de 4: Tu Espacio de Acogida"* con porcentaje).

---

## 🏃‍♂️ Ejecución y Rutas

```bash
npm run dev
```

- [http://localhost:3000](http://localhost:3000) - Explorar Mapa con Bottom Sheet y FAB GPS
- [http://localhost:3000/requests](http://localhost:3000/requests) - Mis Solicitudes y Direcciones Reveladas
- [http://localhost:3000/host/register](http://localhost:3000/host/register) - Onboarding con Barra de Progreso y Autocompletado
- [http://localhost:3000/profile](http://localhost:3000/profile) - Perfil y Derecho al Olvido (RGPD)
- [http://localhost:3000/auth/login](http://localhost:3000/auth/login) - Acceso sin contraseñas (Magic Link / Google)
