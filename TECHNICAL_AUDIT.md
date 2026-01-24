# HeatSense AI - Technical Audit Report

## Executive Summary

**HeatSense AI** is a React-based Single Page Application (SPA) designed to provide personalized heatwave risk assessments and health advisories. The application uses a modern tech stack with Supabase for backend services, React Router for navigation, and Tailwind CSS for styling. The codebase demonstrates a clean separation of concerns with a service-oriented architecture.

---

## 1. Tech Stack & Dependencies

### Core Framework & Build Tools
- **React 18.3.1** - UI library with functional components and hooks
- **Vite 5.4.21** - Build tool and dev server (fast HMR, ES modules)
- **React Router DOM 6.26.2** - Client-side routing

### UI & Styling
- **Tailwind CSS 3.4.14** - Utility-first CSS framework
- **Lucide React 0.470.0** - Icon library (replaces Feather Icons)
- **PostCSS & Autoprefixer** - CSS processing

### Backend & Data
- **Supabase JS 2.45.4** - Backend-as-a-Service (Auth + PostgreSQL)
  - Authentication (email/password, OAuth/Google)
  - Database operations (users_profile, user_settings tables)
  - Real-time subscriptions (configured but not heavily used)

### Internationalization
- **i18next 23.16.8** - Internationalization framework
- **react-i18next 15.7.4** - React bindings for i18next
- **i18next-browser-languagedetector 8.2.0** - Language detection
- **Supported Languages**: English (en), Hindi (hi), Marathi (mr)

### External APIs
- **OpenWeatherMap API** - Weather data fetching
  - Current weather conditions
  - Temperature, humidity, wind speed, "feels like" temperature

### Development Features
- **React StrictMode** - Development warnings
- **Service Worker** - PWA support (basic setup in `main.jsx`)

---

## 2. Project Structure & Architecture

### Directory Structure
```
heatwave-app/
├── src/
│   ├── main.jsx                 # Entry point
│   ├── App.jsx                  # Root component + routing
│   ├── index.css                # Global styles + Tailwind
│   ├── i18n.js                  # i18n configuration
│   │
│   ├── components/              # UI Components (feature-based)
│   │   ├── auth/               # Authentication UI
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── LoginSlider.jsx
│   │   ├── dashboard/          # Main dashboard
│   │   │   ├── Dashboard.jsx
│   │   │   ├── WeatherCard.jsx
│   │   │   ├── RiskAssessment.jsx
│   │   │   └── AdvisoryPreview.jsx
│   │   ├── advisory/           # Health advisories
│   │   │   └── AdvisoryDetails.jsx
│   │   ├── profile/            # User profile management
│   │   │   └── ProfileForm.jsx
│   │   ├── settings/           # App settings
│   │   │   └── Settings.jsx
│   │   ├── location/           # Location permissions
│   │   │   └── LocationPermission.jsx
│   │   ├── landing/            # Landing page
│   │   │   └── LandingPage.jsx
│   │   └── shared/             # Reusable components
│   │       ├── Header.jsx
│   │       ├── Button.jsx
│   │       ├── Loader.jsx
│   │       └── ProtectedRoute.jsx
│   │
│   ├── services/               # Business logic layer
│   │   ├── databaseService.js # Supabase CRUD operations
│   │   ├── weatherService.js   # OpenWeatherMap integration
│   │   ├── riskCalculator.js   # Risk scoring algorithm
│   │   └── advisoryService.js  # Health advisory generation
│   │
│   ├── context/               # React Context providers
│   │   └── AuthContext.jsx     # Authentication state management
│   │
│   ├── config/                # Configuration files
│   │   ├── supabase.js        # Supabase client setup
│   │   └── constants.js       # App constants (API URLs, defaults)
│   │
│   └── utils/                 # Utility functions
│       └── helpers.js         # Formatting helpers (e.g., formatTemp)
│
├── public/                    # Static assets
│   ├── favicon.ico
│   └── sw.js                  # Service worker
│
├── dist/                      # Build output
├── package.json
├── vite.config.js
└── tailwind.config.js
```

