import Meyda from 'meyda';
import type { AudioAnalysis, AudioSegment } from '@/types';

export class AudioAnalyzer {
  private audioContext: AudioContext;
  private audioBuffer: AudioBuffer | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  async analyzeAudio(file: File): Promise<AudioAnalysis> {
    // Load audio file
    const arrayBuffer = await file.arrayBuffer();
    this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    const duration = this.audioBuffer.duration;
    const tempo = await this.detectTempo();
    const beats = await this.detectBeats();
    const mood = await this.detectMood();
    const segments = await this.detectSegments();

    return {
      duration,
      tempo,
      beats,
      mood,
      segments,
    };
  }

  private async detectTempo(): Promise<number> {
    if (!this.audioBuffer) throw new Error('No audio buffer loaded');

    const channelData = this.audioBuffer.getChannelData(0);
    const sampleRate = this.audioBuffer.sampleRate;

    // Use autocorrelation for tempo detection
    const tempo = this.calculateTempoFromAutocorrelation(channelData, sampleRate);
    
    return Math.round(tempo);
  }

  private calculateTempoFromAutocorrelation(signal: Float32Array, sampleRate: number): number {
    const minBPM = 60;
    const maxBPM = 200;
    const minLag = Math.floor((60 / maxBPM) * sampleRate);
    const maxLag = Math.floor((60 / minBPM) * sampleRate);

    // Calculate energy envelope
    const windowSize = 2048;
    const hopSize = 512;
    const energy: number[] = [];

    for (let i = 0; i < signal.length - windowSize; i += hopSize) {
      let sum = 0;
      for (let j = 0; j < windowSize; j++) {
        sum += Math.abs(signal[i + j]);
      }
      energy.push(sum / windowSize);
    }

    // Autocorrelation
    let maxCorr = 0;
    let bestLag = minLag;

    for (let lag = minLag; lag < maxLag && lag < energy.length / 2; lag++) {
      let corr = 0;
      for (let i = 0; i < energy.length - lag; i++) {
        corr += energy[i] * energy[i + lag];
      }
      
      if (corr > maxCorr) {
        maxCorr = corr;
        bestLag = lag;
      }
    }

    // Convert lag to BPM
    const tempo = (60 * sampleRate) / (bestLag * hopSize);
    return tempo;
  }

  private async detectBeats(): Promise<number[]> {
    if (!this.audioBuffer) throw new Error('No audio buffer loaded');

    const channelData = this.audioBuffer.getChannelData(0);
    const sampleRate = this.audioBuffer.sampleRate;
    const beats: number[] = [];

    // Calculate spectral flux for onset detection
    const fftSize = 2048;
    const hopSize = 512;
    const spectralFlux: number[] = [];
    
    let prevSpectrum: number[] = new Array(fftSize / 2).fill(0);

    for (let i = 0; i < channelData.length - fftSize; i += hopSize) {
      const frame = channelData.slice(i, i + fftSize);
      const spectrum = this.calculateSpectrum(frame);
      
      // Calculate spectral flux (change in spectrum)
      let flux = 0;
      for (let j = 0; j < spectrum.length; j++) {
        const diff = spectrum[j] - prevSpectrum[j];
        flux += diff > 0 ? diff : 0;
      }
      
      spectralFlux.push(flux);
      prevSpectrum = spectrum;
    }

    // Peak picking on spectral flux
    const threshold = this.calculateAdaptiveThreshold(spectralFlux);
    
    for (let i = 1; i < spectralFlux.length - 1; i++) {
      if (
        spectralFlux[i] > threshold &&
        spectralFlux[i] > spectralFlux[i - 1] &&
        spectralFlux[i] > spectralFlux[i + 1]
      ) {
        const timeInSeconds = (i * hopSize) / sampleRate;
        beats.push(timeInSeconds);
      }
    }

    return beats;
  }

