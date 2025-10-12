# Product Design Studio 🎨

A powerful web application for creating unique product designs by combining various inspirations, product types, color schemes, and design concepts. Generate AI-powered designs with transparent backgrounds and SEO-optimized product listings.

## 🌟 Features

### Design Selection Interface
- **14 Inspiration Themes**: Diwali, Holi, Christmas, Rangoli, Mandala, Lotus, Peacock, Henna, Ganesh, Sanskrit, Nature, Geometric, Floral, Celestial
- **15+ Product Types**: Ornaments, Wreaths, Wall Art, Mugs, T-Shirts, Pillows, Tote Bags, Stickers, Phone Cases, Notebooks, Greeting Cards, and more
- **8 Color Palettes**: Warm Sunset, Cool Ocean, Royal Purple, Forest Green, Festive Red, Elegant Gold, Pastel Dream, Monochrome
- **6 Design Concepts**: Minimalist, Ornate, Modern Fusion, Traditional, Geometric, Abstract

### AI-Powered Generation
- **PNG Generation**: Creates high-quality product designs with transparent backgrounds using Google Gemini 2.5 Flash
- **Background Removal**: Client-side background removal using Hugging Face Transformers.js (no server processing needed)
- **Listing Generation**: Creates SEO-optimized product titles, descriptions, features, tags, and price ranges

### Export & Download
- Download generated PNG images with transparent backgrounds
- Export complete design data as JSON (includes selections, images, and listings)
- Save product listings with all metadata

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)
- Lovable API key (for AI generation)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/leylabernie/combine-canvas.git
cd combine-canvas
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

The `.env` file is already configured with Supabase credentials. You just need to set up the Lovable API key in Supabase.

4. **Deploy Supabase Edge Functions**
```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref irlylsqqjhugnagnmaqq

# Deploy functions
supabase functions deploy generate-design-png
supabase functions deploy generate-listing

# Set API key secret
supabase secrets set LOVABLE_API_KEY=your_lovable_api_key_here
```

5. **Run the development server**
```bash
npm run dev
```

Visit `http://localhost:5173` to see the app in action!

## 📖 Documentation

- **[Setup Guide](SETUP.md)**: Detailed setup instructions and troubleshooting
- **[Deployment Guide](DEPLOYMENT.md)**: Deploy to Lovable, Vercel, Netlify, or GitHub Pages
- **[Lovable Project](https://lovable.dev/projects/f9e68719-d02b-4a63-b570-e66e140ad68c)**: Edit and deploy via Lovable

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui (48 components)
- **Styling**: Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno)
- **AI**: Lovable AI Gateway (Google Gemini 2.5 Flash)
- **Image Processing**: Hugging Face Transformers.js (WebGPU)
- **State Management**: React Hooks
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod

## 📁 Project Structure

```
combine-canvas/
├── src/
│   ├── components/
│   │   └── ui/              # 48 shadcn/ui components
│   ├── pages/
│   │   ├── Index.tsx        # Main design studio page
│   │   └── NotFound.tsx     # 404 page
│   ├── utils/
│   │   └── backgroundRemoval.ts  # Client-side background removal
│   ├── integrations/
│   │   └── supabase/        # Supabase client configuration
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   └── App.tsx              # Main app component
├── supabase/
│   └── functions/
│       ├── generate-design-png/   # AI image generation
│       └── generate-listing/      # AI listing generation
├── public/                  # Static assets
├── SETUP.md                 # Setup guide
├── DEPLOYMENT.md            # Deployment guide
└── README.md                # This file
```

## 🎯 How It Works

1. **Select Design Elements**: Choose from inspirations, product types, colors, and design concepts
2. **Generate Design**: Click "Generate PNG" to create an AI-powered design
3. **Background Removal**: The app automatically removes the background using client-side processing
4. **Generate Listing**: Create SEO-optimized product descriptions and metadata
5. **Export**: Download your PNG or export the complete design data as JSON

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Quality

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting (configured in ESLint)
- All major linting errors fixed (only minor fast-refresh warnings remain)

## 🚢 Deployment

### Deploy via Lovable (Easiest)
1. Visit https://lovable.dev/projects/f9e68719-d02b-4a63-b570-e66e140ad68c
2. Click **Share** → **Publish**
3. Done! Your app is live

### Other Options
- Vercel: `vercel`
- Netlify: `netlify deploy --prod --dir=dist`
- GitHub Pages: See [DEPLOYMENT.md](DEPLOYMENT.md)

## 🐛 Known Issues & Limitations

1. **First Load**: The background removal model (~21MB WASM) downloads on first use, which may take a few seconds
2. **API Credits**: Image and listing generation require Lovable API credits
3. **Browser Compatibility**: Background removal works best in modern browsers with WebGPU support
4. **Bundle Size**: Production build is ~1.3MB due to the WASM model (this is expected)

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome! Feel free to:
- Open issues for bugs or feature requests
- Submit pull requests with improvements
- Share your generated designs

## 📄 License

This project is private and not licensed for public use.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- AI powered by [Google Gemini](https://deepmind.google/technologies/gemini/)
- Background removal by [Hugging Face Transformers.js](https://huggingface.co/docs/transformers.js)
- Backend by [Supabase](https://supabase.com)

## 📞 Support

For issues or questions:
1. Check [SETUP.md](SETUP.md) for setup help
2. Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help
3. Review [Lovable documentation](https://docs.lovable.dev)
4. Check [Supabase documentation](https://supabase.com/docs)

---

**Project URL**: https://lovable.dev/projects/f9e68719-d02b-4a63-b570-e66e140ad68c

**Made with ❤️ using Lovable**