### Architecture Patterns

#### **Separation of Concerns**
- **UI Layer**: Components in `src/components/` handle presentation only
- **Business Logic**: Services in `src/services/` contain all data operations and calculations
- **State Management**: React Context API for global auth state; local state for component-specific data
- **Configuration**: Environment variables and constants centralized in `config/`

#### **Component Organization**
- **Feature-based grouping**: Components organized by feature (auth, dashboard, profile, etc.)
- **Shared components**: Reusable UI elements in `components/shared/`
- **Lazy loading**: All route components use `React.lazy()` for code splitting

#### **Entry Point Flow**
1. `index.html` → loads `main.jsx`
2. `main.jsx` → wraps app with `AuthProvider` and initializes i18n
3. `App.jsx` → sets up routing and layout structure

---

## 3. Data Flow & State Management

### Authentication Flow

#### **AuthContext** (`src/context/AuthContext.jsx`)
- **Global State**: `user`, `loading`, `profileExists`
- **Methods**: `login()`, `signup()`, `logout()`, `loginWithGoogle()`, `checkProfileExists()`
- **Auth State Subscription**: Listens to Supabase auth state changes
- **Dev Mode**: Falls back to localStorage when Supabase env vars are missing

#### **Authentication Process**
```
User Login → AuthContext.login() → Supabase Auth → 
  → Auth state change → checkProfileExists() → 
  → Redirect based on profileExists flag
```

### Data Fetching Pattern

#### **Service Layer Pattern**
All data operations follow a consistent pattern:
```javascript
// Example from databaseService.js
export async function getUserProfile(userId) {
  if (devMode) {
    // localStorage fallback
    return { data, error: null }
  }
  try {
    const { data, error } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    return { data: data || null, error }
  } catch (error) {
    return { data: null, error }
  }
}
```

**Key Characteristics**:
- Always returns `{ data, error }` tuple
- Dev mode fallback to localStorage
- Error handling with try/catch
- Uses Supabase's `.maybeSingle()` for optional results

#### **Database Tables** (Inferred from code)
1. **`users_profile`**
   - `id` (PK, references auth.users)
   - `name`, `age`, `gender`, `city`, `occupation`
   - `health_conditions` (array)
   - `created_at`, `updated_at`

2. **`user_settings`**
   - `id` (PK, references auth.users)
   - Settings fields (dark mode, language, etc.)
   - `created_at`, `updated_at`

### Risk Calculation Flow

```
Dashboard Component
  ↓
1. Fetch user profile (databaseService.getUserProfile)
  ↓
2. Fetch weather data (weatherService.fetchCurrentWeather)
  ↓
3. Calculate risk (riskCalculator.calculateRisk)
  ├─ Input: { age, occupation, health_conditions }, { feels_like, humidity }
  ├─ Algorithm: Weighted scoring based on:
  │   ├─ Temperature (feels_like): 10-40 points
  │   ├─ Humidity (>70%): +10 points
  │   ├─ Age (vulnerable groups): 10-20 points
  │   ├─ Occupation (outdoor work): +20 points
  │   └─ Health conditions: +15 per chronic condition
  └─ Output: { score: 0-100, level: 'Low'|'Medium'|'High'|'Critical', color }
  ↓
4. Generate advisories (advisoryService.getAdvisories)
  └─ Returns personalized recommendations based on risk level
```

### Protected Routes

#### **Route Protection Strategy**
- **`ProtectedRoute`** component wraps protected pages
- **Props**:
  - `requireProfile`: Redirects to `/profile` if profile doesn't exist
  - `redirectIfProfileExists`: Redirects to `/dashboard` if profile exists (used for `/profile`)
- **Public Routes**: `PublicRoute` redirects authenticated users away from login/signup

