// Core application types

export interface AudioAnalysis {
  duration: number; // in seconds
  tempo: number; // BPM
  beats: number[]; // timestamps of beats in seconds
  mood: 'energetic' | 'calm' | 'upbeat' | 'melancholic' | 'intense';
  segments: AudioSegment[]; // distinct sections (intro, verse, chorus, etc)
}

export interface AudioSegment {
  start: number;
  end: number;
  type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro' | 'break';
  intensity: number; // 0-1
}

export type CreativityLevel = 'low' | 'medium' | 'high';

export interface CreativitySettings {
  minClipDuration: number;
  maxClipDuration: number;
  transitionProbability: number;
  effectsProbability: number;
  colorShiftProbability: number;
}

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  url: string;
  image: string; // thumbnail
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }[];
  tags?: string[];
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface TagCombination {
  tags: string[];
  count: number;
}

export interface VideoClip {
  id: string;
  pexelsVideo: PexelsVideo;
  startTime: number; // in final video
  endTime: number; // in final video
  duration: number;
  sourceStart?: number; // trim start in source video
  sourceEnd?: number; // trim end in source video
  vibe: string; // which tag it represents
  effects?: VideoEffects;
  transition?: TransitionType;
  volume: number; // 0-1
  isUserUploaded?: boolean;
  userUploadedFile?: File;
}

export interface VideoEffects {
  brightness: number; // -1 to 1
  contrast: number; // -1 to 1
  saturation: number; // -1 to 1
}

export type TransitionType = 
  | 'none' 
  | 'fade' 
  | 'fly-in-left' 
  | 'fly-in-right' 
  | 'fly-in-top' 
  | 'fly-in-bottom' 
  | 'zoom' 
  | 'dissolve';

export type Orientation = 'horizontal' | 'vertical';

export interface ProjectSettings {
  audioFile: File | null;
  audioAnalysis: AudioAnalysis | null;
  selectedTags: string[];
  creativityLevel: CreativityLevel;
  orientation: Orientation;
  introLength: number; // 0-5 seconds
  outroLength: number; // 0-5 seconds
  includeImages: boolean;
  userUploadedClips: File[];
  userUploadedImages: File[];
}

export interface GeneratedVideo {
  clips: VideoClip[];
  totalDuration: number;
  audioFile: File;
}

export interface TextOverlay {
  id: string;
  content: string;
  startTime: number;
  duration: number;
  fontSize: number;
  color: string;
  position: 'top' | 'center' | 'bottom';
  isClosedCaption: boolean;
}

export interface MasterControls {
  volume: number; // 0-1
  introScreen: {
    duration: number;
    content?: string;
  };
  textOverlays: TextOverlay[];
}

export interface AppState {
  currentStep: 'upload' | 'configure' | 'generating' | 'edit' | 'export';
  project: ProjectSettings;
  generatedVideo: GeneratedVideo | null;
  masterControls: MasterControls;
  isProcessing: boolean;
  error: string | null;
}

// Pexels API Response types
export interface PexelsSearchResponse {
  page: number;
  per_page: number;
  total_results: number;
  url: string;
  videos: PexelsVideo[];
}