  private calculateSpectrum(frame: Float32Array): number[] {
    const fftSize = frame.length;
    const spectrum: number[] = [];
    
    // Simple magnitude spectrum calculation
    for (let k = 0; k < fftSize / 2; k++) {
      let real = 0;
      let imag = 0;
      
      for (let n = 0; n < fftSize; n++) {
        const angle = (2 * Math.PI * k * n) / fftSize;
        real += frame[n] * Math.cos(angle);
        imag -= frame[n] * Math.sin(angle);
      }
      
      spectrum.push(Math.sqrt(real * real + imag * imag));
    }
    
    return spectrum;
  }

  private calculateAdaptiveThreshold(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return mean + 0.5 * stdDev;
  }

  private async detectMood(): Promise<AudioAnalysis['mood']> {
    if (!this.audioBuffer) throw new Error('No audio buffer loaded');

    const channelData = this.audioBuffer.getChannelData(0);
    
    // Extract features for mood classification
    const features = await this.extractMoodFeatures(channelData);
    
    // Simple mood classification based on features
    const { energy, valence, arousal } = features;
    
    if (energy > 0.7 && arousal > 0.6) return 'energetic';
    if (energy > 0.6 && valence > 0.5) return 'upbeat';
    if (energy > 0.6 && valence < 0.4) return 'intense';
    if (energy < 0.4 && valence < 0.4) return 'melancholic';
    
    return 'calm';
  }

  private async extractMoodFeatures(signal: Float32Array) {
    // Calculate RMS energy
    let energy = 0;
    for (let i = 0; i < signal.length; i++) {
      energy += signal[i] * signal[i];
    }
    energy = Math.sqrt(energy / signal.length);

    // Estimate valence (positivity) from spectral centroid
    const valence = Math.random() * 0.3 + 0.4; // Placeholder - would need more complex analysis

    // Estimate arousal from zero crossing rate
    let zeroCrossings = 0;
    for (let i = 1; i < signal.length; i++) {
      if ((signal[i] >= 0 && signal[i - 1] < 0) || (signal[i] < 0 && signal[i - 1] >= 0)) {
        zeroCrossings++;
      }
    }
    const arousal = Math.min(zeroCrossings / signal.length * 100, 1);

    return { energy, valence, arousal };
  }

  private async detectSegments(): Promise<AudioSegment[]> {
    if (!this.audioBuffer) throw new Error('No audio buffer loaded');

    const duration = this.audioBuffer.duration;
    const channelData = this.audioBuffer.getChannelData(0);
    const sampleRate = this.audioBuffer.sampleRate;
    
    // Simplified segmentation based on energy changes
    const windowSize = 2 * sampleRate; // 2 second windows
    const segments: AudioSegment[] = [];
    
    let currentSegmentStart = 0;
    let prevEnergy = 0;
    
    for (let i = 0; i < channelData.length; i += windowSize) {
      const window = channelData.slice(i, Math.min(i + windowSize, channelData.length));
      
      // Calculate window energy
      let energy = 0;
      for (let j = 0; j < window.length; j++) {
        energy += window[j] * window[j];
      }
      energy = Math.sqrt(energy / window.length);
      
      // Detect significant energy change
      const energyChange = Math.abs(energy - prevEnergy);
      
      if (energyChange > 0.1 && i > 0) {
        const segmentEnd = i / sampleRate;
        segments.push({
          start: currentSegmentStart,
          end: segmentEnd,
          type: this.classifySegmentType(segments.length, duration),
          intensity: prevEnergy,
        });
        currentSegmentStart = segmentEnd;
      }
      
      prevEnergy = energy;
    }
    
    // Add final segment
    if (currentSegmentStart < duration) {
      segments.push({
        start: currentSegmentStart,
        end: duration,
        type: 'outro',
        intensity: prevEnergy,
      });
    }
    
    return segments;
  }

  private classifySegmentType(index: number, totalDuration: number): AudioSegment['type'] {
    // Simple heuristic classification
    if (index === 0) return 'intro';
    if (index === 1) return 'verse';
    if (index % 3 === 0) return 'chorus';
    if (index % 5 === 0) return 'bridge';
    return 'verse';
  }
}
