import type {
  AudioAnalysis,
  CreativityLevel,
  CreativitySettings,
  PexelsVideo,
  VideoClip,
  TransitionType,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class VideoGenerator {
  private creativitySettings: Record<CreativityLevel, CreativitySettings> = {
    low: {
      minClipDuration: 7,
      maxClipDuration: 10,
      transitionProbability: 0.2,
      effectsProbability: 0.1,
      colorShiftProbability: 0.05,
    },
    medium: {
      minClipDuration: 4,
      maxClipDuration: 7,
      transitionProbability: 0.5,
      effectsProbability: 0.3,
      colorShiftProbability: 0.2,
    },
    high: {
      minClipDuration: 2,
      maxClipDuration: 4,
      transitionProbability: 0.8,
      effectsProbability: 0.6,
      colorShiftProbability: 0.4,
    },
  };

  /**
   * Generate video clips aligned to the beat
   */
  generateVideoTimeline(
    audioAnalysis: AudioAnalysis,
    availableVideos: PexelsVideo[],
    creativityLevel: CreativityLevel,
    introLength: number = 0,
    outroLength: number = 0,
    userUploadedClips: File[] = []
  ): VideoClip[] {
    const settings = this.creativitySettings[creativityLevel];
    const clips: VideoClip[] = [];
    
    const totalDuration = audioAnalysis.duration;
    const contentDuration = totalDuration - introLength - outroLength;
    
    let currentTime = introLength;
    let videoIndex = 0;

    // Insert user-uploaded clips first (distributed throughout)
    const userClipPositions = this.calculateUserClipPositions(
      userUploadedClips,
      contentDuration,
      audioAnalysis.beats
    );

    while (currentTime < totalDuration - outroLength && videoIndex < availableVideos.length) {
      // Check if we should insert a user clip at this position
      const userClip = userClipPositions.find(
        (uc) => Math.abs(uc.time - currentTime) < 0.5
      );

      if (userClip && userClip.file) {
        // Insert user-uploaded clip
        const duration = this.estimateClipDuration(
          currentTime,
          audioAnalysis.beats,
          settings.minClipDuration,
          settings.maxClipDuration
        );

        clips.push({
          id: uuidv4(),
          pexelsVideo: availableVideos[videoIndex], // Placeholder
          startTime: currentTime,
          endTime: currentTime + duration,
          duration,
          vibe: 'user-upload',
          volume: 1,
          isUserUploaded: true,
          userUploadedFile: userClip.file,
          transition: this.selectTransition(creativityLevel),
        });

        currentTime += duration;
        continue;
      }

      // Select next video from library
      const video = availableVideos[videoIndex % availableVideos.length];
      
      // Determine clip duration based on beats and creativity
      const clipDuration = this.calculateClipDuration(
        currentTime,
        audioAnalysis,
        settings
      );

      // Create video clip
      const clip: VideoClip = {
        id: uuidv4(),
        pexelsVideo: video,
        startTime: currentTime,
        endTime: currentTime + clipDuration,
        duration: clipDuration,
        vibe: video.tags?.[0] || 'general',
        volume: 1,
        transition: this.selectTransition(creativityLevel),
      };

      // Apply effects based on creativity level
      if (Math.random() < settings.effectsProbability) {
        clip.effects = this.generateRandomEffects(creativityLevel);
      }

      clips.push(clip);
      currentTime += clipDuration;
      videoIndex++;
    }

    return clips;
  }

  /**
   * Calculate optimal clip duration based on beat alignment
   */
  private calculateClipDuration(
    startTime: number,
    audioAnalysis: AudioAnalysis,
    settings: CreativitySettings
  ): number {
    const { beats, segments } = audioAnalysis;
    
    // Find the next significant beat or segment change
    const upcomingBeats = beats.filter((beat) => beat > startTime);
    
    if (upcomingBeats.length === 0) {
      return settings.minClipDuration;
    }

    // Look for a beat that falls within our duration range
    for (const beat of upcomingBeats) {
      const duration = beat - startTime;
      
      if (duration >= settings.minClipDuration && duration <= settings.maxClipDuration) {
        return duration;
      }
      
      // If we've passed the max duration, use the previous beat or max
      if (duration > settings.maxClipDuration) {
        break;
      }
    }

    // Check for segment boundaries (great places to change clips)
    const currentSegment = segments.find(
      (seg) => seg.start <= startTime && seg.end > startTime
    );

    if (currentSegment && currentSegment.end - startTime <= settings.maxClipDuration) {
      return currentSegment.end - startTime;
    }

    // Default: use the closest beat within range
    const targetDuration = (settings.minClipDuration + settings.maxClipDuration) / 2;
    const closestBeat = upcomingBeats.reduce((prev, curr) =>
      Math.abs(curr - startTime - targetDuration) < Math.abs(prev - startTime - targetDuration)
        ? curr
        : prev
    );

    const duration = closestBeat - startTime;
    
    // Clamp to valid range
    return Math.max(
      settings.minClipDuration,
      Math.min(duration, settings.maxClipDuration)
    );
  }

  /**
   * Estimate duration for user-uploaded clips
   */
  private estimateClipDuration(
    startTime: number,
    beats: number[],
    minDuration: number,
    maxDuration: number
  ): number {
    const upcomingBeats = beats.filter((beat) => beat > startTime);
    
    if (upcomingBeats.length === 0) return minDuration;

    for (const beat of upcomingBeats) {
      const duration = beat - startTime;
      if (duration >= minDuration && duration <= maxDuration) {
        return duration;
      }
    }

    return (minDuration + maxDuration) / 2;
  }

  /**
   * Calculate positions for user-uploaded clips
   */
  private calculateUserClipPositions(
    userClips: File[],
    contentDuration: number,
    beats: number[]
  ): { time: number; file: File }[] {
    if (userClips.length === 0) return [];

    const positions: { time: number; file: File }[] = [];
    const interval = contentDuration / (userClips.length + 1);

    for (let i = 0; i < userClips.length; i++) {
      const targetTime = interval * (i + 1);
      
      // Snap to nearest beat
      const nearestBeat = beats.reduce((prev, curr) =>
        Math.abs(curr - targetTime) < Math.abs(prev - targetTime) ? curr : prev
      );

      positions.push({
        time: nearestBeat,
        file: userClips[i],
      });
    }

    return positions;
  }

  /**
   * Select transition based on creativity level
   */
  private selectTransition(creativityLevel: CreativityLevel): TransitionType {
    const settings = this.creativitySettings[creativityLevel];
    
    if (Math.random() > settings.transitionProbability) {
      return 'none';
    }

    const transitions: TransitionType[] = [
      'fade',
      'dissolve',
      'fly-in-left',
      'fly-in-right',
      'fly-in-top',
      'fly-in-bottom',
      'zoom',
    ];

    // Low creativity: prefer subtle transitions
    if (creativityLevel === 'low') {
      return Math.random() < 0.7 ? 'fade' : 'dissolve';
    }

    // Medium creativity: mix of subtle and dynamic
    if (creativityLevel === 'medium') {
      const subtleTransitions = ['fade', 'dissolve'];
      const dynamicTransitions = transitions.filter((t) => !subtleTransitions.includes(t));
      
      return Math.random() < 0.5
        ? subtleTransitions[Math.floor(Math.random() * subtleTransitions.length)]
        : dynamicTransitions[Math.floor(Math.random() * dynamicTransitions.length)];
    }

    // High creativity: any transition
    return transitions[Math.floor(Math.random() * transitions.length)];
  }

  /**
   * Generate random effects based on creativity level
   */
  private generateRandomEffects(creativityLevel: CreativityLevel) {
    const settings = this.creativitySettings[creativityLevel];
    
    const maxIntensity = creativityLevel === 'low' ? 0.1 : creativityLevel === 'medium' ? 0.2 : 0.4;

    return {
      brightness: (Math.random() - 0.5) * maxIntensity,
      contrast: (Math.random() - 0.5) * maxIntensity,
      saturation: Math.random() < settings.colorShiftProbability 
        ? (Math.random() - 0.5) * maxIntensity * 2
        : 0,
    };
  }

  /**
   * Swap out a clip with a replacement from available videos
   */
  swapClip(
    clips: VideoClip[],
    clipId: string,
    replacementVideo: PexelsVideo
  ): VideoClip[] {
    return clips.map((clip) =>
      clip.id === clipId
        ? {
            ...clip,
            pexelsVideo: replacementVideo,
            vibe: replacementVideo.tags?.[0] || clip.vibe,
          }
        : clip
    );
  }

  /**
   * Get replacement suggestions for a clip
   */
  getReplacementSuggestions(
    availableVideos: PexelsVideo[],
    currentClip: VideoClip,
    count: number = 4
  ): PexelsVideo[] {
    // Filter videos that haven't been used and match duration requirements
    const candidates = availableVideos.filter(
      (video) =>
        video.id !== currentClip.pexelsVideo.id &&
        video.duration >= currentClip.duration
    );

    // Prioritize videos with similar tags
    const withSameTags = candidates.filter((video) =>
      video.tags?.includes(currentClip.vibe)
    );

    const suggestions = withSameTags.length >= count 
      ? withSameTags 
      : [...withSameTags, ...candidates];

    // Shuffle and return requested count
    return suggestions
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }
}

// Add uuid to package.json dependencies
// This is a note for the package.json - we'll need to add: "uuid": "^9.0.1"
