'use client';

import { useState } from 'react';
import IntakeForm from '@/components/IntakeForm';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import SchedulingStatus from '@/components/SchedulingStatus';
import type { IntakeFormSchema } from '@/lib/validation';

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<IntakeFormSchema | null>(null);
  const [schedulingData, setSchedulingData] = useState<any>(null);

  const handleFormSubmit = async (data: IntakeFormSchema) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('Form submitted successfully:', result);
        setSubmittedData(data);
        
        // Check for scheduling data in the response
        if (result.schedulingData) {
          setSchedulingData(result.schedulingData);
        }
      } else {
        console.error('Form submission failed:', result);
        alert('Form submission failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute resource="intake" action="create">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="py-8 px-4">
          {submittedData ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Success Message */}
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Thank You!
                </h1>
                <p className="text-gray-600 mb-6">
                  Your information has been submitted successfully and your appointment has been scheduled.
                </p>
                <button
                  onClick={() => {
                    setSubmittedData(null);
                    setSchedulingData(null);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Submit Another Form
                </button>
              </div>

              {/* Scheduling Status */}
              {schedulingData && (
                <SchedulingStatus
                  appointmentId={schedulingData.appointmentId}
                  confirmationNumber={schedulingData.confirmationNumber}
                  scheduledDate={schedulingData.scheduledDate}
                  scheduledTime={schedulingData.scheduledTime}
                  location={schedulingData.location}
                  provider={schedulingData.provider}
                  instructions={schedulingData.instructions}
                  nextSteps={schedulingData.nextSteps}
                  warnings={schedulingData.warnings}
                />
              )}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <IntakeForm onSubmit={handleFormSubmit} isLoading={isSubmitting} />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
