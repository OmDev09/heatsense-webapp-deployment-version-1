export default function Button({ children, className = '', ...props }) {
  return (
    <button className={`px-4 py-2 rounded-md bg-amber-500 text-white hover:bg-amber-600 ${className}`} {...props}>
      {children}
    </button>
  )
}