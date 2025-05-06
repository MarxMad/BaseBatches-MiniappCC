"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

type QRScannerProps = {
  onScan: (result: string) => void;
  onClose: () => void;
};

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isScanning) {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current.render((decodedText) => {
        // Detener el escáner después de una lectura exitosa
        scannerRef.current?.clear();
        setIsScanning(false);
        onScan(decodedText);
      }, (error) => {
        // Manejar errores silenciosamente
        console.warn(`Error al escanear: ${error}`);
      });
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [isScanning, onScan]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-[#111111] rounded-2xl border border-[#2A2A2A] p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="text-[#B8B8B8] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-white">Escanear QR</h2>
          <div className="w-6"></div>
        </div>

        {/* Scanner Container */}
        <div className="relative">
          <div id="qr-reader" className="w-full aspect-square rounded-lg overflow-hidden"></div>
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#111111] bg-opacity-90">
              <button
                onClick={() => setIsScanning(true)}
                className="px-6 py-3 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFC000] transition-colors font-medium"
              >
                Iniciar Escáner
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-[#B8B8B8] text-sm">
            Coloca el código QR dentro del marco para escanear
          </p>
        </div>
      </div>
    </div>
  );
} 