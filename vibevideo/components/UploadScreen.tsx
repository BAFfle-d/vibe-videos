'use client';

import React, { useCallback, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { AudioAnalyzer } from '@/utils/audioAnalyzer';

export function UploadScreen() {
  const { updateProject, setCurrentStep, setProcessing, setError } = useApp();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('audio/')) {
        setError('Please upload an audio file');
        return;
      }

      setProcessing(true);
      setError(null);

      try {
        const analyzer = new AudioAnalyzer();
        const analysis = await analyzer.analyzeAudio(file);

        updateProject({
          audioFile: file,
          audioAnalysis: analysis,
        });

        setCurrentStep('configure');
      } catch (error) {
        console.error('Error analyzing audio:', error);
        setError('Failed to analyze audio file. Please try a different file.');
      } finally {
        setProcessing(false);
      }
    },
    [updateProject, setCurrentStep, setProcessing, setError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Vibe Video Generator</h1>
          <p className="text-xl text-gray-600">
            Create beat-synced music videos from stock footage
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`bg-white rounded-2xl shadow-lg p-12 border-4 border-dashed transition-all ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-24 w-24 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-semibold mb-2">Upload Your Music</h2>
            <p className="text-gray-600 mb-6">
              Drag and drop your audio file here, or click to browse
            </p>

            <label className="btn-primary inline-block cursor-pointer">
              Choose Audio File
              <input
                type="file"
                accept="audio/*"
                onChange={handleInputChange}
                className="hidden"
              />
            </label>

            <p className="text-sm text-gray-500 mt-4">
              Supported formats: MP3, WAV, M4A, OGG
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold mb-3">How it works:</h3>
          <ol className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                1
              </span>
              <span>Upload your music - we'll analyze the beats and tempo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                2
              </span>
              <span>Choose 5 vibe tags to define the visual aesthetic</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                3
              </span>
              <span>We'll generate a beat-synced video from stock footage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                4
              </span>
              <span>Edit, customize, and export your music video</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
