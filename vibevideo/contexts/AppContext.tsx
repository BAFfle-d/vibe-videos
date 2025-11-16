'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AppState, ProjectSettings, GeneratedVideo, MasterControls } from '@/types';

interface AppContextValue extends AppState {
  updateProject: (updates: Partial<ProjectSettings>) => void;
  setGeneratedVideo: (video: GeneratedVideo | null) => void;
  updateMasterControls: (updates: Partial<MasterControls>) => void;
  setCurrentStep: (step: AppState['currentStep']) => void;
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  resetProject: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const initialProject: ProjectSettings = {
  audioFile: null,
  audioAnalysis: null,
  selectedTags: [],
  creativityLevel: 'medium',
  orientation: 'horizontal',
  introLength: 0,
  outroLength: 0,
  includeImages: false,
  userUploadedClips: [],
  userUploadedImages: [],
};

const initialMasterControls: MasterControls = {
  volume: 1,
  introScreen: {
    duration: 0,
  },
  textOverlays: [],
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<AppState['currentStep']>('upload');
  const [project, setProject] = useState<ProjectSettings>(initialProject);
  const [generatedVideo, setGeneratedVideoState] = useState<GeneratedVideo | null>(null);
  const [masterControls, setMasterControls] = useState<MasterControls>(initialMasterControls);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProject = useCallback((updates: Partial<ProjectSettings>) => {
    setProject((prev) => ({ ...prev, ...updates }));
  }, []);

  const setGeneratedVideo = useCallback((video: GeneratedVideo | null) => {
    setGeneratedVideoState(video);
  }, []);

  const updateMasterControls = useCallback((updates: Partial<MasterControls>) => {
    setMasterControls((prev) => ({ ...prev, ...updates }));
  }, []);

  const setProcessing = useCallback((processing: boolean) => {
    setIsProcessing(processing);
  }, []);

  const resetProject = useCallback(() => {
    setProject(initialProject);
    setGeneratedVideoState(null);
    setMasterControls(initialMasterControls);
    setCurrentStep('upload');
    setError(null);
    setIsProcessing(false);
  }, []);

  const value: AppContextValue = {
    currentStep,
    project,
    generatedVideo,
    masterControls,
    isProcessing,
    error,
    updateProject,
    setGeneratedVideo,
    updateMasterControls,
    setCurrentStep,
    setProcessing,
    setError,
    resetProject,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
