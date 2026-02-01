# HeatSense AI

> **Chennai Community Resilience Platform**

A community-focused web application that provides real-time heatwave risk assessments and **AI-powered personalized health advisories** for families in temporary housing and vulnerable populations. Designed to protect Chennai's communities—especially children, the elderly, and families in metal-sheet homes—through intelligent risk scoring, housing-aware temperature adjustments, advanced weather visualization, and tailored health recommendations powered by **Llama 3.3-70B** via Groq.

---

## ✨ Key Features

### 🌍 **Multi-Language Support**
Full internationalization (i18n) with seamless translation support for:
- 🇬🇧 **English** (Default)
- 🇮🇳 **हिंदी (Hindi)**
- 🇮🇳 **मराठी (Marathi)**
- 🇮🇳 **தமிழ் (Tamil)**

All UI text, error messages, AI-generated advisories, and weather data are dynamically translated. Language preference persists across sessions.

### 🎨 **Adaptive UI**
- **Light & Dark Mode**: Fully responsive theme system with smooth transitions
- **Default Preferences**: New users start with Light Mode and English language
- **Persistent Settings**: User preferences are saved locally and respected across sessions
- **Accessible Design**: WCAG-compliant color contrast and keyboard navigation

### 📊 **Smart Dashboard**
- **Rich Weather Visualization**: 
  - Real-time current weather (temperature, feels-like, humidity, wind speed)
  - **12-Hour Forecast Graph**: Interactive area chart showing temperature trends using Recharts
  - **5-Day Forecast**: Daily weather outlook with icons and conditions
  - Integrated with OpenWeather API for live data
- **Real-Time Heatmap**: 
  - **Hyperlocal Temperature Coverage**: Interactive map showing real-time temperatures for 132+ Indian cities and towns
  - **Open-Meteo Integration**: Free, unlimited API with no rate limits for efficient parallel data fetching
  - **Color-Coded Visualization**: Temperature-based color coding (blue for cool, red for hot) with risk level indicators
  - **Auto-Refresh**: Updates every 10 minutes with client-side caching for optimal performance
- **Housing-Aware Risk Score Calculation**: Intelligent algorithm (0-100 scale) that factors in:
  - Current weather conditions (feels-like temperature, humidity)
  - **Indoor temperature adjustment** based on housing/roof type (metal sheets: +4°C, asbestos: +2°C)
  - User age and occupation/status (including vulnerable groups)
  - Pre-existing health conditions
- **User Profile Display**: Shows name, city, housing type, occupation/status, and health conditions from Supabase
- **Location Logging**: Automatic logging of user location and risk scores to `employee_risk_logs` table
- **Quick Stats Widget**: At-a-glance view of city, risk level, and weather metrics

### 🤖 **AI-Powered Health Advisory**
**Powered by Llama 3.3-70B via Groq** - Context-aware, personalized health recommendations:
- **Intelligent Context Analysis**: 
  - Adapts tone based on temperature (calm for safe temps, urgent for dangerous conditions)
  - **Housing-aware advice**: Specialized cooling tips for metal-sheet roofs, asbestos, concrete homes
  - **Vulnerable group focus**: Tailored advice for pregnant women, seniors, students, and homemakers
  - Peak heat hour awareness (12PM-4PM)
  - **Multi-language generation**: AI generates advisories in user's selected language (English, Hindi, Marathi, Tamil)
- **Comprehensive Recommendations**:
  - 💧 **Hydration Guidelines**: AI-generated fluid intake amounts and frequency (translated)
  - ✅ **Do's & Don'ts**: Personalized action items and avoidances (translated)
  - 🏠 **Home Cooling Tips**: Housing-specific structural cooling advice (e.g., wet gunny bags for tin roofs)
  - 👕 **Clothing Suggestions**: Appropriate attire for heat protection (translated)
  - ⏰ **Activity Management**: Optimal timing for outdoor work and exercise (translated)
  - 🚨 **Warning Signs**: Critical symptoms requiring immediate medical attention (translated)
  - 📞 **Emergency Contacts**: Quick access to local emergency services
