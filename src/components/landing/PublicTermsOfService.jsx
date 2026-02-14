import { Sun, Scroll, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function PublicTermsOfService() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const sections = [
    { title: t('terms.s1Title'), content: [t('terms.s1C1'), t('terms.s1C2'), t('terms.s1C3')] },
    { title: t('terms.s2Title'), content: [t('terms.s2C1'), t('terms.s2C2'), t('terms.s2C3')] },
    { title: t('terms.s3Title'), content: [t('terms.s3C1'), t('terms.s3C2'), t('terms.s3C3'), t('terms.s3C4')] },
    { title: t('terms.s4Title'), content: [t('terms.s4C1'), t('terms.s4C2'), t('terms.s4C3'), t('terms.s4C4'), t('terms.s4C5')] },
    { title: t('terms.s5Title'), content: [t('terms.s5C1'), t('terms.s5C2'), t('terms.s5C3'), t('terms.s5C4'), t('terms.s5C5')] },
    { title: t('terms.s6Title'), content: [t('terms.s6C1'), t('terms.s6C2'), t('terms.s6C3')] },
    { title: t('terms.s7Title'), content: [t('terms.s7C1'), t('terms.s7C2'), t('terms.s7C3'), t('terms.s7C4')] },
    { title: t('terms.s8Title'), content: [t('terms.s8C1'), t('terms.s8C2')] },
    { title: t('terms.s9Title'), content: [t('terms.s9C1'), t('terms.s9C2'), t('terms.s9C3'), t('terms.s9C4')] },
    { title: t('terms.s10Title'), content: [t('terms.s10C1'), t('terms.s10C2'), t('terms.s10C3')] },
    { title: t('terms.s11Title'), content: [t('terms.s11C1'), t('terms.s11C2'), t('terms.s11C3')] }
  ]

  const onSignUp = () => navigate('/signup')

  return (
    <div className="font-display bg-[#f8f9fa] dark:bg-[#101522] text-[#212529] dark:text-gray-200 min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex h-full grow flex-col">
          <div className="flex flex-1 justify-center py-5">
            <div className="flex flex-col max-w-[1024px] flex-1">
              {/* TopNavBar - Landing style (before login) */}
              <header className="flex items-center justify-between whitespace-nowrap px-4 sm:px-6 md:px-10 py-3 sm:py-4 animate-fade-in">
                <div className="flex items-center gap-4 text-[#212529] dark:text-white cursor-pointer" onClick={() => navigate('/')}>
                  <Sun className="h-7 w-7 text-amber-500" />
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight truncate">HeatSense AI</h2>
                </div>
                <div className="hidden md:flex flex-1 justify-center items-center gap-8 text-[#212529] dark:text-gray-300">
                  <a className="text-sm font-medium leading-normal hover:text-primary dark:hover:text-primary transition-colors relative hover:after:content-[''] hover:after:absolute hover:after:bottom-[-4px] hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-primary" href="/#features" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Features</a>
                  <a className="text-sm font-medium leading-normal hover:text-primary dark:hover:text-primary transition-colors relative hover:after:content-[''] hover:after:absolute hover:after:bottom-[-4px] hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-primary" href="/#whyHeatSense" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => document.getElementById('whyHeatSense')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Why HeatSense</a>
                  <a className="text-sm font-medium leading-normal hover:text-primary dark:hover:text-primary transition-colors relative hover:after:content-[''] hover:after:absolute hover:after:bottom-[-4px] hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-primary" href="/about" onClick={(e) => { e.preventDefault(); navigate('/about'); }}>About</a>
                  <a className="text-sm font-medium leading-normal hover:text-primary dark:hover:text-primary transition-colors relative hover:after:content-[''] hover:after:absolute hover:after:bottom-[-4px] hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-primary" href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contact</a>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={onSignUp} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 dark:bg-gray-700 text-[#212529] dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    <span className="truncate">Sign Up</span>
                  </button>
                </div>
              </header>

              {/* Content - Same as Help/TermsOfService */}
              <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] py-6 sm:py-8 px-4 sm:px-6 md:px-8">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Scroll className="h-8 w-8 text-primary" />
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('terms.title')}</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{t('terms.lastUpdated')}</p>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">{t('terms.disclaimerTitle')}</h3>
                        <p className="text-yellow-800 dark:text-yellow-300 text-sm">{t('terms.disclaimerText')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {sections.map((section, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{section.title}</h2>
                        <ul className="space-y-2">
                          {section.content.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-3">
                              <span className="text-primary mt-1">•</span>
                              <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
