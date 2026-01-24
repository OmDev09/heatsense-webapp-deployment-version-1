import { BookOpen, CheckCircle, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Tutorial() {
  const { t } = useTranslation()

  const steps = [
    {
      title: 'Create Your Account',
      description: 'Sign up with your email and phone number. You can also sign in with Google for faster access.',
      icon: '1'
    },
    {
      title: 'Complete Your Profile',
      description: 'Fill in your age, gender, city, occupation, and health conditions. This helps our AI provide personalized risk assessments.',
      icon: '2'
    },
    {
      title: 'Enable Location Access',
      description: 'Allow location access for real-time weather updates specific to your area. You can also manually select your city.',
      icon: '3'
    },
    {
      title: 'View Your Dashboard',
      description: 'Check your personalized heat risk level, current weather conditions, and health advisories tailored to your profile.',
      icon: '4'
    },
    {
      title: 'Review Advisories',
      description: 'Get detailed recommendations on hydration, activity management, clothing, and warning signs to watch for.',
      icon: '5'
    },
    {
      title: 'Customize Settings',
      description: 'Adjust notification preferences, language, theme, and other settings to personalize your experience.',
      icon: '6'
    }
  ]

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] py-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tutorial</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Learn how to get the most out of HeatSense AI</p>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">{step.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-gray-400 flex-shrink-0 mt-3" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tips for Best Experience</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">Keep your profile information up-to-date for accurate risk assessments</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">Enable push notifications to receive timely alerts about heat risks</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">Check the Safety Guide section to learn about heat-related illnesses</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">Review advisories regularly, especially during peak summer months</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

