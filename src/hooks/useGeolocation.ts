import { useState, useEffect } from 'react';

interface GeolocationState {
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    accuracy: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        isLoading: false,
      }));
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        accuracy: position.coords.accuracy,
        error: null,
        isLoading: false,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      setState((prev) => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    };

    // Get initial position quickly
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });

    // Watch for updates
    const watcherId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return () => {
      navigator.geolocation.clearWatch(watcherId);
    };
  }, []);

  return state;
}
