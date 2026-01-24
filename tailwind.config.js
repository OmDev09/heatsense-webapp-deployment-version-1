export default {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#EF4444',
        secondary: '#F97316',
        success: '#10B981',
        warning: '#F59E0B',
        risk: {
          low: '#10B981',
          medium: '#F59E0B',
          high: '#F97316',
          critical: '#EF4444'
        },
        text: {
          heading: '#111827',
          body: '#4B5563'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji']
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px'
      }
    }
  },
  darkMode: 'class',
  plugins: []
}