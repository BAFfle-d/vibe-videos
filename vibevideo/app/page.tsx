'use client';

import { AppProvider, useApp } from '@/contexts/AppContext';
import { UploadScreen } from '@/components/UploadScreen';
import { ConfigureScreen } from '@/components/ConfigureScreen';
import { GeneratingScreen } from '@/components/GeneratingScreen';

function AppContent() {
  const { currentStep, isProcessing, error, setError } = useApp();

  return (
    <>
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="font-semibold mb-1">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isProcessing && currentStep !== 'generating' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-gray-700 font-medium">Processing...</p>
          </div>
        </div>
      )}

      {/* Screen Router */}
      {currentStep === 'upload' && <UploadScreen />}
      {currentStep === 'configure' && <ConfigureScreen />}
      {currentStep === 'generating' && <GeneratingScreen />}
      {currentStep === 'edit' && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Editor Screen</h1>
            <p className="text-gray-600 mb-8">Coming in next phase...</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
