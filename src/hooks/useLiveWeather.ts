import { useState, useEffect, useCallback } from 'react';
import {
  fetchLiveWeather,
  LiveWeatherData,
  BD_DISTRICTS,
  DistrictLocation,
} from '../services/weatherService';

export function useLiveWeather() {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictLocation>(() => {
    try {
      // 1. Check logged-in user profile district first
      const userRaw = localStorage.getItem('krishi_current_user');
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u && u.district) {
          const userDist = BD_DISTRICTS.find(
            (d) =>
              d.nameBn.trim() === u.district.trim() ||
              d.nameEn.toLowerCase() === u.district.toLowerCase() ||
              d.id === u.district
          );
          if (userDist) {
            localStorage.setItem('krishi_farmer_district', userDist.id);
            return userDist;
          }
        }
      }

      // 2. Check explicitly saved district
      const isExplicit = localStorage.getItem('krishi_district_explicitly_set');
      const saved = localStorage.getItem('krishi_farmer_district');
      if (saved && isExplicit) {
        const found = BD_DISTRICTS.find((d) => d.id === saved);
        if (found) return found;
      }
    } catch (e) {
      // ignore
    }
    // Default strictly to Dhaka
    try {
      localStorage.setItem('krishi_farmer_district', 'dhaka');
    } catch (e) {}
    return BD_DISTRICTS[0]; // Dhaka
  });
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);

  const loadWeather = useCallback(async (lat: number, lon: number, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchLiveWeather(lat, lon, name);
      setWeatherData(data);
    } catch (err: any) {
      console.error('Failed to load real live weather:', err);
      setError('লাইভ আবহাওয়া তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadWeather(selectedDistrict.lat, selectedDistrict.lon, selectedDistrict.nameBn + ', বাংলাদেশ');
  }, [selectedDistrict, loadWeather]);

  // Handle GPS location request
  const detectGpsLocation = () => {
    if (!navigator.geolocation) {
      alert('আপনার ব্রাউজারে GPS লোকেশন সমর্থন করে না।');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setIsGpsActive(true);
        await loadWeather(latitude, longitude, 'আমার বর্তমান অবস্থান (Live GPS)');
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        alert('লোকেশন পারমিশন পাওয়া যায়নি। আপনার বর্তমান জেলা "ঢাকা" রাখা হয়েছে।');
        setIsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const selectDistrictById = (districtId: string) => {
    const found = BD_DISTRICTS.find((d) => d.id === districtId);
    if (found) {
      setIsGpsActive(false);
      setSelectedDistrict(found);
      try {
        localStorage.setItem('krishi_farmer_district', districtId);
        localStorage.setItem('krishi_district_explicitly_set', 'true');
      } catch (e) {
        // ignore
      }
    }
  };

  const refresh = () => {
    if (weatherData) {
      loadWeather(weatherData.latitude, weatherData.longitude, weatherData.locationName);
    } else {
      loadWeather(selectedDistrict.lat, selectedDistrict.lon, selectedDistrict.nameBn + ', বাংলাদেশ');
    }
  };

  return {
    weatherData,
    isLoading,
    error,
    selectedDistrict,
    isGpsActive,
    selectDistrictById,
    detectGpsLocation,
    refresh,
  };
}
