# System Architecture & Data Flow

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Next.js App (Client-Side)              │    │
│  │                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │    │
│  │  │   Upload     │→ │  Configure   │→ │ Generating│ │    │
│  │  │   Screen     │  │   Screen     │  │  Screen   │ │    │
│  │  └──────────────┘  └──────────────┘  └───────────┘ │    │
│  │         ↓                 ↓                  ↓       │    │
│  │  ┌────────────────────────────────────────────────┐ │    │
│  │  │           AppContext (State Manager)           │ │    │
│  │  └────────────────────────────────────────────────┘ │    │
│  │         ↓                 ↓                  ↓       │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │    │
│  │  │   Audio     │  │   Pexels    │  │    Video    │ │    │
│  │  │  Analyzer   │  │   Service   │  │  Generator  │ │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │    │
│  │         ↓                 ↓                  ↓       │    │
│  └─────────────────────────────────────────────────────┘    │
│           ↓                 ↓                  ↓            │
│     Web Audio API    Pexels REST API    Timeline Engine    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## User Flow

```
START
  │
  ├─→ [Upload Screen]
  │     │
  │     ├─ User drags/clicks to upload audio
  │     │
  │     ├─ AudioAnalyzer.analyzeAudio(file)
  │     │    ├─ Decode audio buffer
  │     │    ├─ Detect beats via spectral flux
  │     │    ├─ Calculate tempo via autocorrelation
  │     │    ├─ Detect mood via energy/valence/arousal
  │     │    └─ Segment into intro/verse/chorus/etc
  │     │
  │     └─→ Analysis complete → Navigate to Configure
  │
  ├─→ [Configure Screen]
  │     │
  │     ├─ Display audio analysis results
  │     │    └─ Show: Duration, BPM, Mood, Avg Clip Length
  │     │
  │     ├─ Generate AI tag suggestions
  │     │    └─ PexelsService.getSuggestedTags(mood, tempo)
  │     │
  │     ├─ User selects/adds tags (max 5)
  │     │
  │     ├─ For each tag change:
  │     │    ├─ PexelsService.getTagCount(tag)
  │     │    └─ Update displayed counts
  │     │
  │     ├─ Validate total >= 5,000 videos
  │     │
  │     ├─ User selects creativity level
  │     │
  │     └─→ Click "Generate" → Navigate to Generating
  │
  ├─→ [Generating Screen]
  │     │
  │     ├─ Calculate clips needed
  │     │    └─ duration / avgClipLength = N clips
  │     │
  │     ├─ Fetch videos from Pexels
  │     │    └─ PexelsService.fetchVideosWithDiversity()
  │     │         ├─ Generate tag combinations (5→4→3→2→1)
  │     │         ├─ Search each combination
  │     │         ├─ Distribute fetches across tiers
  │     │         └─ Return N×3 videos for variety
  │     │
  │     ├─ Generate timeline
  │     │    └─ VideoGenerator.generateVideoTimeline()
  │     │         ├─ For each clip position:
  │     │         │    ├─ Find next beat
  │     │         │    ├─ Calculate optimal duration
  │     │         │    ├─ Select video from library
  │     │         │    ├─ Assign transition
  │     │         │    └─ Apply effects (if random < probability)
  │     │         └─ Return VideoClip[]
  │     │
  │     └─→ Timeline created → Navigate to Edit
  │
  └─→ [Edit Screen] (Placeholder in Phase 1)
        │
        └─ Display success message
```

## Data Flow Diagram

