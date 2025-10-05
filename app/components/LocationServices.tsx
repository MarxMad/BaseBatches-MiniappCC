"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface LocationServicesProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
}

export const LocationServices: React.FC<LocationServicesProps> = ({ 
  isOpen, 
  onClose, 
  onLocationSelect 
}) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Ubicaciones populares predefinidas
  const popularLocations: Location[] = [
    {
      latitude: 19.4326,
      longitude: -99.1332,
      address: "Universidad Nacional Autónoma de México",
      city: "Ciudad de México",
      state: "CDMX",
      country: "México",
      postalCode: "04510"
    },
    {
      latitude: 25.6866,
      longitude: -100.3161,
      address: "Tecnológico de Monterrey",
      city: "Monterrey",
      state: "Nuevo León",
      country: "México",
      postalCode: "64849"
    },
    {
      latitude: 20.6597,
      longitude: -103.3496,
      address: "Universidad de Guadalajara",
      city: "Guadalajara",
      state: "Jalisco",
      country: "México",
      postalCode: "44100"
    }
  ];

  useEffect(() => {
    if (isOpen) {
      getCurrentLocation();
    }
  }, [isOpen]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.log('Geolocation no soportada');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        reverseGeocode(latitude, longitude);
        setPermissionGranted(true);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        setIsLoading(false);
        setPermissionGranted(false);
      }
    );
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Simulación de geocodificación inversa
      const mockAddress = `Dirección en ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      const location: Location = {
        latitude: lat,
        longitude: lng,
        address: mockAddress,
        city: "Ciudad",
        state: "Estado",
        country: "México",
        postalCode: "00000"
      };
      
      setCurrentLocation(location);
      setIsLoading(false);
    } catch (error) {
      console.error('Error en geocodificación:', error);
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    
    // Simulación de búsqueda de ubicaciones
    setTimeout(() => {
      const results = popularLocations.filter(location =>
        location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setIsLoading(false);
    }, 1000);
  };

  const handleLocationSelect = (location: Location) => {
    onLocationSelect(location);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#1A1A1A] rounded-2xl w-full max-w-2xl max-h-[90vh] border border-[#333333] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#333333] bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">📍 Ubicación</h2>
                <p className="text-gray-400">Selecciona tu ubicación para entrega local</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Ubicación actual */}
            {currentLocation && (
              <div className="mb-6 p-4 bg-[#0A0A0A] rounded-lg border border-[#333333]">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl">📍</div>
                  <div>
                    <h3 className="text-white font-semibold">Ubicación Actual</h3>
                    <p className="text-gray-400 text-sm">Detectada automáticamente</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-3">{currentLocation.address}</p>
                <button
                  onClick={() => handleLocationSelect(currentLocation)}
                  className="px-4 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-lg font-medium hover:from-[#FFA500] hover:to-[#FF8C00] transition-all"
                >
                  ✅ Usar esta ubicación
                </button>
              </div>
            )}

            {/* Búsqueda de ubicación */}
            <div className="mb-6">
              <label className="text-white font-medium mb-2 block">🔍 Buscar ubicación</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ciudad, dirección o código postal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 bg-[#0A0A0A] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700]"
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-lg font-medium hover:from-[#FFA500] hover:to-[#FF8C00] transition-all disabled:opacity-50"
                >
                  {isLoading ? '🔍' : '🔍'}
                </button>
              </div>
            </div>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">🎯 Resultados</h3>
                <div className="space-y-3">
                  {searchResults.map((location, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-[#0A0A0A] rounded-lg border border-[#333333] hover:border-[#FFD700] transition-colors cursor-pointer"
                      onClick={() => handleLocationSelect(location)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">🏢</div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{location.address}</h4>
                          <p className="text-gray-400 text-sm">{location.city}, {location.state}</p>
                        </div>
                        <div className="text-[#FFD700]">→</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Ubicaciones populares */}
            <div>
              <h3 className="text-white font-semibold mb-3">⭐ Ubicaciones Populares</h3>
              <div className="space-y-3">
                {popularLocations.map((location, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-[#0A0A0A] rounded-lg border border-[#333333] hover:border-[#FFD700] transition-colors cursor-pointer"
                    onClick={() => handleLocationSelect(location)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🏫</div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{location.address}</h4>
                        <p className="text-gray-400 text-sm">{location.city}, {location.state}</p>
                      </div>
                      <div className="text-[#FFD700]">→</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Información de entrega */}
            <div className="mt-6 p-4 bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 rounded-lg border border-[#FFD700]/20">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🚚</span>
                <h4 className="text-white font-semibold">Entrega Local</h4>
              </div>
              <p className="text-gray-300 text-sm">
                Los productos con entrega local se entregan en un radio de 10km desde tu ubicación.
                Tiempo estimado: 30-60 minutos.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
