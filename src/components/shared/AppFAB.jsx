import { Smartphone } from 'lucide-react'

export default function AppFAB() {
  const handleClick = () => {
    const url = `${window.location.origin}/download-app`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Download Android app"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 hover:scale-110 active:scale-95 transition-all duration-300"
    >
      <Smartphone className="h-6 w-6" />
    </button>
  )
}
