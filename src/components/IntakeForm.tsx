'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Eye, 
  ShieldCheck, 
  CheckCircle,
  Globe,
  MessageSquare
} from 'lucide-react';
import { 
  intakeFormSchema, 
  type IntakeFormSchema,
  spanishMessages 
} from '@/lib/validation';
import { 
  ATTRIBUTION_SOURCES, 
  INSURANCE_PROVIDERS,
  type AttributionSource 
} from '@/types/form';
import { 
  parseAttributionFromURL, 
  parseAttributionFromReferrer,
  type AttributionData 
} from '@/lib/attribution';

interface IntakeFormProps {
  onSubmit: (data: IntakeFormSchema) => void;
  isLoading?: boolean;
  initialData?: Partial<IntakeFormSchema>;
}

export default function IntakeForm({ 
  onSubmit, 
  isLoading = false,
  initialData 
}: IntakeFormProps) {
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [isOnline, setIsOnline] = useState(true);

  // Check online status for PWA functionality
  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Parse UTM parameters from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      const referrer = document.referrer;
      
      // Parse attribution from URL
      const urlAttribution = parseAttributionFromURL(currentUrl);
      
      // Parse attribution from referrer if no UTM parameters
      const referrerAttribution = referrer ? parseAttributionFromReferrer(referrer) : null;
      
      // Use URL attribution if available, otherwise use referrer attribution
      const attribution = urlAttribution.utmSource ? urlAttribution : (referrerAttribution || urlAttribution);
      
      // Set UTM parameters
      if (attribution.utmSource) {
        setValue('utmSource', attribution.utmSource);
      }
      if (attribution.utmMedium) {
        setValue('utmMedium', attribution.utmMedium);
      }
      if (attribution.utmCampaign) {
        setValue('utmCampaign', attribution.utmCampaign);
      }
      
      // Set attribution source
      setValue('attributionSource', attribution.source);
    }
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<IntakeFormSchema>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      preferredLanguage: 'en',
      consentToContact: false,
      consentToDataProcessing: false,
      ...initialData
    },
    mode: 'onChange'
  });

  const watchedInsuranceProvider = watch('insuranceProvider');

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: {
        en: 'Patient Intake Form',
        es: 'Formulario de Admisión del Paciente'
      },
      subtitle: {
        en: 'Please fill out the form below to help us serve you better',
        es: 'Por favor complete el formulario a continuación para ayudarnos a servirle mejor'
      },
      personalInfo: {
        en: 'Personal Information',
        es: 'Información Personal'
      },
      attribution: {
        en: 'How did you hear about us?',
        es: '¿Cómo se enteró de nosotros?'
      },
      insurance: {
        en: 'Insurance Information',
        es: 'Información del Seguro'
      },
      consent: {
        en: 'Consent & Permissions',
        es: 'Consentimiento y Permisos'
      },
      submit: {
        en: 'Submit Form',
        es: 'Enviar Formulario'
      },
      firstName: {
        en: 'First Name',
        es: 'Nombre'
      },
      lastName: {
        en: 'Last Name',
        es: 'Apellido'
      },
      email: {
        en: 'Email Address',
        es: 'Correo Electrónico'
      },
      phone: {
        en: 'Phone Number',
        es: 'Número de Teléfono'
      },
      dateOfBirth: {
        en: 'Date of Birth',
        es: 'Fecha de Nacimiento'
      },
      insuranceProvider: {
        en: 'Insurance Provider',
        es: 'Proveedor de Seguro'
      },
      insurancePlan: {
        en: 'Insurance Plan (Optional)',
        es: 'Plan de Seguro (Opcional)'
      },
      consentToContact: {
        en: 'I consent to be contacted regarding my appointment',
        es: 'Consiento ser contactado con respecto a mi cita'
      },
      consentToDataProcessing: {
        en: 'I consent to the processing of my data for healthcare purposes',
        es: 'Consiento el procesamiento de mis datos para fines de atención médica'
      },
      offline: {
        en: 'You are currently offline. Form will be submitted when connection is restored.',
        es: 'Está desconectado. El formulario se enviará cuando se restaure la conexión.'
      }
    };
    
    return translations[key]?.[language] || key;
  };

  const handleFormSubmit = (data: IntakeFormSchema) => {
    // Add timestamp and session ID
    const sessionData = {
      ...data,
      timestamp: new Date(),
      session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    onSubmit(sessionData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600">
            {t('subtitle')}
          </p>
          
          {/* Language Toggle */}
          <div className="mt-4 flex justify-center">
            <div className="bg-white rounded-lg p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  language === 'en' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('es')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  language === 'es' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Español
              </button>
            </div>
          </div>
        </div>

        {/* Offline Notice */}
        {!isOnline && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800 text-sm">
                {t('offline')}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form 
          onSubmit={handleSubmit(handleFormSubmit)}
          className="bg-white rounded-xl shadow-lg p-6 space-y-6"
        >
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2" />
              {t('personalInfo')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('firstName')} *
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  id="firstName"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={language === 'es' ? 'Juan' : 'John'}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('lastName')} *
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  id="lastName"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={language === 'es' ? 'Pérez' : 'Doe'}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email')} *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('phone')} *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register('phone')}
                    type="tel"
                    id="phone"
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="(555) 123-4567"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                {t('dateOfBirth')} *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('dateOfBirth')}
                  type="date"
                  id="dateOfBirth"
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>
          </div>

          {/* Attribution */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              {t('attribution')}
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('attribution')} *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(ATTRIBUTION_SOURCES).map(([key, label]) => (
                  <label key={key} className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      {...register('attributionSource')}
                      type="radio"
                      value={key}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
              {errors.attributionSource && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.attributionSource.message}
                </p>
              )}
            </div>
          </div>

          {/* Insurance */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              {t('insurance')}
            </h2>
            
            <div>
              <label htmlFor="insuranceProvider" className="block text-sm font-medium text-gray-700 mb-1">
                {t('insuranceProvider')} *
              </label>
              <select
                {...register('insuranceProvider')}
                id="insuranceProvider"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.insuranceProvider ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">{language === 'es' ? 'Seleccionar proveedor' : 'Select provider'}</option>
                {INSURANCE_PROVIDERS.map((provider) => (
                  <option key={provider.insurance_id} value={provider.insurance_id}>
                    {provider.name}
                  </option>
                ))}
              </select>
              {errors.insuranceProvider && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.insuranceProvider.message}
                </p>
              )}
            </div>

            {watchedInsuranceProvider && watchedInsuranceProvider !== 'other' && (
              <div>
                <label htmlFor="insurancePlan" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('insurancePlan')}
                </label>
                <input
                  {...register('insurancePlan')}
                  type="text"
                  id="insurancePlan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={language === 'es' ? 'Plan específico (opcional)' : 'Specific plan (optional)'}
                />
              </div>
            )}
          </div>

          {/* Consent */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                              <ShieldCheck className="h-5 w-5 mr-2" />
              {t('consent')}
            </h2>
            
            <div className="space-y-3">
              <label className="flex items-start">
                <input
                  {...register('consentToContact')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <span className="ml-3 text-sm text-gray-700">
                  {t('consentToContact')} *
                </span>
              </label>
              {errors.consentToContact && (
                <p className="ml-7 text-sm text-red-600">
                  {errors.consentToContact.message}
                </p>
              )}

              <label className="flex items-start">
                <input
                  {...register('consentToDataProcessing')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <span className="ml-3 text-sm text-gray-700">
                  {t('consentToDataProcessing')} *
                </span>
              </label>
              {errors.consentToDataProcessing && (
                <p className="ml-7 text-sm text-red-600">
                  {errors.consentToDataProcessing.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
                isValid && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {language === 'es' ? 'Enviando...' : 'Submitting...'}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {t('submit')}
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 