#### **Route Configuration** (`App.jsx`)
```javascript
/ → LandingPage (public)
/login → Login (public, redirects if authenticated)
/signup → Signup (public, redirects if authenticated)
/profile → ProfileForm (protected, redirects if profile exists)
/location → LocationPermission
/dashboard → Dashboard (protected, requires profile)
/advisory → AdvisoryDetails (protected, requires profile)
/settings → Settings (protected, requires profile)
```

### State Management Summary

- **Global State**: React Context (`AuthContext`) for authentication
- **Local State**: `useState` hooks in components
- **Derived State**: `useMemo` for computed values (risk scores, formatted data)
- **No External State Library**: No Redux, Zustand, or similar

---

## 4. Key Conventions & Patterns

### Coding Patterns

#### **1. Functional Components with Hooks**
- All components are functional
- Uses React hooks: `useState`, `useEffect`, `useMemo`, `useContext`
- No class components

#### **2. Async/Await Pattern**
- Services use `async/await` (not `.then()` chains)
- Consistent error handling: `try/catch` with `{ data, error }` return pattern
- Example:
```javascript
const { data, error } = await fetchCurrentWeather(city)
if (error) {
  setError(error.message)
  return
}
setWeather(data)
```

#### **3. Service Functions Always Return `{ data, error }`**
- Consistent API across all services
- Makes error handling predictable
- Allows destructuring: `const { data, error } = await serviceFunction()`

#### **4. Dev Mode Fallback**
- Services check for Supabase env vars
- Falls back to localStorage when backend unavailable
- Enables local development without backend setup
- Pattern: `const devMode = !import.meta.env.VITE_SUPABASE_URL`

#### **5. Component Loading States**
- Components show loading skeletons during data fetching
- Uses `loading` state variables
- Loading UI pattern:
```javascript
if (loading) {
  return <div className="animate-pulse">...</div>
}
```

#### **6. Error Handling**
- Errors displayed inline in components
- Network errors show retry buttons
- User-friendly error messages (often from i18n)

### Naming Conventions

#### **Files & Directories**
- **Components**: PascalCase (e.g., `Dashboard.jsx`, `ProfileForm.jsx`)
- **Services**: camelCase (e.g., `databaseService.js`, `weatherService.js`)
- **Utilities**: camelCase (e.g., `helpers.js`)
- **Config**: camelCase (e.g., `supabase.js`, `constants.js`)
- **Directories**: lowercase (e.g., `components/`, `services/`)

#### **Functions & Variables**
- **Functions**: camelCase (e.g., `getUserProfile`, `calculateRisk`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `OPENWEATHER_BASE_URL`, `DEFAULT_CITY`)
- **React Components**: PascalCase (matches file names)

#### **CSS Classes**
- **Tailwind utilities**: Standard Tailwind classes
- **Custom classes**: Defined in `index.css` with semantic names
  - `.btn-primary`, `.heading-xl`, `.card`, `.bg-app`
- **Dark mode**: Uses Tailwind's `dark:` prefix

### Internationalization (i18n)

#### **Translation Keys**
- Nested structure: `dashboard.greeting`, `profile.validation.age`
- Interpolation: `t('dashboard.greeting', { name })`
- Default values: Some keys have fallbacks

#### **Usage Pattern**
```javascript
import { useTranslation } from 'react-i18next'
const { t } = useTranslation()
// Then: t('dashboard.greeting', { name })
```

### Styling Conventions

#### **Tailwind CSS**
- Utility-first approach
- Custom theme colors defined in `tailwind.config.js`:
  - `primary` (red), `secondary` (orange), `success` (green), `warning` (yellow)
  - `risk` colors: `low`, `medium`, `high`, `critical`
- Dark mode: `dark:` variants throughout
- Responsive: Uses grid layouts (e.g., `grid-cols-12`)

