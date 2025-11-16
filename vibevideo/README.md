# Vibe Video Generator

An AI-powered music video generator that creates beat-synced videos from stock footage using the Pexels API.

## Features

### Phase 1 (Current Implementation)
- ✅ Audio upload and analysis (beat detection, tempo, mood)
- ✅ AI-suggested tags based on music characteristics
- ✅ Custom tag selection (up to 5 tags)
- ✅ Tag combination search with diversity distribution
- ✅ Creativity levels (Low/Medium/High)
- ✅ Beat-aligned clip placement
- ✅ Automatic video timeline generation
- ✅ Support for user-uploaded clips
- ✅ Orientation selection (horizontal/vertical)

### Phase 2 (Planned)
- ⏳ Full video editor interface
- ⏳ Individual clip editing (swap, effects, transitions)
- ⏳ Text overlays and captions
- ⏳ Intro/outro customization
- ⏳ Master volume controls
- ⏳ Video export with FFmpeg
- ⏳ Real-time preview

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd vibe-video-generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
The `.env.local` file is already configured with the Pexels API key:
```
NEXT_PUBLIC_PEXELS_API_KEY=3jC2EhW72E5a3uokwYKVqselKp1oWcX3Kql1JFWDXbrBNdjWgy6wpWVE
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Vercel will auto-detect Next.js and configure the build settings

4. Add the environment variable in Vercel:
   - Go to Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_PEXELS_API_KEY` with the value from `.env.local`

5. Deploy!

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

3. Deploy:
```bash
netlify deploy --prod
```

4. Set environment variables in Netlify:
   - Go to Site Settings → Environment Variables
   - Add `NEXT_PUBLIC_PEXELS_API_KEY`

### Deploy to Replit

1. Create a new Repl and import from GitHub

2. Replit will auto-detect Next.js

3. Add environment variables in the Secrets tab:
   - Key: `NEXT_PUBLIC_PEXELS_API_KEY`
   - Value: (the API key)

4. Click "Run"

## Project Structure

```
vibe-video-generator/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── UploadScreen.tsx   # Audio upload UI
│   ├── ConfigureScreen.tsx # Tag selection & settings
│   └── GeneratingScreen.tsx # Video generation progress
├── contexts/              # React contexts
│   └── AppContext.tsx     # Global state management
├── types/                 # TypeScript type definitions
│   └── index.ts
├── utils/                 # Utility functions
│   ├── audioAnalyzer.ts   # Beat detection & audio analysis
│   ├── pexelsService.ts   # Pexels API integration
│   └── videoGenerator.ts  # Video timeline generation
├── .env.local             # Environment variables
└── package.json
```

## How It Works

### 1. Audio Analysis
- Uses Web Audio API for beat detection
- Analyzes tempo (BPM), mood, and song structure
- Identifies beat timestamps and intensity changes
- Segments audio into intro/verse/chorus/bridge/outro

### 2. Tag Selection
- AI suggests tags based on mood and tempo
- User selects up to 5 vibes/themes
- System validates minimum 5,000 available videos
- Calculates tag counts and combinations

### 3. Video Generation
- Searches Pexels API with tag combinations
- Distributes clips across 5-tag, 4-tag, 3-tag, 2-tag, 1-tag tiers
- Ensures diversity by requiring percentage from each tier
- Aligns clip changes to detected beats
- Respects segment boundaries (intro/chorus changes)
- Applies creativity-based effects and transitions

### 4. Creativity Levels
- **Low**: 7-10s clips, minimal effects, subtle transitions
- **Medium**: 4-7s clips, balanced effects, mixed transitions
- **High**: 2-4s clips, bold effects, dynamic transitions

## API Rate Limits

The Pexels API has the following limits (free tier):
- 200 requests per hour
- 20,000 requests per month

The app is optimized to minimize API calls by:
- Caching tag counts
- Batch fetching videos
- Using efficient search strategies

## Troubleshooting

### Audio analysis fails
- Ensure the audio file is a valid format (MP3, WAV, M4A, OGG)
- Try a different file
- Check browser console for errors

### Not enough videos found
- Try more general tags
- Reduce specificity of tag combinations
- Use AI suggestions (they're optimized for Pexels library)

### Build errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Next.js cache: `rm -rf .next`
- Ensure Node.js version is 18+

## Future Enhancements

- [ ] Complete video editor with live preview
- [ ] FFmpeg integration for actual video rendering
- [ ] Export to multiple formats (MP4, WebM, GIF)
- [ ] Cloud storage for rendered videos
- [ ] User accounts and project saving
- [ ] Template library
- [ ] Collaboration features
- [ ] Mobile app version

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Audio Analysis**: Web Audio API + Meyda
- **Video Processing**: FFmpeg.wasm (planned)
- **API**: Pexels Video API
- **Deployment**: Vercel/Netlify/Replit

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Contact

For questions or feedback, please open an issue on GitHub.
