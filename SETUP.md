# Setup Guide for Product Design Studio

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- Lovable API key (for AI image generation)

## Environment Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

The `.env` file already contains your Supabase configuration:

```env
VITE_SUPABASE_PROJECT_ID="irlylsqqjhugnagnmaqq"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://irlylsqqjhugnagnmaqq.supabase.co"
```

### 3. Configure Supabase Edge Functions

The app uses two Supabase Edge Functions that need to be deployed:

#### a. Deploy Edge Functions

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref irlylsqqjhugnagnmaqq

# Deploy the functions
supabase functions deploy generate-design-png
supabase functions deploy generate-listing
```

#### b. Set Secrets for Edge Functions

You need to set the `LOVABLE_API_KEY` secret for the edge functions:

```bash
supabase secrets set LOVABLE_API_KEY=your_lovable_api_key_here
```

**To get a Lovable API key:**
1. Visit https://lovable.dev
2. Go to your workspace settings
3. Navigate to API Keys section
4. Generate a new API key

## Running the Application

### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Production Build

```bash
npm run build
npm run preview
```

## Features Overview

### 1. Design Selection Interface
- **Inspirations**: Choose from 14 different themes (Diwali, Holi, Christmas, etc.)
- **Product Types**: Select from 15+ product categories (Ornaments, Mugs, T-Shirts, etc.)
- **Color Schemes**: Pick from 8 curated color palettes
- **Design Concepts**: Choose design styles (Minimalist, Ornate, Modern Fusion, etc.)

### 2. AI-Powered Generation
- **Generate PNG**: Creates product designs with transparent backgrounds using AI
- **Generate Listing**: Creates SEO-optimized product descriptions and metadata
- **Background Removal**: Uses Hugging Face Transformers.js for client-side background removal

### 3. Export Functionality
- Export complete design data as JSON
- Download generated PNG images
- Save product listings with metadata

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui (48 components)
- **Styling**: Tailwind CSS
- **Backend**: Supabase Edge Functions
- **AI**: Lovable AI Gateway (Gemini 2.5 Flash)
- **Image Processing**: Hugging Face Transformers.js

## Troubleshooting

### Issue: Edge Functions Not Working

**Solution**: Ensure you've:
1. Deployed the edge functions
2. Set the `LOVABLE_API_KEY` secret
3. Have credits in your Lovable workspace

### Issue: Background Removal Slow

**Solution**: The background removal uses WebGPU and runs in the browser. First load will download the model (~21MB). Subsequent uses will be faster.

### Issue: Build Warnings About Large Chunks

**Solution**: This is expected due to the WASM model for background removal. The warning can be safely ignored or you can increase the chunk size limit in `vite.config.ts`.

## Development Notes

- The app uses client-side background removal, so no server-side processing is needed
- All selections are optional - users can mix and match any combination
- The AI generation requires active Lovable API credits
- Images are processed entirely in the browser for privacy

## Support

For issues or questions:
1. Check the Lovable documentation: https://docs.lovable.dev
2. Review Supabase Edge Functions docs: https://supabase.com/docs/guides/functions
3. Check the GitHub repository issues