'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });

          console.log('Service Worker registered successfully:', registration);

          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is available
                  console.log('New service worker available');
                  // You can show a notification to the user here
                }
              });
            }
          });

          // Handle service worker activation
          registration.addEventListener('controllerchange', () => {
            console.log('Service Worker activated');
          });

        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      };

      registerSW();
    }
  }, []);

  return null; // This component doesn't render anything
} 