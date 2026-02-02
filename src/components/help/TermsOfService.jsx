import { Scroll, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function TermsOfService() {
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

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] py-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Scroll className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('terms.title')}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{t('terms.lastUpdated')}</p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">{t('terms.disclaimerTitle')}</h3>
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                {t('terms.disclaimerText')}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
            >
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
  )
}