```
Audio File
    │
    ↓
┌────────────────┐
│ Web Audio API  │ → ArrayBuffer → AudioBuffer
└────────────────┘
    │
    ↓
┌──────────────────┐
│  AudioAnalyzer   │
└──────────────────┘
    │
    ├─→ calculateTempoFromAutocorrelation()
    │       └─→ tempo: 120 BPM
    │
    ├─→ detectBeats()
    │       └─→ beats: [0.5, 1.0, 1.5, 2.0, ...]
    │
    ├─→ detectMood()
    │       └─→ mood: "energetic"
    │
    └─→ detectSegments()
            └─→ segments: [{start:0, end:10, type:"intro"}, ...]
    
    ↓
    
AudioAnalysis
    │
    └─→ Saved to AppContext
    
    ↓
    
┌──────────────────┐
│  PexelsService   │
└──────────────────┘
    │
    ├─→ getSuggestedTags(mood, tempo)
    │       └─→ tags: ["neon lights", "dance floor", ...]
    │
    ├─→ getTagCounts(selectedTags)
    │       └─→ tagCounts: [{tag:"neon lights", count:2600}, ...]
    │
    └─→ fetchVideosWithDiversity(tags, orientation, totalNeeded)
            │
            ├─→ generateTagCombinations()
            │       └─→ [
            │             ["tag1","tag2","tag3","tag4","tag5"],
            │             ["tag1","tag2","tag3","tag4"],
            │             ["tag1","tag2","tag3"],
            │             ...
            │           ]
            │
            └─→ For each combination:
                    └─→ searchByTag() → PexelsVideo[]
    
    ↓
    
PexelsVideo[]
    │
    └─→ Passed to VideoGenerator
    
    ↓
    
┌──────────────────┐
│  VideoGenerator  │
└──────────────────┘
    │
    └─→ generateVideoTimeline(analysis, videos, creativity)
            │
            ├─→ settings = creativitySettings[creativity]
            │
            └─→ Loop from 0 to audioDuration:
                    │
                    ├─→ calculateClipDuration(currentTime, analysis, settings)
                    │       │
                    │       ├─→ Find next beat
                    │       ├─→ Check segment boundaries
                    │       └─→ Return duration in [min, max] range
                    │
                    ├─→ selectTransition(creativity)
                    │       └─→ transition: "fade" | "zoom" | ...
                    │
                    ├─→ generateRandomEffects(creativity)
                    │       └─→ effects: {brightness, contrast, saturation}
                    │
                    └─→ Create VideoClip
                            └─→ {
                                  id, pexelsVideo, startTime, 
                                  endTime, duration, vibe,
                                  effects, transition, volume
                                }
    
    ↓
    
VideoClip[]
    │
    └─→ Saved to AppContext as GeneratedVideo
```

## State Management Flow

```
┌──────────────────────────────────────────────────────────┐
│                     AppContext                            │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  currentStep: "upload" | "configure" | "generating" | ... │
│                                                           │
│  project: {                                               │
│    audioFile: File | null                                │
│    audioAnalysis: AudioAnalysis | null                   │
│    selectedTags: string[]                                │
│    creativityLevel: "low" | "medium" | "high"           │
│    orientation: "horizontal" | "vertical"                │
│    introLength: number                                   │
│    outroLength: number                                   │
│    includeImages: boolean                                │
│    userUploadedClips: File[]                             │
│    userUploadedImages: File[]                            │
│  }                                                        │
│                                                           │
│  generatedVideo: {                                        │
│    clips: VideoClip[]                                    │
│    totalDuration: number                                 │
│    audioFile: File                                       │
│  } | null                                                │
│                                                           │
│  masterControls: {                                        │
│    volume: number                                        │
│    introScreen: { duration: number, content?: string }  │
│    textOverlays: TextOverlay[]                          │
│  }                                                        │
│                                                           │
│  isProcessing: boolean                                   │
│  error: string | null                                    │
│                                                           │
└──────────────────────────────────────────────────────────┘
         ↑                    ↑                    ↑
         │                    │                    │
         │                    │                    │
    UploadScreen      ConfigureScreen      GeneratingScreen
```

## Component Hierarchy

