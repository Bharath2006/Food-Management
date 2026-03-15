# Deployment Guide for Zero Food Hero

## 🚀 Quick Deploy to Vercel (Recommended)

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to [Vercel](https://vercel.com)**
   - Sign up/Login with your GitHub account
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables (Optional)**
   If you're using Firebase, Google Maps, or other services, add these in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add the following (if needed):
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
     NEXT_PUBLIC_FIREBASE_PROJECT_ID
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
     NEXT_PUBLIC_FIREBASE_APP_ID
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
     NEXTAUTH_SECRET
     NEXTAUTH_URL
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   Follow the prompts to link your project.

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## 🌐 Alternative Deployment Options

### Deploy to Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

4. **Or use Netlify Dashboard**
   - Connect your GitHub repo
   - Build command: `npm run build`
   - Publish directory: `.next`

### Deploy to AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Connect your GitHub repository
3. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
4. Add environment variables if needed
5. Deploy

### Deploy to Railway

1. Go to [Railway](https://railway.app)
2. Create new project from GitHub
3. Add environment variables
4. Railway will auto-detect Next.js and deploy

## 📝 Pre-Deployment Checklist

- [ ] Test the application locally (`npm run dev`)
- [ ] Ensure all dependencies are in `package.json`
- [ ] Check that environment variables are documented
- [ ] Verify that the app works without Firebase (uses localStorage)
- [ ] Test all user flows (Donor, Volunteer, NGO)
- [ ] Ensure responsive design works on mobile

## 🔧 Build Configuration

The project is configured for:
- **Framework**: Next.js 14
- **Node Version**: 18.x or higher (recommended)
- **Build Command**: `npm run build`
- **Output**: Standard Next.js output

## ⚠️ Important Notes

1. **LocalStorage Limitation**: The app currently uses localStorage for data storage. This means:
   - Data is stored in the user's browser
   - Data won't persist across different devices
   - For production, consider migrating to a database (Firebase, Supabase, etc.)

2. **Environment Variables**: 
   - Firebase is optional (app works without it)
   - Google Maps is optional (app uses mock location service)
   - All features work with localStorage fallback

3. **Build Issues**: If you encounter build errors locally:
   - Try deploying directly to Vercel (they handle builds in their environment)
   - The space in folder name "ZERO FOOD HERO" might cause issues locally but not on Vercel

## 🎯 Post-Deployment

1. Test all features on the live site
2. Monitor error logs in Vercel dashboard
3. Set up custom domain (optional) in Vercel settings
4. Enable analytics if needed

## 📞 Support

If you encounter issues during deployment:
- Check Vercel build logs
- Verify environment variables are set correctly
- Ensure all dependencies are listed in `package.json`
- Check Next.js documentation: https://nextjs.org/docs/deployment





