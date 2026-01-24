import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function FAQ() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState(0)

  const faqs = [
    {
      question: 'What is HeatSense AI?',
      answer: 'HeatSense AI is an AI-driven system that provides early heatwave predictions and personalized health advisory alerts for at-risk populations in India. It helps individuals and communities stay safe during extreme heat events.'
    },
    {
      question: 'How does HeatSense AI predict heatwaves?',
      answer: 'HeatSense AI uses advanced machine learning algorithms to analyze real-time meteorological data from multiple trusted sources. The system processes temperature, humidity, wind patterns, and historical data to forecast upcoming heatwave events with high accuracy.'
    },
    {
      question: 'How do I receive alerts?',
      answer: 'You can enable push notifications in your Settings. The app will send you personalized alerts based on your location, health profile, and the current heat risk level. You can customize which types of alerts you receive in the Notifications settings.'
    },
    {
      question: 'What information do I need to provide?',
      answer: 'To get personalized risk assessments, you need to provide your age, gender, city, occupation type, and any relevant health conditions. This information helps our AI calculate your specific heat risk level and provide tailored recommendations.'
    },
    {
      question: 'How accurate are the risk assessments?',
      answer: 'Our risk assessments are based on scientific research and real-time weather data. However, they are advisory in nature and should not replace professional medical advice. Always consult healthcare professionals for serious health concerns.'
    },
    {
      question: 'Can I use HeatSense AI without location access?',
      answer: 'Yes, you can manually select your city in Settings. However, enabling location access provides more accurate, real-time weather updates and better risk calculations for your exact location.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we take data privacy seriously. Your personal information is encrypted and stored securely. We only use your data to provide personalized heat risk assessments and never share it with third parties. See our Privacy Policy for more details.'
    },
    {
      question: 'How often is the weather data updated?',
      answer: 'Weather data is updated in real-time from trusted meteorological sources. Your dashboard refreshes automatically to show the latest conditions and risk assessments.'
    },
    {
      question: 'What should I do if I experience heat-related symptoms?',
      answer: 'If you experience symptoms like dizziness, nausea, rapid heartbeat, or confusion, seek medical help immediately. HeatSense AI provides emergency contact numbers in the Advisory section. In case of heatstroke, call emergency services (102 or 108) right away.'
    },
    {
      question: 'Can I change my profile information later?',
      answer: 'Yes, you can update your profile at any time by going to Settings > Account > Edit Profile. Keeping your information up-to-date ensures you receive the most accurate risk assessments.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] py-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Find answers to common questions about HeatSense AI</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white pr-4">{faq.question}</h3>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