- **Performance Optimized**:
  - Session storage caching with 1-hour expiration (Gatekeeper pattern)
  - Request deduplication (prevents parallel API calls)
  - Language-aware caching (separate cache per language)
  - Fallback advisory system if AI service unavailable

### 👤 **User Profile**
- **Comprehensive Onboarding**: Collect age, gender, city, occupation/status, **housing/roof type**, and health conditions
- **Housing Type Options**: Concrete, Metal/Tin Sheet, Asbestos, Tiled, Thatched/Hut
- **Vulnerable Groups Support**: Occupation options include Student, Pregnant, Senior Citizen, Homemaker
- **Terms & Conditions Validation**: Modal-based consent with blur backdrop and lift animation
- **Age Input Constraints**: Validation to ensure data integrity (max 100 years)
- **Secure Data Handling**: Encrypted storage with Supabase backend
- **Dev Mode Fallback**: LocalStorage-based persistence when Supabase is not configured

### 🤝 **Community Support & Resources**
- **Community Organizations**: Information about NGOs and community groups providing heat relief
  - SEEDS India - Cooling materials distribution
  - Mahila Housing Trust - Cool roof installations
  - Eyes on the Canal - Climate resilience projects
- **Emergency Contacts**: Quick access to Tamil Nadu Disaster Management Authority (TNDMA) helplines
  - Disaster Helpline: 1077
  - Ambulance: 108
  - Health Advisory: 104
- **Multi-language Support**: All community resources displayed in user's selected language

### 🔐 **Authentication**
- Email/password signup and login
- Google OAuth integration (when configured)
- Protected routes with automatic redirect
- Session persistence and logout functionality

---

## 🛠️ Tech Stack

