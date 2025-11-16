'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { AudioAnalyzer } from '@/utils/audioAnalyzer';
import { PexelsService } from '@/utils/pexelsService';
import type { TagCount } from '@/types';

export function ConfigureScreen() {
  const { project, updateProject, setCurrentStep, setProcessing, setError } = useApp();
  
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [tagCounts, setTagCounts] = useState<TagCount[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const pexelsService = new PexelsService();

  // Generate AI suggestions when audio is analyzed
  useEffect(() => {
    if (project.audioAnalysis && aiSuggestions.length === 0) {
      const suggestions = pexelsService.getSuggestedTags(
        project.audioAnalysis.mood,
        project.audioAnalysis.tempo
      );
      setAiSuggestions(suggestions);
    }
  }, [project.audioAnalysis]);

  // Update tag counts when tags change
  useEffect(() => {
    if (project.selectedTags.length > 0) {
      updateTagCounts();
    }
  }, [project.selectedTags, project.orientation]);

  const updateTagCounts = async () => {
    try {
      const counts = await pexelsService.getTagCounts(
        project.selectedTags,
        project.orientation
      );
      setTagCounts(counts);

      const total = await pexelsService.getTotalAvailableVideos(
        project.selectedTags,
        project.orientation
      );
      setTotalAvailable(total);
    } catch (error) {
      console.error('Error updating tag counts:', error);
    }
  };

  const handleReroll = async () => {
    setIsLoadingSuggestions(true);
    try {
      // Simulate getting fresh suggestions (in real implementation, could use different algorithm)
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (project.audioAnalysis) {
        const allTags = pexelsService.getSuggestedTags(
          project.audioAnalysis.mood,
          project.audioAnalysis.tempo
        );
        
        // Get a different set
        const shuffled = allTags.sort(() => Math.random() - 0.5);
        setAiSuggestions(shuffled.slice(0, 8));
      }
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleTagClick = (tag: string) => {
    if (project.selectedTags.includes(tag)) {
      updateProject({
        selectedTags: project.selectedTags.filter((t) => t !== tag),
      });
    } else if (project.selectedTags.length < 5) {
      updateProject({
        selectedTags: [...project.selectedTags, tag],
      });
    }
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !project.selectedTags.includes(customTag.trim())) {
      if (project.selectedTags.length < 5) {
        updateProject({
          selectedTags: [...project.selectedTags, customTag.trim()],
        });
        setCustomTag('');
      }
    }
  };

  const handleGenerate = async () => {
    if (totalAvailable < 5000) {
      setError('Not enough videos available. Please adjust your tags to have at least 5,000 total videos available.');
      return;
    }

    setCurrentStep('generating');
  };

  const getAvgClipDuration = () => {
    const settings = {
      low: 8.5,
      medium: 5.5,
      high: 3,
    };
    return settings[project.creativityLevel] || 4;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <button
          onClick={() => setCurrentStep('upload')}
          className="text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Choose Your Vibe</h1>
        <p className="text-gray-600 mb-8">Select up to 5 visual themes for your video</p>

        {/* AI Suggestions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">AI Suggestions</h2>
            <button
              onClick={handleReroll}
              disabled={isLoadingSuggestions}
              className="btn-secondary py-2 px-4 text-sm"
            >
              {isLoadingSuggestions ? 'Loading...' : 'Reroll'}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {aiSuggestions.map((tag) => {
              const count = tagCounts.find((tc) => tc.tag === tag)?.count || 0;
              const isSelected = project.selectedTags.includes(tag);
              
              return (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={isSelected ? 'tag-pill' : 'tag-pill-suggestion'}
                  disabled={!isSelected && project.selectedTags.length >= 5}
                >
                  {tag} {count > 0 && `(${count > 2000 ? '2000+' : count})`}
                  {isSelected && (
                    <span className="cursor-pointer" onClick={(e) => {
                      e.stopPropagation();
                      handleTagClick(tag);
                    }}>
                      ✕
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Tag Input */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Custom Tag</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
              placeholder="Enter a custom tag..."
              className="input-field"
              disabled={project.selectedTags.length >= 5}
            />
            <button
              onClick={handleAddCustomTag}
              disabled={!customTag.trim() || project.selectedTags.length >= 5}
              className="btn-primary"
            >
              +
            </button>
          </div>
        </div>

        {/* Selected Tags */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Selected Tags ({project.selectedTags.length}/5)
          </h2>
          
          {project.selectedTags.length === 0 ? (
            <p className="text-gray-500">No tags selected yet</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {project.selectedTags.map((tag) => (
                <div key={tag} className="tag-pill">
                  {tag}
                  <button
                    onClick={() => handleTagClick(tag)}
                    className="hover:bg-white/20 rounded-full p-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Creativity Level */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Creativity Level</h2>
          <p className="text-gray-600 mb-4">Control how creative the visual effects should be</p>
          
          <div className="grid grid-cols-3 gap-4">
            {(['low', 'medium', 'high'] as const).map((level) => (
              <button
                key={level}
                onClick={() => updateProject({ creativityLevel: level })}
                className={`py-4 px-6 rounded-lg border-2 font-semibold capitalize transition-all ${
                  project.creativityLevel === level
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          
          <p className="text-sm text-gray-600 mt-4">
            {project.creativityLevel === 'high' &&
              'Bold effects, duplications, color shifts, maximum creativity'}
            {project.creativityLevel === 'medium' &&
              'Balanced mix of effects and transitions'}
            {project.creativityLevel === 'low' &&
              'Minimal effects, longer clips, subtle transitions'}
          </p>
        </div>

        {/* Audio Analysis Summary */}
        {project.audioAnalysis && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Audio Analysis</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Duration:</span>{' '}
                <span className="font-medium">{Math.round(project.audioAnalysis.duration)}s</span>
              </div>
              <div>
                <span className="text-gray-600">Tempo:</span>{' '}
                <span className="font-medium">{project.audioAnalysis.tempo} BPM</span>
              </div>
              <div>
                <span className="text-gray-600">Mood:</span>{' '}
                <span className="font-medium capitalize">{project.audioAnalysis.mood}</span>
              </div>
              <div>
                <span className="text-gray-600">Avg clip:</span>{' '}
                <span className="font-medium">{getAvgClipDuration()}s</span>
              </div>
            </div>
          </div>
        )}

        {/* Total Available Videos Warning */}
        {project.selectedTags.length > 0 && (
          <div className={`mb-8 p-4 rounded-lg ${totalAvailable >= 5000 ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <p className="font-medium">
              Total available videos: {totalAvailable.toLocaleString()}
            </p>
            {totalAvailable < 5000 && (
              <p className="text-sm text-yellow-800 mt-1">
                ⚠️ Need at least 5,000 total videos for good diversity. Try different tags.
              </p>
            )}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={project.selectedTags.length === 0 || totalAvailable < 5000}
          className="btn-primary w-full text-lg py-4"
        >
          Generate Music Video
        </button>
      </div>
    </div>
  );
}
