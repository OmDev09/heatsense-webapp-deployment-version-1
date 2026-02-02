import { FileText, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function PrivacyPolicy() {
  const { t } = useTranslation()

  const sections = [
    { title: t('privacy.s1Title'), content: [t('privacy.s1C1'), t('privacy.s1C2'), t('privacy.s1C3'), t('privacy.s1C4')] },
    { title: t('privacy.s2Title'), content: [t('privacy.s2C1'), t('privacy.s2C2'), t('privacy.s2C3'), t('privacy.s2C4'), t('privacy.s2C5')] },
    { title: t('privacy.s3Title'), content: [t('privacy.s3C1'), t('privacy.s3C2'), t('privacy.s3C3'), t('privacy.s3C4')] },
    { title: t('privacy.s4Title'), content: [t('privacy.s4C1'), t('privacy.s4C2'), t('privacy.s4C3'), t('privacy.s4C4')] },
    { title: t('privacy.s5Title'), content: [t('privacy.s5C1'), t('privacy.s5C2'), t('privacy.s5C3'), t('privacy.s5C4'), t('privacy.s5C5')] },
    { title: t('privacy.s6Title'), content: [t('privacy.s6C1'), t('privacy.s6C2'), t('privacy.s6C3')] },
    { title: t('privacy.s7Title'), content: [t('privacy.s7C1'), t('privacy.s7C2'), t('privacy.s7C3')] },
    { title: t('privacy.s8Title'), content: [t('privacy.s8C1'), t('privacy.s8C2'), t('privacy.s8C3'), t('privacy.s8C4')] },
    { title: t('privacy.s9Title'), content: [t('privacy.s9C1'), t('privacy.s9C2'), t('privacy.s9C3')] }
  ]

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] py-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('privacy.title')}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{t('privacy.lastUpdated')}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('privacy.intro')}
          </p>
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