### Frontend
- **[React 18](https://react.dev/)** - Modern UI library with hooks
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool and dev server
- **[React Router DOM v6](https://reactrouter.com/)** - Client-side routing and navigation

### Styling & UI
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework with dark mode support
- **[Lucide React](https://lucide.dev/)** - Beautiful, consistent icon library
- **[Recharts](https://recharts.org/)** - Composable charting library for React (12-hour weather forecast)
  - **Note**: Recharts is used in `WeatherGraph.jsx` but may need to be added to `package.json` if not already installed

### Maps & Location
- **[Leaflet](https://leafletjs.com/)** - Open-source JavaScript library for mobile-friendly interactive maps
- **[React Leaflet](https://react-leaflet.js.org/)** - React components for Leaflet maps
- **OpenStreetMap Overpass API** - Query engine for discovering cooling centers and public facilities
- **Google Maps** - Directions and navigation integration

### Internationalization
- **[i18next](https://www.i18next.com/)** - Translation framework
- **[react-i18next](https://react.i18next.com/)** - React bindings for i18next
- **[i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector)** - Automatic language detection

### Backend & Database
- **[Supabase](https://supabase.com/)** - PostgreSQL database, authentication, and real-time subscriptions
- **Database Tables**:
  - `profiles` - User profile data (name, city, occupation, health conditions)
  - `user_settings` - User preferences (theme, language, notifications)
  - `employee_risk_logs` - Location and risk score tracking
- **LocalStorage Fallback** - Dev mode for running without Supabase

### External APIs & AI Services
- **[OpenWeather API](https://openweathermap.org/api)** - Weather data (current + 5-day forecast) and geocoding
- **[Open-Meteo API](https://open-meteo.com/)** - Free, unlimited weather data for heatmap (132+ Indian cities), no API key required
- **[Groq API](https://groq.com/)** - AI-powered health advisories using Llama 3.3-70B
- **OpenStreetMap** - Cooling center discovery via Overpass API and geocoding via Nominatim
- **Google Maps** - Directions integration for navigation to cooling centers

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js** 18.x or higher
- **npm** or **yarn** package manager

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HeatSense-AI-Demo/heatwave-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** *(optional for full functionality)*

   Create a `.env` file in the `heatwave-app/` directory:

   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>

   # Weather API (optional; falls back to mock data if missing)
   VITE_OPENWEATHER_API_KEY=<your-openweather-api-key>

   # Default City (optional; defaults to 'Delhi')
   VITE_DEFAULT_CITY=Delhi

   # AI Service (optional; falls back to default advisory if missing)
   VITE_GROQ_API_KEY=<your-groq-api-key>
   ```

   > **Note**: If Supabase keys are not provided, the app runs in **dev mode** using `localStorage` for authentication and data persistence.

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Open the URL displayed in the terminal (usually `http://localhost:5173`)

5. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

---

## 🚀 Usage

### Application Flow

1. **Landing Page** (`/`) - Introduction and call-to-action
2. **Signup** (`/signup`) - Create a new account
3. **Login** (`/login`) - Sign in to existing account
4. **Profile Setup** (`/profile`) - Complete user profile (Step 1 of 2)
5. **Location Permission** (`/location`) - Grant location access (Step 2 of 2)
6. **Dashboard** (`/dashboard`) - Main application interface
7. **Advisory Details** (`/advisory`) - In-depth health recommendations
8. **Settings** (`/settings`) - Manage preferences, theme, language, and account
9. **Safety Guide** (`/safety-guide`) - Comprehensive heat safety information
10. **Help Pages** (`/help/*`) - FAQ, Tutorial, Privacy Policy, Terms of Service, Contact Support

### Entry Point & Application Initialization

**Entry Point Flow:**
```
index.html → src/main.jsx → src/App.jsx
```

- **`index.html`** - HTML entry point, loads `main.jsx` via script tag
- **`src/main.jsx`** - React entry point that:
  - Initializes React app with `ReactDOM.createRoot()`
  - Wraps app with `AuthProvider` for global authentication state
  - Initializes i18n for internationalization
  - Registers service worker for PWA support
  - Handles localStorage cleanup on reload (preserves signup data and Supabase session)
- **`src/App.jsx`** - Root component that:
  - Sets up React Router with `BrowserRouter`
  - Defines all application routes with lazy loading
  - Handles route protection via `ProtectedRoute` and `PublicRoute` components
  - Manages layout (Header visibility based on route)

### Protected Routes
- Dashboard, Advisory, Settings, Safety Guide, and Help pages require authentication
- Unauthenticated users are redirected to `/login`
- Profile completion is enforced before accessing main features (via `requireProfile` prop)
- Public routes (`/`, `/about`, `/contact`, `/login`, `/signup`) redirect authenticated users away

---

## 📸 Screenshots

### Dashboard
- Real-time weather display with current conditions
- **Interactive heatmap** showing real-time temperatures for 132+ Indian cities
- Interactive 12-hour temperature forecast graph
- 5-day weather forecast with icons
- AI-powered health advisory summary
- Risk score visualization with circular progress
- User profile information display

### Advisory Page
- AI-generated personalized health recommendations (in user's language)
- **Home Cooling Card**: Housing-specific structural cooling tips
- Hydration guidelines with amount and frequency
- Do's & Don'ts lists
- Activity management tips
- Clothing suggestions
- Warning signs and emergency contacts
- Current weather and risk level display
- **Adjusted Indoor Temperature**: Shows calculated indoor temp based on housing type

### Safety Guide Page
- **Heatstroke Video**: Local MP4 video guide for recognizing and treating heatstroke
- **Community Support Section**: Resources and emergency contacts (before cooling centers map)
- **Heat-Related Illnesses**: Expandable sections for heat exhaustion, cramps, sunburn, heat rash
- **Enhanced Cooling Centers Map**: 
  - **Interactive Map**: Real-time map showing nearby cooling centers within 5km radius
  - **Comprehensive Facility Types**: Community centers, libraries, shopping malls, hospitals, clinics, public parks, gardens, metro stations, railway stations, bus stations, places of worship, museums, and community halls
  - **OpenStreetMap Integration**: Uses Overpass API for hyperlocal facility discovery
  - **Google Maps Directions**: One-click navigation to any cooling center via Google Maps
  - **Smart Filtering**: Only displays facilities with proper names (no unnamed locations)
  - **Search Functionality**: Search by city name or use current location
  - **Distance Display**: Shows distance from user location for each center
  - **Compact UI**: Right-aligned, compact "Get Directions" buttons for easy access

### Settings Page
- Dark mode toggle
- Language selector (English, Hindi, Marathi, Tamil)
- Account management
- User preferences persistence
- Language preference persists across sessions (localStorage priority)

### Profile Setup
- Comprehensive onboarding form
- Terms & Conditions modal with blur backdrop
- Age, gender, city, occupation, and health conditions collection

---

## 🗂️ Project Structure

```
heatwave-app/
├── src/
│   ├── components/
│   │   ├── auth/           # Login, Signup, LoginSlider
│   │   ├── dashboard/      # Dashboard, WeatherCard, WeatherGraph, RiskAssessment, AdvisoryPreview, HeatMap
│   │   ├── advisory/       # AdvisoryDetails
│   │   ├── profile/        # ProfileForm
│   │   ├── location/       # LocationPermission
│   │   ├── settings/       # Settings
│   │   ├── landing/        # LandingPage, About, Contact
│   │   ├── safety/         # SafetyGuide (with local MP4 video)
│   │   ├── help/           # FAQ, Tutorial, PrivacyPolicy, TermsOfService, ContactSupport
│   │   ├── CommunitySupport.jsx # Community resources and emergency contacts
│   │   └── shared/         # Header, Button, Loader, ProtectedRoute
│   ├── context/
│   │   └── AuthContext.jsx # Authentication state management
│   ├── services/
│   │   ├── databaseService.js    # Supabase + localStorage CRUD
│   │   ├── weatherService.js     # Weather API integration (current + forecast)
│   │   ├── riskCalculator.js     # Heat risk algorithm
│   │   ├── advisoryService.js    # Fallback advisory content generation
│   │   ├── aiService.js          # AI-powered advisories (Groq/Llama 3.3-70B)
│   │   ├── heatmapService.js     # Open-Meteo integration for real-time heatmap data (132+ cities)
│   │   └── coolingCenterService.js # Cooling center discovery (Overpass API) + Google Maps directions
│   ├── config/
│   │   ├── supabase.js     # Supabase client with fallback
│   │   └── constants.js    # App constants (API URLs, defaults)
│   ├── utils/
│   │   └── helpers.js      # Utility functions
│   ├── assets/             # Images (slide1.jpg, slide2.jpg, slide3.jpg, logo.svg)
│   ├── i18n.js             # Internationalization configuration
│   ├── App.jsx             # Root component and routing
│   ├── main.jsx            # React entry point (wraps app with AuthProvider)
│   └── index.css           # Global styles + Tailwind imports
├── public/                 # Static assets (favicon, service worker)
├── index.html              # HTML entry point
├── package.json
├── tailwind.config.js
├── vite.config.js
├── supabase_schema.sql     # Database schema and RLS policies
└── user_settings_table.sql # User settings table schema
```

---

## 🏗️ Architecture & Design Patterns

### Service Layer Pattern
All data operations follow a consistent pattern:
- **Services** (`src/services/`) contain all business logic and API calls
- **Components** (`src/components/`) are presentational and call service functions
- **Consistent Return Format**: All services return `{ data, error }` tuples for predictable error handling
- **Dev Mode Fallback**: Services automatically fall back to localStorage when Supabase is unavailable

### State Management
- **Global State**: React Context API (`AuthContext`) for authentication state
- **Local State**: `useState` hooks for component-specific data
- **Derived State**: `useMemo` for computed values (risk scores, formatted data)
- **No External State Library**: No Redux, Zustand, or similar (keeps bundle size small)

### Component Organization
- **Feature-based grouping**: Components organized by feature (auth, dashboard, profile, etc.)
- **Shared components**: Reusable UI elements in `components/shared/`
- **Lazy loading**: All route components use `React.lazy()` for code splitting
- **Functional components**: All components use React hooks (no class components)

### Error Handling
- **Service-level**: Try/catch blocks in all service functions
- **Component-level**: Error states displayed inline with user-friendly messages
- **Fallback systems**: Graceful degradation when APIs are unavailable
- **Network errors**: Retry buttons and clear error messages

### Data Flow
```
User Action → Component → Service Function → API/Database → Service → Component → UI Update
```

---

## 🌐 Internationalization (i18n)

### Supported Languages
All text content is fully localized for:
- English (`en`) - Default
- Hindi (`hi`) - हिंदी
- Marathi (`mr`) - मराठी
- Tamil (`ta`) - தமிழ்

### Language Features
- **AI-Generated Content**: Advisories, housing tips, and hydration advice generated in selected language
- **Weather Data**: OpenWeatherMap API responses localized (supports Hindi, Tamil; Marathi falls back to Hindi)
- **Persistent Preference**: Language saved in `localStorage` with priority over browser detection
- **Immediate Updates**: UI, advisories, and weather data update instantly on language change

### Switching Languages
Users can change the language from the **Settings** page. The selected language is:
- Saved in `localStorage` (`i18nextLng`)
- Synced with Supabase `user_settings` table (if logged in)
- Persists across sessions and page reloads
- Applied immediately to all components

### Adding New Languages
1. Add translations to `src/i18n.js` under the `resources` object
2. Follow the existing structure for `en`, `hi`, `mr`, and `ta`
3. Update the language selector in `Settings.jsx`
4. Ensure AI service (`aiService.js`) handles the new language code
5. Update weather service (`weatherService.js`) to map language to OpenWeatherMap codes

---

## 🗄️ Database Schema

The application uses Supabase PostgreSQL with the following main tables:

### `profiles`
Stores user profile information:
- `id` (UUID, Primary Key) - References `auth.users`
- `full_name` - User's full name
- `occupation` - User's occupation/status (e.g., 'outdoor', 'pregnant', 'senior', 'student', 'homemaker')
- `housing_type` - Housing/roof type ('concrete', 'tin_sheet', 'asbestos', 'tiled', 'hut')
- `phone` - Contact phone number
- `home_city` - User's home city
- `age` - User's age
- `gender` - User's gender
- `health_conditions` (JSONB) - Array of health conditions
- `created_at`, `updated_at` - Timestamps

> **Note**: `company_name` field has been deprecated. The app now focuses on community and vulnerable groups.

### `user_settings`
Stores user preferences:
- `id` (UUID, Primary Key) - References `auth.users`
- `dark_mode` - Theme preference
- `push_notifications` - Notification settings
- `high_risk_alerts` - Alert preferences
- `language` - Language preference (en, hi, mr, ta)
- `location_permission` - Location access status
- `lat`, `lon` - Optional stored location coordinates
- `created_at`, `updated_at` - Timestamps

### `employee_risk_logs`
Tracks user location and risk assessments:
- `id` (UUID, Primary Key)
- `user_id` (UUID) - References `auth.users`
- `current_lat`, `current_lon` - Location coordinates
- `risk_score` - Calculated risk score (0-100)
- `risk_label` - Risk level (Low, Medium, High, Critical)
- `recorded_at` - Timestamp

See `supabase_schema.sql` for complete schema definition and RLS policies.

---

## 🎨 Theming

### Dark Mode
- **Manual Toggle**: Users can switch between Light and Dark modes in Settings
- **System Preference**: Does NOT auto-detect OS theme to avoid overriding user choice
- **Default**: Light mode for new users
- **Implementation**: Uses Tailwind's `dark:` variants and `class` strategy

### Customization
Theme colors can be adjusted in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#ef4444',    // Red (danger/heat)
      secondary: '#f59e0b',  // Amber (warning)
      success: '#10b981',    // Green (safe)
      // ... more colors
    }
  }
}
```

---

## 🧪 Development Mode

When Supabase environment variables are not configured, the app runs in **dev mode**:

### Features
- **Mock Authentication**: Uses `dev_user` object in `localStorage`
- **Local Data Storage**: Profile and settings stored as `dev_profile_<userId>` and `dev_settings_<userId>`
- **Weather Data**: Falls back to mock data if OpenWeather API key is missing
- **AI Advisory**: Falls back to default advisory if Groq API key is missing
- **No Backend Required**: Fully functional offline development

### Resetting Dev Data
Clear these `localStorage` keys to reset:
- `dev_user`
- `dev_profile_<userId>`
- `dev_settings_<userId>`
- `theme`
- `i18nextLng`
- `last_path`
- `heatwave_advisory_*` (AI advisory cache)
- `owm:*` (weather data cache)

## ⚡ Performance Optimizations

### AI Advisory Caching
- **Session Storage**: Advisories are cached with hourly expiration (`heatwave_advisory_<userId>_<hour>`)
- **Request Deduplication**: Multiple simultaneous requests share a single API call
- **Automatic Cleanup**: Cache expires every hour, ensuring fresh data

### Weather Data Caching
- **Session Storage**: Weather data cached in sessionStorage with 10-minute expiration
- **Language-Aware**: Separate cache per language to support localized weather descriptions
- **Parallel API Calls**: Current weather and 5-day forecast fetched simultaneously using `Promise.all`
- **Gatekeeper Pattern**: Prevents excessive API calls on tab switching or rapid navigation

### Database Optimizations
- **Upsert Operations**: Profile and settings use upsert to prevent conflicts
- **Single Location Logging**: Prevents duplicate entries in `employee_risk_logs` table

### Code Splitting
- **Lazy Loading**: All route components use `React.lazy()` for code splitting
- **Suspense Boundaries**: Loading fallbacks for lazy-loaded components
- **Reduced Initial Bundle**: Only loads components when routes are accessed

---

## 🐛 Troubleshooting

### Issue: App redirects to login on every page
- **Cause**: Profile not created or `profileExists` state not set
- **Solution**: Complete the profile setup at `/profile` and location permission at `/location`

### Issue: Language switches to Hindi/Marathi/Tamil automatically
- **Cause**: Browser language preference detected or localStorage not prioritized
- **Solution**: The app now prioritizes `localStorage` over browser detection. Manually select your preferred language in Settings; it will persist across sessions

### Issue: Dark mode toggles automatically on Settings page
- **Cause**: (Fixed) Previous implementation used `window.matchMedia`
- **Solution**: Now only checks `localStorage.theme`

### Issue: Weather data not loading
- **Cause**: Missing OpenWeather API key
- **Solution**: Add `VITE_OPENWEATHER_API_KEY` to `.env` or use mock data

### Issue: AI advisory not generating
- **Cause**: Missing Groq API key or network error
- **Solution**: Add `VITE_GROQ_API_KEY` to `.env`; the app will fall back to default advisory if AI service is unavailable

### Issue: Multiple API calls being made
- **Cause**: (Fixed) Previous version didn't have request deduplication
- **Solution**: The app now uses request deduplication and session caching to prevent excessive API calls

### Issue: Recharts import error
- **Cause**: Recharts may not be in `package.json` dependencies
- **Solution**: Install Recharts with `npm install recharts` if you encounter import errors in `WeatherGraph.jsx`

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📧 Contact

For questions or support, please contact the development team.

---

**Built with ❤️ for Chennai's families and vulnerable communities.**

> **Mission**: Climate justice for Chennai. Protecting families in temporary housing, children, the elderly, and pregnant women from extreme heat through housing-aware risk assessment and community-focused resources.

Made by Hemal