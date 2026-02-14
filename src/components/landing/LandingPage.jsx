import { Home, Heart, MapPin, Sun, Thermometer, Users, Moon, Shield, Lightbulb } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'

export default function LandingPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState({ hero: true })
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const stepsRef = useRef(null)
  const whyHeatSenseRef = useRef(null)
  const teamRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    const refs = [
      { ref: heroRef, id: 'hero' },
      { ref: featuresRef, id: 'features' },
      { ref: stepsRef, id: 'steps' },
      { ref: whyHeatSenseRef, id: 'whyHeatSense' },
      { ref: teamRef, id: 'team' }
    ]

    refs.forEach(({ ref, id }) => {
      if (ref.current) {
        ref.current.id = id
        observer.observe(ref.current)
      }
    })

    return () => {
      refs.forEach(({ ref }) => {
        if (ref.current) observer.unobserve(ref.current)
      })
    }
  }, [])

  const onGetStarted = async () => {
    try { if (user) await logout() } catch {}
    navigate('/signup')
  }

  const onSignUp = () => {
    navigate('/signup')
  }

  return (
    <div className="font-display text-[#212529] dark:text-gray-200 min-h-screen animated-bg">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex h-full grow flex-col">
          <div className="flex flex-1 justify-center py-5">
            <div className="flex flex-col max-w-[1024px] flex-1">
              {/* TopNavBar */}
              <header className="flex items-center justify-between whitespace-nowrap px-4 sm:px-6 md:px-10 py-3 sm:py-4 animate-fade-in">
                <div className="flex items-center gap-4 text-[#212529] dark:text-white cursor-pointer" onClick={() => navigate('/')}>
                  <Sun className="h-7 w-7 text-amber-500" />
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight truncate">HeatSense AI</h2>
                </div>
                <div className="hidden md:flex flex-1 justify-center items-center gap-8 text-[#212529] dark:text-gray-300">
                  <a 
                    className="text-sm font-medium leading-normal hover:text-primary dark:hover:text-primary transition-colors relative hover:after:content-[''] hover:after:absolute hover:after:bottom-[-4px] hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-primary cursor-pointer" 
                    href="#features"
                    onClick={(e) => {
                      e.preventDefault()
                      const featuresSection = document.getElementById('features')
                      if (featuresSection) {
                        featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }}
                  >
                    Features
                  </a>
                  <a 
                    className="text-sm font-medium leading-normal hover:text-primary dark:hover:text-primary transition-colors relative hover:after:content-[''] hover:after:absolute hover:after:bottom-[-4px] hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-primary cursor-pointer" 
                    href="#whyHeatSense"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById('whyHeatSense')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                  >
                    Why HeatSense
                  </a>
                  <a className="text-sm font-medium leading-normal hover:text-primary dark:hover:text-primary transition-colors relative hover:after:content-[''] hover:after:absolute hover:after:bottom-[-4px] hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-primary" href="/about" onClick={(e) => { e.preventDefault(); navigate('/about'); }}>About</a>
                  <a className="text-sm font-medium leading-normal hover:text-primary dark:hover:text-primary transition-colors relative hover:after:content-[''] hover:after:absolute hover:after:bottom-[-4px] hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-primary" href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contact</a>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={onSignUp}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 dark:bg-gray-700 text-[#212529] dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="truncate">Sign Up</span>
                  </button>
                </div>
              </header>

              {/* HeroSection */}
              <div ref={heroRef} id="hero" className="px-4 sm:px-6 py-12 sm:py-16 md:py-24 pb-24 sm:pb-32 md:pb-40 text-center">
                <div className={`flex flex-col gap-6 items-center transition-all duration-1000 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <div className="flex flex-col gap-4 text-center max-w-3xl mx-auto">
                    <h1 className="text-2xl sm:text-4xl font-black leading-[1.2] tracking-[-0.033em] md:text-6xl md:leading-[1.15] pb-2">
                      <span className="text-[#212529] dark:text-white">Chennai's Shield</span>{' '}
                      <span className="animate-gradient inline-block pb-1">Against Extreme Heat.</span>
                    </h1>
                    <h2 className={`text-[#6C757D] dark:text-gray-400 text-sm sm:text-base font-normal leading-normal md:text-lg transition-all duration-1000 delay-300 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      Real-time alerts designed for families in temporary housing. We help you protect children, elders, and loved ones from dangerous temperatures.
                    </h2>
                  </div>
                  <button 
                    onClick={onGetStarted}
                    className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:bg-red-600 hover:scale-105 active:scale-95 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} delay-500`}
                  >
                    <span className="truncate">Join the Safety Network</span>
                  </button>
                </div>
              </div>

              {/* FeatureSection */}
              <div ref={featuresRef} id="features" className="flex flex-col gap-8 sm:gap-10 px-4 sm:px-6 py-12 sm:py-16 md:py-24 mt-12 sm:mt-16 md:mt-24">
                <div className={`flex flex-col gap-4 max-w-3xl text-center mx-auto transition-all duration-1000 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <h1 className="text-[#212529] dark:text-white tracking-tight text-3xl font-bold leading-tight md:text-4xl">
                    How We Protect Your Community
                  </h1>
                  <p className="text-[#6C757D] dark:text-gray-400 text-base font-normal leading-normal">
                    Built specifically for Chennai's neighborhoods, our community-first approach ensures every family gets the protection they need.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`glare-hover flex flex-1 gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-6 flex-col text-center items-center shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-500 cursor-pointer ${isVisible.features ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`} style={{ transitionDelay: '200ms' }}>
                    <div className={`text-primary text-4xl mb-2 transform hover:scale-110 transition-all duration-500 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
                      <div className="flex items-center justify-center gap-1">
                        <Home className="h-10 w-10 text-primary" />
                        <Thermometer className="h-8 w-8 text-primary opacity-80" />
                      </div>
                    </div>
                    <div className={`flex flex-col gap-1 transition-all duration-500 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '500ms' }}>
                      <h2 className="text-[#212529] dark:text-white text-lg font-bold leading-tight">Housing-Aware Risk Score</h2>
                      <p className="text-[#6C757D] dark:text-gray-400 text-sm font-normal leading-normal">Our AI calculates heat risk based on your specific roof type (Metal Sheets vs. Concrete), not just the weather outside.</p>
                    </div>
                  </div>
                  <div className={`glare-hover flex flex-1 gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-6 flex-col text-center items-center shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-500 cursor-pointer ${isVisible.features ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`} style={{ transitionDelay: '400ms' }}>
                    <div className={`text-secondary text-4xl mb-2 transform hover:scale-110 transition-all duration-500 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '600ms' }}>
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-10 w-10 text-secondary" />
                        <Heart className="h-8 w-8 text-secondary opacity-80" />
                      </div>
                    </div>
                    <div className={`flex flex-col gap-1 transition-all duration-500 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '700ms' }}>
                      <h2 className="text-[#212529] dark:text-white text-lg font-bold leading-tight">Protecting the Vulnerable</h2>
                      <p className="text-[#6C757D] dark:text-gray-400 text-sm font-normal leading-normal">Specialized advisories for children, pregnant women, and the elderly to prevent heatstroke and dehydration.</p>
                    </div>
                  </div>
                  <div className={`glare-hover flex flex-1 gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-6 flex-col text-center items-center shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-500 cursor-pointer ${isVisible.features ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`} style={{ transitionDelay: '600ms' }}>
                    <div className={`text-primary text-4xl mb-2 transform hover:scale-110 transition-all duration-500 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '800ms' }}>
                      <MapPin className="h-10 w-10 text-primary" />
                    </div>
                    <div className={`flex flex-col gap-1 transition-all duration-500 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '900ms' }}>
                      <h2 className="text-[#212529] dark:text-white text-lg font-bold leading-tight">Hyper-Local Canal Monitoring</h2>
                      <p className="text-[#6C757D] dark:text-gray-400 text-sm font-normal leading-normal">Precision tracking for heat pockets in dense settlements like Triplicane and Kotturpuram.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works Section */}
              <div ref={stepsRef} id="steps" className="px-4 sm:px-6 py-16 md:py-24">
                <div className={`flex flex-col gap-4 max-w-3xl text-center mx-auto mb-12 transition-all duration-1000 ${isVisible.steps ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <h1 className="text-[#212529] dark:text-white tracking-tight text-3xl font-bold leading-tight md:text-4xl">
                    How It Works
                  </h1>
                  <p className="text-[#6C757D] dark:text-gray-400 text-base font-normal leading-normal">
                    A simple yet powerful process to keep you informed and safe.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 relative">
                  {/* Dotted line for desktop */}
                  <div className={`hidden md:block absolute top-1/2 left-0 h-px -translate-y-1/2 transition-all duration-1000 ${isVisible.steps ? 'w-full opacity-100' : 'w-0 opacity-0'}`}>
                    <svg className="text-gray-300 dark:text-gray-600" height="2" width="100%">
                      <line stroke="currentColor" strokeDasharray="8 8" strokeWidth="2" x1="0" x2="100%" y1="1" y2="1"></line>
                    </svg>
                  </div>
                  <div className={`relative flex flex-col items-center text-center gap-4 px-2 transition-all duration-700 ${isVisible.steps ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
                    <div className="flex items-center justify-center size-12 rounded-full bg-primary/20 text-primary border-4 border-[#f8f9fa] dark:border-[#101522] flex-shrink-0 transform hover:scale-110 transition-transform duration-300">
                      <span className="font-bold text-lg">1</span>
                    </div>
                    <h3 className="font-bold text-[#212529] dark:text-white text-base leading-tight min-h-[2.5rem] flex items-center justify-center">Profile Your Home</h3>
                    <p className="text-sm text-[#6C757D] dark:text-gray-400 leading-relaxed max-w-[240px]">Tell us about your housing type (e.g., Tin Shed, Concrete) and who lives with you (Children, Seniors) to get accurate risk data.</p>
                  </div>
                  <div className={`relative flex flex-col items-center text-center gap-4 px-2 transition-all duration-700 ${isVisible.steps ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>
                    <div className="flex items-center justify-center size-12 rounded-full bg-secondary/20 text-secondary border-4 border-[#f8f9fa] dark:border-[#101522] flex-shrink-0 transform hover:scale-110 transition-transform duration-300">
                      <span className="font-bold text-lg">2</span>
                    </div>
                    <h3 className="font-bold text-[#212529] dark:text-white text-base leading-tight min-h-[2.5rem] flex items-center justify-center">Real-Time Weather Monitoring</h3>
                    <p className="text-sm text-[#6C757D] dark:text-gray-400 leading-relaxed max-w-[240px]">We fetch live weather data (temperature, humidity, feels-like temp) for your exact location using GPS and trusted weather APIs.</p>
                  </div>
                  <div className={`relative flex flex-col items-center text-center gap-4 px-2 transition-all duration-700 ${isVisible.steps ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
                    <div className="flex items-center justify-center size-12 rounded-full bg-primary/20 text-primary border-4 border-[#f8f9fa] dark:border-[#101522] flex-shrink-0 transform hover:scale-110 transition-transform duration-300">
                      <span className="font-bold text-lg">3</span>
                    </div>
                    <h3 className="font-bold text-[#212529] dark:text-white text-base leading-tight min-h-[2.5rem] flex items-center justify-center">Personalized Risk Assessment</h3>
                    <p className="text-sm text-[#6C757D] dark:text-gray-400 leading-relaxed max-w-[240px]">Our AI algorithm combines your profile with current weather conditions to calculate your personal heat risk score (Low, Medium, High, or Critical).</p>
                  </div>
                  <div className={`relative flex flex-col items-center text-center gap-4 px-2 transition-all duration-700 ${isVisible.steps ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
                    <div className="flex items-center justify-center size-12 rounded-full bg-secondary/20 text-secondary border-4 border-[#f8f9fa] dark:border-[#101522] flex-shrink-0 transform hover:scale-110 transition-transform duration-300">
                      <span className="font-bold text-lg">4</span>
                    </div>
                    <h3 className="font-bold text-[#212529] dark:text-white text-base leading-tight min-h-[2.5rem] flex items-center justify-center">Get Tailored Health Guidance</h3>
                    <p className="text-sm text-[#6C757D] dark:text-gray-400 leading-relaxed max-w-[240px]">Receive specific, actionable recommendations based on your risk level—when to drink water, avoid outdoor work, and seek medical help.</p>
                  </div>
                </div>
              </div>

              {/* Why HeatSense AI Section */}
              <div ref={whyHeatSenseRef} id="whyHeatSense" className="px-4 sm:px-6 py-16 md:py-24">
                <div className="max-w-4xl mx-auto">
                  {/* The Impact */}
                  <div className={`transition-all duration-1000 ${isVisible.whyHeatSense ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <p className="text-sm font-bold tracking-[0.2em] uppercase bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                      The Impact
                    </p>
                    <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#212529] dark:text-white tracking-tight">
                      The Staggering Impact of Extreme Heat
                    </h2>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
                        <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">48,000+</p>
                        <p className="mt-3 text-sm text-[#212529] dark:text-gray-300 leading-relaxed">Suspected heatstroke cases in India (2024)</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
                        <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">417</p>
                        <p className="mt-3 text-sm text-[#212529] dark:text-gray-300 leading-relaxed">Indian districts under high/very high heat-risk</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
                        <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">85%</p>
                        <p className="mt-3 text-sm text-[#212529] dark:text-gray-300 leading-relaxed">Increase in heat-related deaths for seniors (&gt;65)</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
                        <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">24,223</p>
                        <p className="mt-3 text-sm text-[#212529] dark:text-gray-300 leading-relaxed">Indian heat-related deaths (1992-2015)</p>
                      </div>
                    </div>
                    {/* Warm Nights */}
                    <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700 flex items-start gap-4">
                      <Moon className="h-8 w-8 text-secondary flex-shrink-0 mt-0.5" />
                      <p className="text-[#212529] dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                        Warm Nights are increasing faster than hot days, making recovery from daytime heat exposure more difficult.
                      </p>
                    </div>
                  </div>

                  {/* The Solution */}
                  <div className={`mt-16 transition-all duration-1000 ${isVisible.whyHeatSense ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
                    <p className="text-sm font-bold tracking-[0.2em] uppercase bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                      The Solution
                    </p>
                    <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#212529] dark:text-white tracking-tight">
                      Closing the Gaps in Heat Safety
                    </h2>
                    <div className="mt-8 space-y-4">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-md border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center flex-shrink-0">
                          <Shield className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-extrabold text-[#212529] dark:text-white">Health-Centric AI</h3>
                          <p className="mt-3 text-sm sm:text-base text-[#212529] dark:text-gray-300 leading-relaxed">
                            Hyperlocal tracking that includes humidity and warm nights for comprehensive heat risk assessment.
                          </p>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-md border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                          <Lightbulb className="h-8 w-8 text-secondary" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-extrabold text-[#212529] dark:text-white">Actionable Intelligence</h3>
                          <p className="mt-3 text-sm sm:text-base text-[#212529] dark:text-gray-300 leading-relaxed">
                            Clear, direct instructions designed for immediate action when heat risks are detected.
                          </p>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-md border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                          <Home className="h-8 w-8 text-secondary" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-extrabold text-[#212529] dark:text-white">Housing-Aware Score</h3>
                          <p className="mt-3 text-sm sm:text-base text-[#212529] dark:text-gray-300 leading-relaxed">
                            Risk calculated for your specific living conditions, not generic weather forecasts.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Our Team Section */}
              <div ref={teamRef} id="team" className="px-4 sm:px-6 py-16 md:py-24">
                <div className={`flex flex-col gap-4 max-w-3xl text-center mx-auto mb-12 transition-all duration-1000 ${isVisible.team ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <h1 className="text-[#212529] dark:text-white tracking-tight text-3xl font-bold leading-tight md:text-4xl">
                    Our Team
                  </h1>
                  <p className="text-[#6C757D] dark:text-gray-400 text-base font-normal leading-normal">
                    The people behind HeatSense AI
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
                  {[
                    { image: '/Photo1.jpg', name: 'Anusha Gupta', role: 'Team Lead & Lead Full-Stack Architect' },
                    { image: '/Photo2.jpeg', name: 'Hemal Bhirud', role: 'AI Engineer & Integration Specialist' },
                    { image: '/Photo3.png', name: 'Om Mahale', role: 'Quality Assurance (QA) Lead & Research Analyst' },
                    { image: '/Photo4.jpg', name: 'Gagandeep Singh', role: 'Frontend Engineer & User Researcher' },
                    { image: '/Photo5.jpg', name: 'Farhan Parawiranata', role: 'Technical Writer & Media Lead' },
                    { image: '/Photo6.jpg', name: 'Ahmad Fauzan Prayogi', role: 'System Validation Engineer & Operations' }
                  ].map((member, index) => (
                    <div
                      key={index}
                      className={`flex flex-col items-center gap-3 transition-all duration-700 ${isVisible.team ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                      style={{ transitionDelay: `${(index % 3) * 150 + 200}ms` }}
                    >
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover shrink-0 bg-gray-200 dark:bg-gray-700"
                      />
                      <div className="text-center">
                        <p className="text-sm sm:text-base font-bold text-[#212529] dark:text-white">{member.name}</p>
                        <p className="text-xs sm:text-sm text-[#6C757D] dark:text-gray-400 mt-0.5">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <footer className="mt-20 border-t border-gray-200 dark:border-gray-700 px-10 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-3 text-[#212529] dark:text-white">
                    <Sun className="h-6 w-6 text-amber-500" />
                    <h2 className="text-lg font-bold">HeatSense AI</h2>
                  </div>
                  <p className="text-sm text-[#6C757D] dark:text-gray-400">© 2026 HeatSense AI. All rights reserved.</p>
                  <div className="flex items-center gap-6 text-[#6C757D] dark:text-gray-400">
                    <a className="text-sm hover:text-primary dark:hover:text-primary transition-colors cursor-pointer" href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}>Privacy Policy</a>
                    <a className="text-sm hover:text-primary dark:hover:text-primary transition-colors cursor-pointer" href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>Terms of Service</a>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}