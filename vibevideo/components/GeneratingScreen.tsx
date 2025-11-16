'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { PexelsService } from '@/utils/pexelsService';
import { VideoGenerator } from '@/utils/videoGenerator';

export function GeneratingScreen() {
  const { project, setGeneratedVideo, setCurrentStep, setError } = useApp();
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing...');

  useEffect(() => {
    generateVideo();
  }, []);

  const generateVideo = async () => {
    try {
      if (!project.audioAnalysis) {
        throw new Error('No audio analysis available');
      }

      const pexelsService = new PexelsService();
      const videoGenerator = new VideoGenerator();

      // Step 1: Fetch videos from Pexels
      setStatusMessage('Searching for perfect clips...');
      setProgress(10);

      const estimatedClips = Math.ceil(
        project.audioAnalysis.duration / 
        (project.creativityLevel === 'low' ? 8 : project.creativityLevel === 'medium' ? 5 : 3)
      );

      const totalNeeded = estimatedClips * 3; // Fetch 3x for variety

      const videos = await pexelsService.fetchVideosWithDiversity(
        project.selectedTags,
        project.orientation,
        totalNeeded,
        project.creativityLevel === 'low' ? 7 : project.creativityLevel === 'medium' ? 4 : 2,
        10
      );

      setProgress(50);
      setStatusMessage(`Found ${videos.length} clips! Creating timeline...`);

      // Step 2: Generate timeline
      await new Promise(resolve => setTimeout(resolve, 1000)); // Visual pause

      const clips = videoGenerator.generateVideoTimeline(
        project.audioAnalysis,
        videos,
        project.creativityLevel,
        project.introLength,
        project.outroLength,
        project.userUploadedClips
      );

      setProgress(90);
      setStatusMessage('Finalizing video...');

      await new Promise(resolve => setTimeout(resolve, 500));

      setGeneratedVideo({
        clips,
        totalDuration: project.audioAnalysis.duration,
        audioFile: project.audioFile!,
      });

      setProgress(100);
      setStatusMessage('Complete!');

      setTimeout(() => {
        setCurrentStep('edit');
      }, 500);

    } catch (error) {
      console.error('Error generating video:', error);
      setError('Failed to generate video. Please try again.');
      setTimeout(() => setCurrentStep('configure'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-8">Creating Your Video</h2>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">{progress}%</p>
        </div>

        {/* Status Message */}
        <p className="text-center text-gray-700 mb-6">{statusMessage}</p>

        {/* Loading Animation */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            This may take a minute while we find the perfect clips and sync them to your music
          </p>
        </div>
      </div>
    </div>
  );
}
