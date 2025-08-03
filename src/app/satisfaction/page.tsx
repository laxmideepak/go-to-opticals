'use client';

import { useState } from 'react';
import SatisfactionSurvey from '@/components/SatisfactionSurvey';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';

const mockDoctors = [
  { id: 'dr-goldstick', name: 'Dr. Bruce Goldstick' },
  { id: 'dr-joby', name: 'Dr. Joby' },
  { id: 'dr-smith', name: 'Dr. Sarah Smith' },
  { id: 'dr-johnson', name: 'Dr. Michael Johnson' },
];

function SatisfactionDemo() {
  const [showSurvey, setShowSurvey] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState(mockDoctors[0]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSatisfactionSubmit = async (rating: number, comment?: string) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/satisfaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          doctorName: selectedDoctor.name,
          rating,
          comment,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('Satisfaction survey submitted successfully:', result);
      } else {
        console.error('Satisfaction survey submission failed:', result);
        throw new Error(result.message || 'Submission failed');
      }
      
    } catch (error) {
      console.error('Error submitting satisfaction survey:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Doctor Satisfaction Survey Demo
          </h1>
          <p className="text-gray-600">
            Test the satisfaction survey functionality for different doctors
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Select a Doctor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockDoctors.map((doctor) => (
              <button
                key={doctor.id}
                onClick={() => {
                  setSelectedDoctor(doctor);
                  setShowSurvey(true);
                }}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="font-medium text-gray-900">{doctor.name}</div>
                <div className="text-sm text-gray-500">Click to rate</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            How it Works
          </h2>
          <div className="space-y-4 text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Star Rating System</p>
                <p>Patients can rate their experience from 1 to 5 stars with visual feedback.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Optional Comments</p>
                <p>Patients can provide additional feedback through a text comment field.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Data Storage</p>
                <p>All ratings and comments are securely stored and can be analyzed for insights.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">4</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Analytics Integration</p>
                <p>Satisfaction data is integrated with the main analytics dashboard for comprehensive reporting.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSurvey && (
        <SatisfactionSurvey
          doctorName={selectedDoctor.name}
          onSubmit={handleSatisfactionSubmit}
          isLoading={isSubmitting}
          onClose={() => setShowSurvey(false)}
        />
      )}
    </div>
  );
}

export default function SatisfactionPage() {
  return (
    <ProtectedRoute resource="satisfaction" action="read">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <SatisfactionDemo />
      </div>
    </ProtectedRoute>
  );
} 