#### **Component Styling**
- Inline Tailwind classes (no CSS modules or styled-components)
- Reusable classes defined in `index.css` (`@layer components`)
- Consistent spacing: `rounded-2xl`, `rounded-3xl` for cards
- Shadow patterns: `shadow-md`, `shadow-lg` for elevation

### Environment Variables

Required environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_OPENWEATHER_API_KEY` - OpenWeatherMap API key
- `VITE_DEFAULT_CITY` - Default city (optional, defaults to 'Delhi')

### Code Organization Rules

1. **Services are pure functions** - No side effects except API calls
2. **Components are presentational** - Business logic in services
3. **Context for global state only** - Auth state, not component-specific state
4. **Lazy loading for routes** - All route components use `React.lazy()`
5. **Error boundaries** - Not explicitly implemented (potential improvement)

---

## 5. Mental Model: User Journey

### **From Login to Core Functionality**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ARRIVES AT LANDING PAGE                             │
│    Route: /                                                  │
│    Component: LandingPage                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. USER CLICKS "SIGN UP" OR "LOG IN"                        │
│    Routes: /signup or /login                                │
│    Components: Signup.jsx or Login.jsx                      │
│    - PublicRoute wrapper redirects if already authenticated │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. AUTHENTICATION                                           │
│    - User submits credentials                               │
│    - AuthContext.login() or AuthContext.signup()           │
│    - Supabase Auth API called                               │
│    - Auth state change triggers onAuthStateChange          │
│    - AuthContext.checkProfileExists(userId)                 │
│      → Queries users_profile table                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
                    ┌─────┴─────┐
                    │           │
          Profile Exists?    No Profile
                    │           │
                    ↓           ↓
┌───────────────────────┐  ┌──────────────────────────────┐
│ 4a. PROFILE EXISTS    │  │ 4b. NO PROFILE               │
│    Redirect to:       │  │    Redirect to:              │
│    /dashboard         │  │    /profile                   │
└───────────────────────┘  └──────────────────────────────┘
                    │           │
                    │           ↓
                    │  ┌──────────────────────────────┐
                    │  │ ProfileForm Component         │
                    │  │ - Collects: age, gender,      │
                    │  │   city, occupation, health     │
                    │  │ - Validates input              │
                    │  │ - Calls:                       │
                    │  │   databaseService.             │
                    │  │   createUserProfile()          │
                    │  │ - Redirects to /location       │
                    │  └──────────────────────────────┘
                    │           │
                    └───────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. DASHBOARD LOADING                                        │
│    Route: /dashboard                                        │
│    Component: Dashboard.jsx                                │
│    ProtectedRoute wrapper ensures profile exists            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. DATA FETCHING (Parallel)                                 │
│    a) getUserProfile(userId)                                │
│       → databaseService.getUserProfile()                    │
│       → Supabase: SELECT * FROM users_profile WHERE id=...  │
│                                                             │
│    b) fetchCurrentWeather(city)                             │
│       → weatherService.fetchCurrentWeather()                │
│       → OpenWeatherMap API call                            │
│       → Cached for 10 minutes (localStorage)               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. RISK CALCULATION                                        │
│    calculateRisk(userData, weatherData)                     │
│    → riskCalculator.calculateRiskScore()                    │
│    → Algorithm:                                             │
│       - Temperature scoring (10-40 pts)                      │
│       - Humidity bonus (+10 pts if >70%)                    │
│       - Age vulnerability (10-20 pts)                       │
│       - Occupation risk (5-20 pts)                          │
│       - Health conditions (15 pts each)                     │
│    → Returns: { score: 0-100, level, color }                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. ADVISORY GENERATION                                     │
│    getAdvisories(riskLevel)                                 │
│    → advisoryService.getAdvisories()                        │
│    → Returns personalized recommendations:                  │
│       - Hydration tips                                       │
│       - Activity management                                 │
│       - Clothing advice                                      │
│       - Warning signs                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. DASHBOARD RENDERING                                     │
│    - Weather card (temperature, humidity, wind)             │
│    - Risk assessment card (score, level, color-coded)       │
│    - Advisory preview cards                                 │
│    - Health tips (occupation/health-based)                  │
│    - Emergency contacts                                     │
│    - Auto-refresh weather every 10 minutes                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 10. USER CLICKS "VIEW RECOMMENDATIONS"                      │
│     Route: /advisory                                        │
│     Component: AdvisoryDetails.jsx                          │
│     - Full advisory details                                 │
│     - Download PDF / Share options                          │
└─────────────────────────────────────────────────────────────┘
```