```
App (page.tsx)
│
├─ AppProvider (AppContext)
│   │
│   └─ AppContent
│       │
│       ├─ Error Toast (conditional)
│       │
│       ├─ Loading Overlay (conditional)
│       │
│       └─ Screen Router
│           │
│           ├─ UploadScreen
│           │   ├─ File input
│           │   ├─ Drag & drop zone
│           │   └─ How it works info
│           │
│           ├─ ConfigureScreen
│           │   ├─ AI Suggestions section
│           │   │   ├─ Suggested tag pills
│           │   │   └─ Reroll button
│           │   │
│           │   ├─ Custom Tag Input
│           │   │
│           │   ├─ Selected Tags (1/5)
│           │   │   └─ Tag pills with remove
│           │   │
│           │   ├─ Creativity Level selector
│           │   │   └─ Low/Medium/High buttons
│           │   │
│           │   ├─ Audio Analysis summary
│           │   │
│           │   ├─ Total Videos warning
│           │   │
│           │   └─ Generate button
│           │
│           ├─ GeneratingScreen
│           │   ├─ Progress bar
│           │   ├─ Status message
│           │   └─ Loading spinner
│           │
│           └─ Edit Screen (placeholder)
│               └─ Success message
```

## API Integration Pattern

```
Component
    │
    └─→ Calls utility function
            │
            ├─→ PexelsService method
            │       │
            │       └─→ axios.get("https://api.pexels.com/...")
            │               │
            │               ├─ Headers: { Authorization: API_KEY }
            │               │
            │               └─→ Response
            │                       │
            │                       └─→ Mapped to TypeScript types
            │
            └─→ Returns typed data to component
                    │
                    └─→ Component updates state via AppContext
```

## Creativity Settings Matrix

```
┌──────────────┬─────────┬─────────┬─────────┐
│   Setting    │   Low   │ Medium  │  High   │
├──────────────┼─────────┼─────────┼─────────┤
│ Min Duration │   7s    │   4s    │   2s    │
│ Max Duration │   10s   │   7s    │   4s    │
│ Transition % │   20%   │   50%   │   80%   │
│ Effects %    │   10%   │   30%   │   60%   │
│ Color Shift  │   5%    │   20%   │   40%   │
└──────────────┴─────────┴─────────┴─────────┘

Estimated clips for 180s (3 min) song:
- Low:    180/8.5  ≈ 21 clips
- Medium: 180/5.5  ≈ 33 clips  
- High:   180/3    ≈ 60 clips
```

## Timeline Generation Algorithm

```
Input:
  - audioAnalysis: { beats, duration, segments, ... }
  - availableVideos: PexelsVideo[]
  - creativityLevel: "low" | "medium" | "high"

Process:
  1. Get creativity settings (min/max duration, probabilities)
  
  2. Initialize: currentTime = introLength
  
  3. While currentTime < (duration - outroLength):
       a. Find upcoming beats after currentTime
       
       b. Check for segment boundary near currentTime
       
       c. Calculate optimal clip duration:
          - Prefer beat alignment
          - Respect segment boundaries
          - Stay within [minDuration, maxDuration]
       
       d. Select video from library (round-robin)
       
       e. Assign transition:
          - Random < transitionProbability?
          - Low: prefer fade/dissolve
          - Medium: mix subtle/dynamic
          - High: any transition
       
       f. Apply effects:
          - Random < effectsProbability?
          - Generate random brightness/contrast/saturation
          - Intensity scales with creativity level
       
       g. Create VideoClip object
       
       h. currentTime += clipDuration
  
  4. Return clips[]

Output:
  - VideoClip[] with beat-aligned timing
```

## Error Handling Flow

```
Try:
  ┌─→ Upload audio
  │    └─→ Catch: "Please upload an audio file"
  │
  ├─→ Analyze audio
  │    └─→ Catch: "Failed to analyze audio file"
  │
  ├─→ Fetch tag counts
  │    └─→ Catch: Log error, show 0 count
  │
  ├─→ Generate video
  │    └─→ Catch: "Failed to generate video"
  │
  └─→ All errors:
       └─→ setError(message)
            └─→ Display red toast
                 └─→ User can dismiss or auto-hide
```

---

This architecture is:
- ✅ **Scalable**: Easy to add new screens/features
- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Testable**: Pure functions in utilities
- ✅ **Type-Safe**: Full TypeScript coverage
- ✅ **Performance**: Client-side processing, no backend needed
