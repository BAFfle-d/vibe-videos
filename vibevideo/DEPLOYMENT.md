# Deployment Checklist

## Pre-Deployment

- [ ] Test audio upload and analysis locally
- [ ] Verify Pexels API key works
- [ ] Test tag selection and counting
- [ ] Verify video generation completes successfully
- [ ] Check for console errors
- [ ] Test on different browsers (Chrome, Firefox, Safari)

## Vercel Deployment (Recommended)

### Step 1: Prepare Repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

### Step 2: Push to GitHub
```bash
# Create a new repository on GitHub first, then:
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 3: Deploy on Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js configuration
5. Add environment variable:
   - Name: `NEXT_PUBLIC_PEXELS_API_KEY`
   - Value: `3jC2EhW72E5a3uokwYKVqselKp1oWcX3Kql1JFWDXbrBNdjWgy6wpWVE`
6. Click "Deploy"
7. Wait ~2 minutes for deployment to complete
8. Visit your live URL!

### Vercel CLI (Alternative)
```bash
npm install -g vercel
vercel login
vercel
# Follow prompts
```

## Netlify Deployment

### Step 1: Build
```bash
npm run build
```

### Step 2: Deploy
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Step 3: Set Environment Variables
1. Go to Netlify Dashboard
2. Site Settings → Environment Variables
3. Add `NEXT_PUBLIC_PEXELS_API_KEY`
4. Trigger redeploy if needed

## Replit Deployment

### Step 1: Import to Replit
1. Create new Repl
2. Import from GitHub or upload files
3. Replit detects Next.js automatically

### Step 2: Configure
1. Add environment variable in Secrets:
   - `NEXT_PUBLIC_PEXELS_API_KEY`
2. Click "Run"

### Step 3: Make Public
1. Click the URL at top
2. Share the link

## Post-Deployment Testing

- [ ] Upload a test audio file
- [ ] Verify audio analysis displays correct BPM/mood
- [ ] Check AI tag suggestions appear
- [ ] Select 5 tags and verify counts load
- [ ] Generate a test video
- [ ] Verify clips are loaded and timeline is created
- [ ] Test on mobile devices
- [ ] Check page load speed (should be <3s)

## Monitoring

### Vercel
- Analytics: https://vercel.com/<your-project>/analytics
- Logs: https://vercel.com/<your-project>/logs
- Deployments: https://vercel.com/<your-project>/deployments

### Netlify
- Analytics: Site Dashboard → Analytics
- Deploys: Site Dashboard → Deploys
- Functions: Site Dashboard → Functions

## Known Issues & Solutions

### Issue: CORS errors with Pexels API
**Solution**: Pexels API supports CORS, but ensure you're using the correct headers

### Issue: Audio analysis takes too long
**Solution**: This is browser-dependent. Modern Chrome/Firefox work best.

### Issue: FFmpeg headers not set
**Solution**: The Cross-Origin headers are configured in next.config.js

### Issue: Build fails on Vercel
**Solution**: Ensure all dependencies are in package.json, not devDependencies

## Scaling Considerations

### If you get popular:
1. **API Limits**: Pexels free tier = 20k requests/month
   - Monitor usage in Pexels dashboard
   - Consider upgrading to paid tier
   - Implement request caching

2. **Performance**:
   - Enable Vercel Analytics
   - Monitor Core Web Vitals
   - Optimize images/videos if needed

3. **Costs**:
   - Vercel: Free for hobby projects
   - Netlify: Free tier generous
   - Pexels: Free API (with limits)

## Backup & Recovery

### Backup Code
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Rollback on Vercel
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Vercel/Netlify deployment logs
3. Verify environment variables are set
4. Test locally with `npm run dev`
5. Check Pexels API status: https://www.pexels.com/api/

## Success Metrics

Track these to know if your app is working well:
- Audio upload success rate
- Video generation success rate
- Average generation time
- User satisfaction (if you add feedback)
- API request efficiency

---

**Remember**: This is a Phase 1 prototype. The editor screen is a placeholder. Focus on getting the core flow working perfectly before adding more features!