### **Key State Flow Points**

1. **Auth State**: Managed in `AuthContext`, persists across page reloads via Supabase session
2. **Profile State**: Fetched on dashboard load, cached in component state
3. **Weather State**: Fetched on dashboard load, cached in localStorage (10 min TTL), auto-refreshes
4. **Risk State**: Computed via `useMemo` when profile + weather data available
5. **Route Protection**: `ProtectedRoute` checks auth + profile before rendering

### **Data Persistence**

- **Supabase (Production)**: All user data stored in PostgreSQL
- **localStorage (Dev Mode)**: Fallback when Supabase unavailable
- **Weather Cache**: localStorage with 10-minute expiration
- **Session**: Supabase handles auth session persistence

---

## 6. Notable Features & Patterns

### **1. Development Mode Fallback**
The app gracefully degrades when Supabase credentials are missing, using localStorage for all data operations. This enables:
- Local development without backend setup
- Testing without API keys
- Offline development

### **2. Weather Data Caching**
- 10-minute cache in localStorage
- Reduces API calls
- Improves performance

### **3. Risk Scoring Algorithm**
Sophisticated multi-factor risk calculation considering:
- Environmental factors (temperature, humidity)
- Personal factors (age, occupation)
- Health factors (chronic conditions)

### **4. Internationalization**
- Full i18n support (English, Hindi, Marathi)
- Language detection from browser/localStorage
- All user-facing text translated

### **5. Dark Mode Support**
- Tailwind dark mode enabled
- Uses `dark:` variants throughout
- Theme toggle likely in Settings (not reviewed in detail)

### **6. Code Splitting**
- All route components lazy-loaded
- Reduces initial bundle size
- Improves load time

---

## 7. Potential Improvements & Observations

### **Strengths**
✅ Clean separation of concerns  
✅ Consistent error handling patterns  
✅ Dev mode fallback for easier development  
✅ Well-organized component structure  
✅ TypeScript-ready (currently JSX, could migrate)  
✅ Good use of React hooks and modern patterns  

### **Areas for Enhancement**
⚠️ **Error Boundaries**: No React Error Boundaries implemented  
⚠️ **Type Safety**: No TypeScript (consider migration for larger codebase)  
⚠️ **Testing**: No test files visible (Jest/Vitest setup recommended)  
⚠️ **API Error Handling**: Could be more granular (network vs. API errors)  
⚠️ **Loading States**: Some components could benefit from skeleton loaders  
⚠️ **Accessibility**: ARIA labels present but could be expanded  
⚠️ **Service Worker**: Basic setup, could be enhanced for offline support  

---

## 8. Summary

**HeatSense AI** is a well-architected React application with a clear separation between UI, business logic, and data layers. The codebase follows modern React patterns, uses a service-oriented architecture, and includes thoughtful features like dev mode fallbacks and weather caching. The application is production-ready but could benefit from additional error boundaries, testing infrastructure, and potentially TypeScript for type safety as it scales.

**Key Takeaways for New Developers:**
1. Services always return `{ data, error }` tuples
2. Use `useAuth()` hook for authentication state
3. Components are presentational; business logic lives in services
4. Dev mode uses localStorage when Supabase is unavailable
5. All routes are lazy-loaded for performance
6. i18n keys follow nested structure (e.g., `dashboard.greeting`)

