'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Camera, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { userStorage } from '@/app/lib/user-storage';

export default function QRScannerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        startScanning();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
      setHasPermission(false);
      setIsScanning(false);
    }
  };

  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const scanFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // In a real implementation, you would use a QR code library here
        // For now, we'll simulate QR code detection
        simulateQRDetection();
      }

      if (isScanning) {
        requestAnimationFrame(scanFrame);
      }
    };

    scanFrame();
  };

  const simulateQRDetection = () => {
    // Simulate QR code detection after a random delay
    if (Math.random() < 0.005) { // 0.5% chance per frame (less frequent)
      // Generate a more realistic donation ID
      const donationId = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const mockQRData = {
        type: 'donation',
        id: donationId,
        timestamp: new Date().toISOString(),
        url: `/scan/${donationId}`
      };

      handleQRCodeDetected(JSON.stringify(mockQRData));
    }
  };

  const handleQRCodeDetected = (data: string) => {
    setIsScanning(false);
    setScannedData(data);

    try {
      const parsedData = JSON.parse(data);
      if (parsedData.type === 'donation' && parsedData.id) {
        // Track activity if user is logged in
        if (user) {
          userStorage.addUserActivity(user.id, {
            type: 'donation',
            description: `Scanned donation QR code: ${parsedData.id}`,
            metadata: { donationId: parsedData.id }
          });
        }
        
        // Navigate to the donation details page
        setTimeout(() => {
          router.push(`/scan/${parsedData.id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Error parsing QR code data:', err);
      setError('Invalid QR code format');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const handleManualInput = () => {
    const donationId = prompt('Enter donation ID:');
    if (donationId) {
      router.push(`/scan/${donationId}`);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <div className="relative h-screen">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 text-white p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-2">
              <QrCode className="w-6 h-6" />
              <span className="font-medium">QR Scanner</span>
            </div>
            <button
              onClick={handleManualInput}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Manual Input
            </button>
          </div>
        </div>

        {/* Camera View */}
        <div className="relative h-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Scanning Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Scanning Frame */}
              <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                {/* Corner Indicators */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-green-500"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-green-500"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-green-500"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-green-500"></div>
                
                {/* Scanning Line */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1 bg-green-500"
                  animate={{
                    y: [0, 256, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              
              {/* Instructions */}
              <div className="mt-4 text-center text-white">
                <p className="text-sm">Position QR code within the frame</p>
                <p className="text-xs text-gray-300 mt-1">Or use "Manual Input" to test with a donation ID</p>
              </div>
            </div>
          </div>

          {/* Hidden Canvas for Processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Success Overlay */}
        {scannedData && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Code Detected!</h3>
              <p className="text-gray-600 mb-4">Redirecting to donation details...</p>
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={stopCamera}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Stop Scanning
            </button>
            <button
              onClick={startCamera}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Start Scanning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 