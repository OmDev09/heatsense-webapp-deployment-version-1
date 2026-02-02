import { useState } from 'react'
import { Phone, Mail, Send, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTranslation } from 'react-i18next'

export default function ContactSupport() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user?.email?.split('@')[0] || '',
    email: user?.email || '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setError(t('contact.fillRequired'))
      return
    }
    setError('')
    setSubmitting(true)
    setSuccess(false)
    
    try {
      // Simulate form submission (in production, this would send to a backend)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Log to console for development (remove in production)
      console.log('Contact support form submission:', form)
      
      // In production, you would send this to your backend API:
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(form)
      // })
      
      setSuccess(true)
      setForm({ ...form, subject: '', message: '' })
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(t('contact.sendError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] py-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('contact.title')}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{t('contact.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('contact.emailUs')}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{t('contact.sendEmailAt')}</p>
            <a 
              href="mailto:support@heatsense.ai" 
              className="text-primary hover:underline font-medium"
            >
              support@heatsense.ai
            </a>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Phone className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('contact.responseTime')}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {t('contact.responseTimeText')}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('contact.sendMessage')}</h2>
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-800 dark:text-green-200 font-medium">{t('contact.successTitle')}</p>
                <p className="text-green-700 dark:text-green-300 text-sm mt-1">{t('contact.successText')}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('contact.nameLabel')}
                </label>
                <input
                  type="text"
                  className="w-full border border-neutral-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-neutral-900 dark:text-gray-100 placeholder-neutral-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder={t('contact.namePlaceholder')}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('contact.emailLabel')}
                </label>
                <input
                  type="email"
                  className="w-full border border-neutral-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-neutral-900 dark:text-gray-100 placeholder-neutral-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder={t('contact.emailPlaceholder')}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('contact.subjectLabel')}
              </label>
              <input
                type="text"
                className="w-full border border-neutral-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-neutral-900 dark:text-gray-100 placeholder-neutral-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder={t('contact.subjectPlaceholder')}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('contact.messageLabel')}
              </label>
              <textarea
                className="w-full border border-neutral-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-neutral-900 dark:text-gray-100 placeholder-neutral-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                rows="6"
                placeholder={t('contact.messagePlaceholder')}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-primary rounded-xl px-6 py-3 flex items-center gap-2 min-w-[120px] justify-center"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>{t('contact.sending')}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>{t('contact.send')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

