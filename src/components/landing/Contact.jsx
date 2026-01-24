import { Mail, Phone, MapPin, MessageSquare, Send, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Contact() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const onSignUp = () => {
    navigate('/signup')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, this would send the form data to a backend
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="font-display bg-[#f8f9fa] dark:bg-[#101522] text-[#212529] dark:text-gray-200 min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex h-full grow flex-col">
          <div className="flex flex-1 justify-center py-5">
            <div className="flex flex-col max-w-[1024px] flex-1">
              {/* TopNavBar */}
              <header className="flex items-center justify-between whitespace-nowrap px-10 py-4 animate-fade-in">
                <div className="flex items-center gap-4 text-[#212529] dark:text-white cursor-pointer" onClick={() => navigate('/')}>
                  <Sun className="h-7 w-7 text-amber-500" />
                  <h2 className="text-xl font-bold tracking-tight">HeatSense AI</h2>
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

              <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
                {/* Header */}
                <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-[#212529] dark:text-white mb-4">Contact Us</h1>
          <p className="text-lg text-[#6C757D] dark:text-gray-400 max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you. Get in touch with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-[#212529] dark:text-white mb-6">Get in Touch</h2>
              <p className="text-[#6C757D] dark:text-gray-400 mb-8">
                Whether you have questions about HeatSense AI, need technical support, or want to partner with us, we're here to help.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 flex-shrink-0">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-[#212529] dark:text-white mb-1">Email</h3>
                  <a href="mailto:support@heatsense.ai" className="text-primary hover:underline">
                    support@heatsense.ai
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-secondary/10 flex-shrink-0">
                  <Phone className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-[#212529] dark:text-white mb-1">Phone</h3>
                  <a href="tel:+9118001234567" className="text-[#6C757D] dark:text-gray-400 hover:text-primary">
                    +91 1800 123 4567
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-[#212529] dark:text-white mb-1">Location</h3>
                  <p className="text-[#6C757D] dark:text-gray-400">
                    India<br />
                    Serving communities across the country
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-secondary/10 flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-[#212529] dark:text-white mb-1">Support Hours</h3>
                  <p className="text-[#6C757D] dark:text-gray-400">
                    Monday - Friday: 9:00 AM - 6:00 PM IST<br />
                    Saturday: 10:00 AM - 4:00 PM IST
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-[#212529] dark:text-white mb-6">Send us a Message</h2>
            
            {submitted ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
                <div className="text-green-600 dark:text-green-400 font-semibold mb-2">Message Sent!</div>
                <p className="text-sm text-green-700 dark:text-green-300">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#212529] dark:text-white mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-[#212529] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#212529] dark:text-white mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-[#212529] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-[#212529] dark:text-white mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-[#212529] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#212529] dark:text-white mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-[#212529] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:bg-red-600 hover:scale-105"
                >
                  <Send className="h-5 w-5" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="mt-12 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
          <h3 className="font-bold text-red-800 dark:text-red-300 mb-2">⚠️ Medical Emergency?</h3>
          <p className="text-sm text-red-700 dark:text-red-400">
            If you or someone you know is experiencing severe heat-related symptoms (dizziness, confusion, rapid heartbeat, or loss of consciousness), 
            please call emergency services immediately at <strong>108</strong> or <strong>112</strong>. Do not wait for a response to your contact form.
          </p>
        </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

