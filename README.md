# Zero Food Hero 🍽️

An AI-powered food redistribution platform that connects surplus food with people who need it most. Built with Next.js 14, TypeScript, and cutting-edge AI technology.

## 🌟 Features

### 🤖 AI-Powered Food Classification
- **Teachable Machine Integration**: Automatically classify food items from photos
- **Smart Quantity Estimation**: AI estimates food quantities and expiry dates
- **Confidence Scoring**: Get AI confidence levels for classifications

### 📱 Multi-Role Dashboards
- **Donor Dashboard**: Upload food with drag-and-drop, QR code generation, real-time tracking
- **Volunteer Hub**: Interactive map with mission claiming, optimized routing
- **NGO Portal**: Real-time alerts, distribution logging, impact reports

### 🗺️ Real-Time Features
- **Live Tracking**: Real-time donation status updates
- **Interactive Maps**: Google Maps integration for location-based services
- **Instant Notifications**: Real-time alerts for new donations and status changes

### 📊 Impact Analytics
- **Comprehensive Reports**: PDF generation with detailed impact metrics
- **Visual Dashboards**: Beautiful charts and statistics
- **Carbon Footprint Tracking**: Environmental impact measurement

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **AI/ML**: Teachable Machine, TensorFlow.js
- **Backend**: Next.js API Routes, Firebase/Supabase
- **Authentication**: NextAuth.js
- **Maps**: Google Maps API
- **UI/UX**: Framer Motion, Lucide React, React Dropzone
- **PDF Generation**: jsPDF
- **Real-time**: Firebase Firestore

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/zero-food-hero.git
   cd zero-food-hero
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # NextAuth Configuration
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000

   # Google Maps API
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

   # Teachable Machine Model URL
   NEXT_PUBLIC_TEACHABLE_MACHINE_MODEL_URL=your_model_url
   ```

4. **Set up Firebase (Optional for development)**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools

   # Login to Firebase
   firebase login

   # Initialize Firebase
   firebase init

   # Start Firebase emulators
   firebase emulators:start
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### For Donors
1. Navigate to `/donor/dashboard`
2. Drag and drop food images or click to upload
3. AI will automatically classify and estimate quantities
4. Review and edit details if needed
5. Save donation and get QR code for tracking

### For Volunteers
1. Navigate to `/volunteer/hub`
2. View available missions on the interactive map
3. Claim missions based on your location
4. Track pickup and delivery progress
5. Complete missions and earn points

### For NGOs
1. Navigate to `/ngo/portal`
2. Monitor real-time food alerts
3. Log distributions and track impact
4. Generate comprehensive reports
5. Manage volunteer network

## 🤖 AI Model Setup

### Using Teachable Machine
1. Go to [Teachable Machine](https://teachablemachine.withgoogle.com/)
2. Create a new image project
3. Train your model with food categories:
   - Bread & Baked Goods
   - Fruits & Vegetables
   - Dairy Products
   - Meat & Fish
   - Canned Goods
   - Other
4. Export the model and get the model URL
5. Update `NEXT_PUBLIC_TEACHABLE_MACHINE_MODEL_URL` in your environment variables

### Custom Model Training
For better accuracy, consider training with:
- Various lighting conditions
- Different angles and perspectives
- Multiple food brands and packaging
- Expired vs fresh food items

## 🗺️ Google Maps Integration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Maps JavaScript API
4. Create API credentials
5. Add the API key to your environment variables

## 🔧 Development

### Project Structure
```
zero-food-hero/
├── app/
│   ├── components/          # Reusable UI components
│   ├── donor/              # Donor dashboard pages
│   ├── volunteer/          # Volunteer hub pages
│   ├── ngo/               # NGO portal pages
│   ├── lib/               # Utility functions and services
│   ├── types/             # TypeScript type definitions
│   └── globals.css        # Global styles
├── public/                # Static assets
└── package.json           # Dependencies and scripts
```

### Key Components
- **AI Service**: Handles food classification and predictions
- **Firebase Service**: Manages real-time data and authentication
- **Utils**: Common utility functions for formatting, validation, etc.
- **Types**: TypeScript interfaces for type safety

### Adding New Features
1. Create new pages in appropriate directories
2. Add TypeScript types in `app/types/`
3. Create utility functions in `app/lib/`
4. Update navigation in `app/components/Navigation.tsx`

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests (when implemented)
npm run test
```

## 📱 Mobile Responsiveness

The app is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🌍 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Teachable Machine](https://teachablemachine.withgoogle.com/) for AI model training
- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide React](https://lucide.dev/) for icons

## 📞 Support

For support, email support@zerofoodhero.com or join our Slack channel.

---

**Made with ❤️ for a better world**
