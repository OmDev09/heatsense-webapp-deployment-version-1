import { BookOpen, CheckCircle, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Tutorial() {
  const { t } = useTranslation()

  const steps = [
    { title: t('tutorial.step1Title'), description: t('tutorial.step1Desc'), icon: '1' },
    { title: t('tutorial.step2Title'), description: t('tutorial.step2Desc'), icon: '2' },
    { title: t('tutorial.step3Title'), description: t('tutorial.step3Desc'), icon: '3' },
    { title: t('tutorial.step4Title'), description: t('tutorial.step4Desc'), icon: '4' },
    { title: t('tutorial.step5Title'), description: t('tutorial.step5Desc'), icon: '5' },
    { title: t('tutorial.step6Title'), description: t('tutorial.step6Desc'), icon: '6' }
  ]

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] py-6 sm:py-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('tutorial.title')}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{t('tutorial.subtitle')}</p>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
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
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('tutorial.tipsTitle')}</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">{t('tutorial.tip1')}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">{t('tutorial.tip2')}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">{t('tutorial.tip3')}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">{t('tutorial.tip4')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

