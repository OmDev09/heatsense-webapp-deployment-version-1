import { Sun, Shield, Brain, Users, Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'

export default function About() {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState({})
  const missionRef = useRef(null)
  const featuresRef = useRef(null)

  const onSignUp = () => {
    navigate('/signup')
  }

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
      { ref: missionRef, id: 'mission' },
      { ref: featuresRef, id: 'features' }
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

  return (
    <div className="font-display bg-[#f8f9fa] dark:bg-[#101522] text-[#212529] dark:text-gray-200 min-h-screen">
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
                  <a className="text-sm font-medium leading-normal hover:text-primary dark:hover:text-primary transition-colors relative hover:after:content-[''] hover:after:absolute hover:after:bottom-[-4px] hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-primary" href="/#features" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => { const el = document.getElementById('features'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>Features</a>
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

              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
                {/* Header */}
                <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sun className="h-10 w-10 text-amber-500" />
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#212529] dark:text-white">About HeatSense AI</h1>
          </div>
          <p className="text-lg text-[#6C757D] dark:text-gray-400 max-w-2xl mx-auto">
            Empowering communities with AI-driven heatwave predictions and personalized health advisories
          </p>
        </div>

        {/* Mission Section */}
        <div ref={missionRef} id="mission" className={`mb-20 transition-all duration-1000 ${isVisible.mission ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-lg">
            <h2 className="text-3xl font-bold text-[#212529] dark:text-white mb-6">Our Mission: Climate Justice for Chennai.</h2>
            <p className="text-[#6C757D] dark:text-gray-400 text-lg leading-relaxed">
              HeatSense AI is built for the families living along the Buckingham Canal, Kotturpuram, Triplicane and Saidapet. Our mission is to provide dignity and safety to residents in temporary housing who face the dual crisis of extreme heat and seasonal risks. We aim to protect the most vulnerable—children, the elderly, and pregnant women—from the 'invisible killer' of heat stress inside metal-sheet homes.
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div ref={featuresRef} id="features" className="mb-20">
          <h2 className="text-3xl font-bold text-[#212529] dark:text-white text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-[#212529] dark:text-white">Housing-Aware Risk Engine</h3>
              </div>
              <p className="text-[#6C757D] dark:text-gray-400">
                Unlike generic apps, we calculate heat risk based on your specific roof type (Metal Sheets vs. Concrete) to predict indoor temperatures accurately.
              </p>
            </div>

            <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '400ms' }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-[#212529] dark:text-white">Protecting the Vulnerable</h3>
              </div>
              <p className="text-[#6C757D] dark:text-gray-400">
                Specialized alerts for high-risk groups like pregnant women and seniors, ensuring no one is left behind during peak summer months.
              </p>
            </div>

            <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-[#212529] dark:text-white">Community-Led Data</h3>
              </div>
              <p className="text-[#6C757D] dark:text-gray-400">
                Empowering local leaders in canal settlements with hyperlocal data to coordinate safety during critical heat events.
              </p>
            </div>

            <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <Activity className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-[#212529] dark:text-white">Hyperlocal Language Support</h3>
              </div>
              <p className="text-[#6C757D] dark:text-gray-400">
                Accessible alerts designed for Tamil, Hindi, and Marathi speakers to bridge the digital divide.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <button
            onClick={() => navigate('/signup')}
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white rounded-lg text-lg font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:bg-red-600 hover:scale-105"
          >
            Join the Community Network
          </button>
        </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

