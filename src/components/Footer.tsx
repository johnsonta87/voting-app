import { Github } from 'lucide-react'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="md:absolute bottom-0 w-full border-t border-gray-100 dark:border-gray-400 mt-8">
      <div className="max-w-7xl mx-auto px-5 py-4 text-xs md:text-sm text-gray-600 dark:text-gray-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <p>
          &copy; {year}{' '}
          Johnson Ta
          {'. All rights reserved.'}
        </p>
      </div>
    </footer>
  )
}

export default Footer
