# Deployment Guide

## Deployment Options

### Option 1: Deploy via Lovable (Recommended)

The easiest way to deploy this application is through Lovable:

1. Visit your project: https://lovable.dev/projects/f9e68719-d02b-4a63-b570-e66e140ad68c
2. Click on **Share** → **Publish**
3. Your app will be deployed automatically
4. You can connect a custom domain in **Project > Settings > Domains**

### Option 2: Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_PROJECT_ID`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_URL`

4. Ensure Supabase Edge Functions are deployed separately

### Option 3: Deploy to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build the project:
```bash
npm run build
```

3. Deploy:
```bash
netlify deploy --prod --dir=dist
```

4. Set environment variables in Netlify dashboard

### Option 4: Deploy to GitHub Pages

1. Update `vite.config.ts` to set the base path:
```typescript
export default defineConfig({
  base: '/combine-canvas/', // Your repo name
  // ... rest of config
})
```

2. Build:
```bash
npm run build
```

3. Deploy using GitHub Actions or manually push the `dist` folder to `gh-pages` branch

## Pre-Deployment Checklist

- [ ] All environment variables are set
- [ ] Supabase Edge Functions are deployed
- [ ] `LOVABLE_API_KEY` secret is configured in Supabase
- [ ] Production build completes without errors
- [ ] All features tested in production mode

## Post-Deployment

### Verify Functionality

1. **Test Selection Interface**: Ensure all categories are clickable and selections work
2. **Test PNG Generation**: Try generating a design with transparent background
3. **Test Listing Generation**: Generate a product listing
4. **Test Export**: Export the complete design data as JSON
5. **Test Downloads**: Verify PNG downloads work correctly

### Monitor Performance

- Check browser console for any errors
- Monitor Supabase Edge Function logs
- Track API usage in Lovable dashboard
- Monitor page load times (especially first load with WASM model)

### Custom Domain Setup (Lovable)

1. Go to **Project > Settings > Domains**
2. Click **Connect Domain**
3. Follow the DNS configuration instructions
4. Wait for DNS propagation (usually 5-30 minutes)

## Troubleshooting Deployment Issues

### Issue: Environment Variables Not Working

**Solution**: Ensure all `VITE_` prefixed variables are set correctly. Vite only exposes variables with this prefix to the client.

### Issue: Edge Functions 404

**Solution**: 
1. Verify functions are deployed: `supabase functions list`
2. Check function URLs in Supabase dashboard
3. Ensure CORS headers are properly configured

### Issue: Large Bundle Size Warning

**Solution**: This is expected due to the 21MB WASM model for background removal. Consider:
- Using dynamic imports for the background removal feature
- Implementing lazy loading
- Or accept the warning as the feature requires this model

### Issue: API Rate Limits

**Solution**: 
- Monitor your Lovable API usage
- Add credits to your workspace if needed
- Implement rate limiting on the client side
- Consider caching generated results

## Scaling Considerations

### For High Traffic

1. **CDN**: Use a CDN for static assets
2. **Caching**: Implement browser caching for generated images
3. **API Limits**: Monitor and increase Lovable API limits
4. **Database**: Consider upgrading Supabase plan if storing user data

### For Multiple Environments

Create separate Supabase projects for:
- Development
- Staging
- Production

Use different `.env` files for each environment.

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Monitoring

- Set up error tracking (e.g., Sentry)
- Monitor API usage and costs
- Track user analytics
- Monitor edge function performance

## Rollback Procedure

If deployment fails:

1. **Lovable**: Use the version history to rollback
2. **Vercel/Netlify**: Use their dashboard to rollback to previous deployment
3. **Manual**: Keep the previous `dist` folder as backup

## Support Resources

- Lovable Docs: https://docs.lovable.dev
- Supabase Docs: https://supabase.com/docs
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html