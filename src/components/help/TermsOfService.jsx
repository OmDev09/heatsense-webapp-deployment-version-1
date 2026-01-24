import { Scroll, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function TermsOfService() {
  const { t } = useTranslation()

  const sections = [
    {
      title: 'Acceptance of Terms',
      content: [
        'By accessing and using HeatSense AI, you accept and agree to be bound by these Terms of Service.',
        'If you do not agree to these terms, please do not use the application.',
        'We reserve the right to modify these terms at any time, and your continued use constitutes acceptance of changes.'
      ]
    },
    {
      title: 'Description of Service',
      content: [
        'HeatSense AI provides AI-driven heatwave predictions and personalized health advisory alerts.',
        'The service is designed to help users make informed decisions about heat-related health risks.',
        'Our predictions and advisories are based on available data and AI models, but are not guaranteed to be 100% accurate.'
      ]
    },
    {
      title: 'User Accounts',
      content: [
        'You are responsible for maintaining the confidentiality of your account credentials.',
        'You agree to provide accurate, current, and complete information during registration.',
        'You are responsible for all activities that occur under your account.',
        'You must notify us immediately of any unauthorized use of your account.'
      ]
    },
    {
      title: 'Medical Disclaimer',
      content: [
        'HeatSense AI provides health information and risk assessments for informational purposes only.',
        'The service is NOT a substitute for professional medical advice, diagnosis, or treatment.',
        'Always seek the advice of qualified health providers with any questions regarding medical conditions.',
        'In case of medical emergencies, contact emergency services immediately (102 or 108).',
        'We are not responsible for any health decisions made based on information provided by the app.'
      ]
    },
    {
      title: 'User Responsibilities',
      content: [
        'You agree to use the service only for lawful purposes and in accordance with these Terms.',
        'You will not attempt to gain unauthorized access to the service or its systems.',
        'You will not use the service to transmit harmful code, viruses, or malicious software.',
        'You will not impersonate others or provide false information.',
        'You will respect the intellectual property rights of HeatSense AI and third parties.'
      ]
    },
    {
      title: 'Intellectual Property',
      content: [
        'All content, features, and functionality of HeatSense AI are owned by us and protected by copyright, trademark, and other laws.',
        'You may not copy, modify, distribute, or create derivative works without our written permission.',
        'You retain ownership of data you provide, but grant us license to use it for service provision.'
      ]
    },
    {
      title: 'Limitation of Liability',
      content: [
        'HeatSense AI is provided "as is" without warranties of any kind, express or implied.',
        'We do not guarantee the accuracy, completeness, or usefulness of any information provided.',
        'We are not liable for any damages arising from your use or inability to use the service.',
        'Our total liability shall not exceed the amount you paid for the service (if any).'
      ]
    },
    {
      title: 'Indemnification',
      content: [
        'You agree to indemnify and hold harmless HeatSense AI from any claims, damages, or expenses arising from your use of the service.',
        'This includes any violation of these Terms or infringement of rights of others.'
      ]
    },
    {
      title: 'Termination',
      content: [
        'We may terminate or suspend your account at any time for violation of these Terms.',
        'You may delete your account at any time through Settings > Account > Delete Account.',
        'Upon termination, your right to use the service will immediately cease.',
        'Provisions that by their nature should survive termination will remain in effect.'
      ]
    },
    {
      title: 'Governing Law',
      content: [
        'These Terms are governed by the laws of India.',
        'Any disputes will be subject to the exclusive jurisdiction of courts in India.',
        'If any provision is found to be unenforceable, the remaining provisions will remain in full effect.'
      ]
    },
    {
      title: 'Contact Information',
      content: [
        'For questions about these Terms of Service, please contact us:',
        'Email: legal@heatsense.ai',
        'Support: support@heatsense.ai'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] py-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Scroll className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Last updated: January 2024</p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Important Medical Disclaimer</h3>
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                HeatSense AI provides informational health advisories only and is NOT a substitute for professional medical advice. 
                Always consult healthcare professionals for medical concerns. In emergencies, call 102 or 108 immediately.
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

