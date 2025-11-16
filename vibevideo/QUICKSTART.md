# Quick Start Guide

## Getting Your App Running in 5 Minutes

### Step 1: Install Dependencies (1 minute)
```bash
cd vibe-video-generator
npm install
```

### Step 2: Start Development Server (30 seconds)
```bash
npm run dev
```

Wait for this message:
```
- Local:        http://localhost:3000
- Ready in X.Xs
```

### Step 3: Open in Browser (10 seconds)
Go to: http://localhost:3000

### Step 4: Test the App (3 minutes)

#### Upload Audio
1. You should see the upload screen
2. Click "Choose Audio File" or drag-and-drop
3. Select any music file (MP3, WAV, M4A)
4. Wait ~5-10 seconds for analysis

#### Configure Video
1. You'll see AI-suggested tags based on your music
2. Click on tags to select them (up to 5)
3. Watch the video counts appear next to each tag
4. Choose a creativity level (try "High" for maximum effects)
5. Verify the total available videos is 5,000+
6. Click "Generate Music Video"

#### Watch Generation
1. Progress bar will show the generation process
2. App searches Pexels for clips
3. Creates beat-aligned timeline
4. Should complete in ~30-60 seconds

#### See Results
1. Currently shows placeholder editor screen
2. This confirms the generation completed successfully!

## What's Working (Phase 1)

✅ **Audio Upload & Analysis**
- Detects beats, tempo, mood
- Shows duration and BPM
- Calculates optimal clip lengths

✅ **Smart Tag System**
- AI suggests tags based on music
- Shows video counts for each tag
- Validates 5,000+ total videos
- Reroll for new suggestions

✅ **Video Generation**
- Searches Pexels API
- Fetches clips from tag combinations
- Aligns clips to beats
- Creates complete timeline
- Respects creativity settings

## What's Coming (Phase 2)

⏳ **Full Editor**
- Live video preview
- Swap individual clips
- Apply effects (brightness, contrast, saturation)
- Add transitions
- Insert text overlays
- Volume controls
- Export to MP4

## Testing Tips

### Good Test Audio Files
- **Energetic**: EDM, dance music (120-140 BPM)
- **Calm**: Lo-fi, ambient (60-90 BPM)
- **Varied**: Pop with distinct intro/verse/chorus
- **Duration**: 1-3 minutes works best for testing

### Good Tag Combinations
- **Party vibe**: "neon lights", "dance floor", "festival", "city skyline", "crowd"
- **Nature**: "sunset", "ocean", "mountains", "forest", "clouds"
- **Urban**: "city lights", "traffic", "skyscraper", "urban", "street"
- **Chill**: "beach", "hammock", "sunset", "peaceful", "nature"

### Expected Behavior
- **Tag counts update** when you add/remove tags
- **Total available** should show immediately
- **Generation** takes 30-60 seconds
- **Error handling** shows red toast if something fails

## Troubleshooting

### "Not enough videos available"
- **Cause**: Tag combination too specific
- **Fix**: Try more general tags or use AI suggestions

### "Failed to analyze audio"
- **Cause**: Unsupported audio format or corrupt file
- **Fix**: Try a different file (MP3 works best)

### Audio analysis seems stuck
- **Cause**: Large file or slow browser
- **Fix**: Try a shorter clip or different browser (Chrome recommended)

### Tags not showing counts
- **Cause**: API rate limit or network issue
- **Fix**: Wait 30 seconds and try again

### Can't proceed to generation
- **Cause**: Need 5 tags AND 5,000+ total videos
- **Fix**: Add more tags or adjust existing ones

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

## Browser Console

Open browser DevTools (F12) to see:
- Audio analysis progress
- API request details
- Beat detection data
- Video generation logs
- Any errors

## Next Steps

Once you've confirmed Phase 1 works:

1. **Test on different music genres**
   - Try EDM, pop, classical, hip-hop
   - Note which moods/tempos work best

2. **Experiment with tags**
   - Test different combinations
   - See which generate best diversity

3. **Deploy to Vercel**
   - Follow DEPLOYMENT.md
   - Share with friends for feedback

4. **Start Phase 2 development**
   - Build the editor screen
   - Add FFmpeg for video export
   - Implement clip swapping
   - Add effects and transitions

## Questions?

Check:
- README.md - Full documentation
- DEPLOYMENT.md - Deployment guide
- Code comments - Inline explanations
- Browser console - Debug information

---

**Enjoy creating vibe videos!** 🎵🎬
