import { Sun, Download, Smartphone, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { APK_DOWNLOAD_URL } from '../../config/constants.js'

export default function DownloadApp() {
  const navigate = useNavigate()

  const handleDownload = () => {
    window.open(APK_DOWNLOAD_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="font-display bg-[#f8f9fa] dark:bg-[#101522] text-[#212529] dark:text-gray-200 min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col">
        <div className="flex flex-1 justify-center py-12">
          <div className="flex flex-col max-w-[540px] w-full mx-auto px-4 sm:px-6">
            <header className="flex items-center gap-4 mb-12 cursor-pointer" onClick={() => navigate('/')}>
              <Sun className="h-8 w-8 text-amber-500" />
              <h2 className="text-xl font-bold text-[#212529] dark:text-white">HeatSense AI</h2>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Smartphone className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] dark:text-white">
                    Download HeatSense AI App
                  </h1>
                  <p className="mt-2 text-[#6C757D] dark:text-gray-400">
                    Get heat advisories on your Android device
                  </p>
                </div>

                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-3 w-full max-w-[280px] h-14 px-6 rounded-xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:bg-red-600 transition-all duration-300 active:scale-[0.98]"
                >
                  <Download className="h-6 w-6" />
                  Download APK
                </button>

                <div className="mt-4 w-full text-left">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
                    <Shield className="h-6 w-6 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-[#212529] dark:text-gray-300 leading-relaxed space-y-2">
                      <p className="font-semibold text-amber-800 dark:text-amber-200">Important Instructions</p>
                      <ul className="list-disc list-inside space-y-1 text-[#495057] dark:text-gray-400">
                        <li>This app is for <strong>Android devices only</strong>.</li>
                        <li>Before installing, enable <strong>&quot;Install from unknown sources&quot;</strong> or <strong>&quot;Install unknown apps&quot;</strong> in your device settings.</li>
                        <li>Go to <strong>Settings → Security</strong> (or <strong>Settings → Apps → Special access</strong>) and allow your browser or file manager to install apps from unknown sources.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="mt-8 text-sm text-[#6C757D] dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
