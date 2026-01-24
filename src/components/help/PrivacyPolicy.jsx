import { FileText, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function PrivacyPolicy() {
  const { t } = useTranslation()

  const sections = [
    {
      title: 'Information We Collect',
      content: [
        'Personal Information: Name, email address, phone number, age, gender, city, occupation, and health conditions.',
        'Location Data: GPS coordinates and city information when you enable location access.',
        'Usage Data: How you interact with the app, including features used and settings preferences.',
        'Device Information: Device type, operating system, and browser information for app optimization.'
      ]
    },
    {
      title: 'How We Use Your Information',
      content: [
        'To provide personalized heat risk assessments based on your profile and location.',
        'To send you health advisories and heatwave alerts tailored to your needs.',
        'To improve our AI models and prediction accuracy.',
        'To communicate with you about app updates, important notices, and support requests.',
        'To ensure app security and prevent fraud or abuse.'
      ]
    },
    {
      title: 'Data Security',
      content: [
        'We use industry-standard encryption to protect your data during transmission and storage.',
        'Your personal information is stored securely and access is restricted to authorized personnel only.',
        'We regularly update our security measures to protect against unauthorized access, disclosure, or destruction of data.',
        'While we strive to protect your data, no method of transmission over the internet is 100% secure.'
      ]
    },
    {
      title: 'Data Sharing',
      content: [
        'We do not sell, trade, or rent your personal information to third parties.',
        'We may share anonymized, aggregated data for research purposes to improve heatwave prediction models.',
        'We may disclose information if required by law or to protect our rights and the safety of users.',
        'In case of a merger or acquisition, your data may be transferred to the new entity.'
      ]
    },
    {
      title: 'Your Rights',
      content: [
        'Access: You can view and update your profile information at any time in Settings.',
        'Deletion: You can delete your account and all associated data through Settings > Account > Delete Account.',
        'Location: You can disable location access or manually select your city at any time.',
        'Notifications: You can customize which notifications you receive in Settings.',
        'Data Export: Contact us if you wish to export your data.'
      ]
    },
    {
      title: 'Cookies and Tracking',
      content: [
        'We use cookies and similar technologies to enhance your experience and analyze app usage.',
        'You can control cookie preferences through your browser settings.',
        'We use analytics to understand how users interact with the app and improve functionality.'
      ]
    },
    {
      title: 'Children\'s Privacy',
      content: [
        'HeatSense AI is not intended for children under 13 years of age.',
        'We do not knowingly collect personal information from children under 13.',
        'If you believe we have collected information from a child under 13, please contact us immediately.'
      ]
    },
    {
      title: 'Changes to This Policy',
      content: [
        'We may update this Privacy Policy from time to time.',
        'We will notify you of significant changes through the app or via email.',
        'Your continued use of the app after changes constitutes acceptance of the updated policy.',
        'Last updated: January 2024'
      ]
    },
    {
      title: 'Contact Us',
      content: [
        'If you have questions about this Privacy Policy or our data practices, please contact us:',
        'Email: privacy@heatsense.ai',
        'Support: support@heatsense.ai'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] py-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Last updated: January 2024</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            At HeatSense AI, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
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

