'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  registerHostAndProperty, 
  HostRegistrationFormData 
} from '@/actions/host-registration';
import { AccommodationType } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { 
  Church, 
  Home, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle,
  Info,
  Lock,
  ExternalLink,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import TentsLogo from '@/components/brand/TentsLogo';

// Carga dinámica del mapa selector de coordenadas con autocompletado
const DynamicPickerMap = dynamic(
  () => import('./LocationPickerMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-cream-200/50 rounded-2xl flex items-center justify-center text-xs text-wood-600 animate-pulse">
        Cargando mapa de geolocalización...
      </div>
    ),
  }
);

const STEP_TITLES = [
  { step: 1, title: 'Identidad y Responsable', subtitle: 'Paso 1 de 4' },
  { step: 2, title: 'Tu Espacio de Acogida', subtitle: 'Paso 2 de 4' },
  { step: 3, title: 'Ubicación Geográfica', subtitle: 'Paso 3 de 4' },
  { step: 4, title: 'Legal y Consentimiento', subtitle: 'Paso 4 de 4' },
];

export default function HostRegistrationFlow() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<{ message: string; auditId?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  // Estado del formulario multipaso
  const [formData, setFormData] = useState<HostRegistrationFormData>({
    fullName: '',
    email: '',
    phone: '',
    hostType: 'host_parish',
    parishDiocese: '',
    propertyName: '',
    accommodationType: 'parish',
    description: '',
    capacity: 4,
    addressText: '',
    neighborhood: '',
    city: 'León',
    country: 'España',
    suggestedDonationUsd: 0,
    latitude: 42.5987,
    longitude: -5.5671,
    rules: ['Silencio a las 22:00', 'Respeto mutuo y fraternidad'],
    amenities: ['Agua caliente', 'Colchonetas o camas', 'Sello del peregrino'],
    acceptedLocationPublishing: false,
    acceptedTermsOfService: false,
    acceptedPrivacyPolicy: false,
  });

  const updateField = (field: keyof HostRegistrationFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const currentStepInfo = STEP_TITLES[currentStep - 1];
  const progressPercentage = (currentStep / 4) * 100;

  const handleNextStep = () => {
    setErrorMessage(null);

    // Validación paso 1
    if (currentStep === 1) {
      if (!formData.fullName || !formData.email || !formData.phone) {
        setErrorMessage('Por favor completa todos tus datos personales de contacto.');
        toast.error('Completa los campos obligatorios');
        return;
      }
    }

    // Validación paso 2
    if (currentStep === 2) {
      if (!formData.propertyName || !formData.description || formData.capacity < 1) {
        setErrorMessage('Por favor indica el nombre del espacio, descripción y capacidad.');
        toast.error('Completa los datos del espacio');
        return;
      }
    }

    // Validación paso 3
    if (currentStep === 3) {
      if (!formData.addressText || !formData.neighborhood || !formData.city) {
        setErrorMessage('Por favor completa la dirección y ubicación de la propiedad.');
        toast.error('Completa la dirección');
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.acceptedLocationPublishing || !formData.acceptedTermsOfService || !formData.acceptedPrivacyPolicy) {
      setErrorMessage('Es estrictamente obligatorio aceptar todas las cláusulas de consentimiento legal y privacidad.');
      toast.error('Debes aceptar las cláusulas de consentimiento');
      return;
    }

    setIsSubmitting(true);
    toast.loading('Registrando espacio y firmando consentimiento...', { id: 'host-reg' });
    const result = await registerHostAndProperty(formData);
    setIsSubmitting(false);
    toast.dismiss('host-reg');

    if (result.success) {
      toast.success('¡Espacio registrado con éxito!');
      setSuccessResult({
        message: result.message,
        auditId: result.auditRecordId,
      });
    } else {
      toast.error(result.message || 'Error al procesar el registro');
      setErrorMessage(result.message || 'Error al procesar el registro.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
      {/* Cabecera del Onboarding */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-between mb-3">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-crimson hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al Mapa
          </Link>
          <TentsLogo variant="compact" size="sm" href="/" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink">
          Registro de Hospitalidad Cristiana
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-lg mx-auto">
          Ofrece tu parroquia, monasterio o casa particular como refugio para peregrinos en camino.
        </p>

        {/* BARRA DE PROGRESO VISUAL: Paso X de 4 */}
        <div className="mt-5 max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5 px-0.5">
            <span className="text-crimson font-serif">{currentStepInfo.subtitle}: {currentStepInfo.title}</span>
            <span className="text-wood-600 font-mono">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-wood-200/50 rounded-full h-2 overflow-hidden shadow-inner">
            <div
              className="bg-crimson h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Contenedor del Formulario */}
      <Card className="shadow-tent-lg overflow-hidden border-wood-200">
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-200 p-3.5 text-xs text-crimson flex items-center gap-2.5 font-medium">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successResult ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-serif font-bold text-ink">
              ¡Alojamiento Registrado Exitosamente!
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto">
              {successResult.message}
            </p>
            <div className="bg-wood-100 p-4 rounded-2xl max-w-md mx-auto text-left text-xs text-wood-800 space-y-1">
              <p className="font-bold">Registro de Auditoría Legal:</p>
              <p className="font-mono text-[11px] text-wood-700">ID Auditoría: {successResult.auditId}</p>
              <p className="text-[11px]">Consentimiento de publicación almacenado con sello de tiempo e IP.</p>
            </div>
            <div className="pt-4">
              <Link href="/">
                <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Explorar en el Mapa
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
            {/* PASO 1: IDENTIDAD DUAL */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-wood-200/60 pb-3">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-ink flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-crimson" />
                    Tipo de Anfitrión y Perfil Responsable
                  </h3>
                  <p className="text-xs text-ink-muted">Selecciona si representas a una institución eclesial o a una familia particular.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <label
                    onClick={() => {
                      updateField('hostType', 'host_parish');
                      updateField('accommodationType', 'parish');
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                      formData.hostType === 'host_parish'
                        ? 'border-crimson bg-crimson-50/50 shadow-md ring-2 ring-crimson/20'
                        : 'border-wood-200 bg-white hover:border-wood-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-serif font-bold text-ink flex items-center gap-2 text-sm">
                        <Church className="w-4 h-4 text-crimson" />
                        Parroquia / Comunidad
                      </span>
                      <input
                        type="radio"
                        name="hostType"
                        checked={formData.hostType === 'host_parish'}
                        onChange={() => {}}
                        className="text-crimson"
                      />
                    </div>
                    <p className="text-xs text-ink-muted">
                      Iglesias, monasterios o albergues parroquiales. Su ubicación se publica de forma exacta.
                    </p>
                  </label>

                  <label
                    onClick={() => {
                      updateField('hostType', 'host_private');
                      updateField('accommodationType', 'private_home');
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                      formData.hostType === 'host_private'
                        ? 'border-wood bg-wood-100/50 shadow-md ring-2 ring-wood/20'
                        : 'border-wood-200 bg-white hover:border-wood-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-serif font-bold text-ink flex items-center gap-2 text-sm">
                        <Home className="w-4 h-4 text-wood-600" />
                        Hogar Particular (Familia)
                      </span>
                      <input
                        type="radio"
                        name="hostType"
                        checked={formData.hostType === 'host_private'}
                        onChange={() => {}}
                        className="text-wood"
                      />
                    </div>
                    <p className="text-xs text-ink-muted">
                      Casas de familias cristianas. Dirección protegida con radio difuso de 500m.
                    </p>
                  </label>
                </div>

                <div className="space-y-3 pt-1">
                  <Input
                    label="Nombre Completo del Responsable"
                    placeholder="Ej: P. Juan Gómez / Familia Álvarez"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Correo Electrónico"
                      type="email"
                      placeholder="contacto@parroquia.org"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      required
                    />
                    <Input
                      label="Teléfono Móvil (WhatsApp)"
                      type="tel"
                      placeholder="+34 600 000 000"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      required
                    />
                  </div>

                  {formData.hostType === 'host_parish' && (
                    <Input
                      label="Diócesis o Congregación Religiosa (Opcional)"
                      placeholder="Ej: Diócesis de León / Orden Franciscana"
                      value={formData.parishDiocese}
                      onChange={(e) => updateField('parishDiocese', e.target.value)}
                    />
                  )}
                </div>
              </div>
            )}

            {/* PASO 2: DETALLES DEL ESPACIO */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-wood-200/60 pb-3">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-ink flex items-center gap-2">
                    <Heart className="w-5 h-5 text-crimson" />
                    Características de la Acogida
                  </h3>
                  <p className="text-xs text-ink-muted">Describe las condiciones del lugar y la capacidad disponible.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Nombre Público del Espacio"
                    placeholder="Ej: Albergue Parroquial Santiago Apóstol"
                    value={formData.propertyName}
                    onChange={(e) => updateField('propertyName', e.target.value)}
                    required
                  />

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-ink-soft">Categoría de Alojamiento</label>
                    <select
                      value={formData.accommodationType}
                      onChange={(e) => updateField('accommodationType', e.target.value as AccommodationType)}
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-wood-200 bg-white focus:outline-none focus:ring-2 focus:ring-crimson"
                    >
                      <option value="parish">Parroquia</option>
                      <option value="monastery">Monasterio / Convento</option>
                      <option value="pilgrim_hostel">Albergue Parroquial</option>
                      <option value="private_home">Casa Familiar / Particular</option>
                      <option value="community_space">Salón Comunitario</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Capacidad Máxima (Plazas de peregrinos)"
                    type="number"
                    min={1}
                    max={100}
                    value={formData.capacity}
                    onChange={(e) => updateField('capacity', parseInt(e.target.value) || 1)}
                    required
                  />

                  <Input
                    label="Donación Sugerida (USD/EUR - 0 = Libre)"
                    type="number"
                    min={0}
                    value={formData.suggestedDonationUsd}
                    onChange={(e) => updateField('suggestedDonationUsd', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-ink-soft">Descripción y Espíritu de Acogida</label>
                  <textarea
                    rows={3}
                    placeholder="Describe el espacio, qué facilidades tienen (esterillas, camas, ducha) y cualquier información espiritual..."
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-wood-200 bg-white focus:outline-none focus:ring-2 focus:ring-crimson resize-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* PASO 3: UBICACIÓN Y COORDENADAS CON MAPA Y AUTOCOMPLETADO */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-wood-200/60 pb-3">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-ink flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-crimson" />
                    Localización Geográfica
                  </h3>
                  <p className="text-xs text-ink-muted">Usa la barra de búsqueda para ubicar tu zona y afina la posición exacta en el mapa.</p>
                </div>

                {/* SELECTOR CON AUTOCOMPLETADO INTEGRADO */}
                <div>
                  <DynamicPickerMap
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onChangeLocation={(lat, lng, details) => {
                      updateField('latitude', lat);
                      updateField('longitude', lng);
                      if (details?.city) updateField('city', details.city);
                      if (details?.address && !formData.addressText) updateField('addressText', details.address);
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      label="Dirección Exacta (Calle y Número)"
                      placeholder="Calle Mayor 45, Portal 2"
                      value={formData.addressText}
                      onChange={(e) => updateField('addressText', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      label="Barrio / Zona"
                      placeholder="Centro Histórico"
                      value={formData.neighborhood}
                      onChange={(e) => updateField('neighborhood', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Ciudad / Localidad"
                    placeholder="León"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    required
                  />
                  <Input
                    label="País"
                    placeholder="España"
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* PASO 4: CONSENTIMIENTO LEGAL Y PRIVACIDAD */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-crimson-50 border border-crimson-200 p-3.5 rounded-2xl flex items-start gap-3">
                  <Lock className="w-5 h-5 text-crimson flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-crimson-800 space-y-1">
                    <h4 className="font-bold font-serif text-sm">
                      Marco Legal de Privacidad y Consentimiento Expreso
                    </h4>
                    <p>
                      Conforme al RGPD, requerimos tu consentimiento expreso e informado antes de incorporar tu espacio a la red Tents.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-wood-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="consent-location"
                      checked={formData.acceptedLocationPublishing}
                      onChange={(e) => updateField('acceptedLocationPublishing', e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-wood-300 text-crimson focus:ring-crimson"
                    />
                    <label htmlFor="consent-location" className="text-xs text-ink leading-relaxed">
                      <strong>1. Publicación de Datos de Ubicación y Contacto:</strong> Acepto que los datos de mi alojamiento sean publicados en el mapa de Tents. Entiendo que si mi registro es como Parroquia mi ubicación será pública, mientras que si es como Hogar Particular estará protegida con un radio difuso (~500m) hasta confirmación mutua.
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="consent-terms"
                      checked={formData.acceptedTermsOfService}
                      onChange={(e) => updateField('acceptedTermsOfService', e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-wood-300 text-crimson focus:ring-crimson"
                    />
                    <label htmlFor="consent-terms" className="text-xs text-ink leading-relaxed">
                      <strong>2. Términos de Servicio y Hospitalidad Cristiana:</strong> Me comprometo a brindar acogida fraterna y segura a peregrinos acreditados.{' '}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-crimson underline font-semibold inline-flex items-center gap-0.5 ml-1"
                      >
                        Leer Términos <ExternalLink className="w-3 h-3" />
                      </button>
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="consent-gdpr"
                      checked={formData.acceptedPrivacyPolicy}
                      onChange={(e) => updateField('acceptedPrivacyPolicy', e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-wood-300 text-crimson focus:ring-crimson"
                    />
                    <label htmlFor="consent-gdpr" className="text-xs text-ink leading-relaxed">
                      <strong>3. Política de Privacidad y Derecho al Olvido:</strong> Consiento el almacenamiento de mi IP y navegador en la auditoría legal de Tents. Entiendo que puedo ejercer en cualquier momento mi "Derecho al Olvido" para eliminar mis datos.
                    </label>
                  </div>
                </div>

                <div className="bg-wood-100/70 p-3 rounded-xl text-[11px] text-wood-700 flex items-center gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 text-wood-600" />
                  <span>
                    Auditoría de seguridad activa: Tu dirección IP y fecha UTC se registrarán en la tabla <code>legal_consents</code>.
                  </span>
                </div>
              </div>
            )}

            {/* NAVEGACIÓN ENTRE PASOS */}
            <div className="flex items-center justify-between pt-3 border-t border-wood-200">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrevStep}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Anterior
                </Button>
              ) : <div />}

              {currentStep < 4 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleNextStep}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Firmar y Publicar
                </Button>
              )}
            </div>
          </form>
        )}
      </Card>

      {/* MODAL DE TÉRMINOS Y CONDICIONES */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-ink-dark/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full bg-cream-50 p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <h3 className="font-serif font-black text-lg text-ink">
              Términos de Servicio y Acogida - Tents Platform (v1.0)
            </h3>
            <div className="text-xs text-ink-muted space-y-2.5 leading-relaxed">
              <p>
                <strong>1. Misión de la Red:</strong> Tents es una red eclesial y colaborativa de inspiración católica que facilita el albergue de peregrinos en tránsito hacia santuarios y rutas de fe.
              </p>
              <p>
                <strong>2. Carácter No Lucrativo:</strong> Los alojamientos ofrecidos por comunidades y parroquias se basan en donativos sugeridos o acogida gratuita para cubrir suministros básicos.
              </p>
              <p>
                <strong>3. Privacidad y Seguridad:</strong> La plataforma nunca compartirá la dirección de familias particulares de manera abierta en el mapa. Toda visualización pública estará ofuscada a un radio de 500 metros hasta la confirmación mutua.
              </p>
              <p>
                <strong>4. Derecho al Olvido:</strong> En cumplimiento del RGPD, cualquier usuario puede solicitar la baja definitiva de su perfil y de los registros de sus propiedades mediante la función de borrado de cuenta en cascada.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => setShowTermsModal(false)}
            >
              Comprendido y Cerrar
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
