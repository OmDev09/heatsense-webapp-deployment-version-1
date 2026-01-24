import { useEffect, useState } from 'react'
import slide1 from '../../assets/slide1.jpg'
import slide2 from '../../assets/slide2.jpg'
import slide3 from '../../assets/slide3.jpg'

const slides = [slide1, slide2, slide3]

export default function LoginSlider() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % slides.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden">
      {slides.map((src, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={src}
            alt={`HeatSense AI slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  )
}