'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone, CheckCircle, AlertTriangle } from 'lucide-react';

interface SchedulingStatusProps {
  appointmentId?: string;
  confirmationNumber?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  location?: {
    name: string;
    address: string;
    phone: string;
  };
  provider?: {
    name: string;
    specialty: string;
  };
  instructions?: string[];
  nextSteps?: string[];
  warnings?: string[];
}

export default function SchedulingStatus({
  appointmentId,
  confirmationNumber,
  scheduledDate,
  scheduledTime,
  location,
  provider,
  instructions,
  nextSteps,
  warnings
}: SchedulingStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!appointmentId) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Appointment Scheduled
            </h2>
            <p className="text-sm text-gray-600">
              Your appointment has been successfully scheduled
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {isExpanded ? 'Show Less' : 'Show Details'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Appointment Details */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Appointment Date</p>
              <p className="text-sm text-gray-600">
                {scheduledDate ? new Date(scheduledDate).toLocaleDateString() : 'TBD'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Appointment Time</p>
              <p className="text-sm text-gray-600">{scheduledTime || 'TBD'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Provider</p>
              <p className="text-sm text-gray-600">{provider?.name || 'TBD'}</p>
              {provider?.specialty && (
                <p className="text-xs text-gray-500">{provider.specialty}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Location</p>
              <p className="text-sm text-gray-600">{location?.name || 'TBD'}</p>
              {location?.address && (
                <p className="text-xs text-gray-500">{location.address}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Phone</p>
              <p className="text-sm text-gray-600">{location?.phone || 'TBD'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Appointment ID</p>
            <p className="text-sm text-gray-600 font-mono">{appointmentId}</p>
          </div>
          {confirmationNumber && (
            <div>
              <p className="text-sm font-medium text-gray-900">Confirmation Number</p>
              <p className="text-sm text-gray-600 font-mono">{confirmationNumber}</p>
            </div>
          )}
        </div>
      </div>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Important Notes</p>
              <ul className="mt-2 space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-700">• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-6">
          {/* Instructions */}
          {instructions && instructions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Appointment Instructions</h3>
              <ul className="space-y-2">
                {instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-sm text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {nextSteps && nextSteps.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Next Steps</h3>
              <ul className="space-y-2">
                {nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-sm text-gray-700">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 