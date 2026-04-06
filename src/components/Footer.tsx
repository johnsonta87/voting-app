import { Github } from 'lucide-react'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="sm:absolute bottom-0 w-full border-t border-gray-100 dark:border-gray-400 mt-8">
      <div className="max-w-7xl mx-auto px-5 py-4 text-xs md:text-sm text-gray-600 dark:text-gray-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <p>
          &copy; {year}{' '}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Johnson Ta
          </a>
          {'. All rights reserved.'}
        </p>
        <a
          href="https://github.com/johnsonta87/voting-app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 dark:text-gray-300 hover:underline"
          aria-label="View project on GitHub"
        >
          <Github size={18} />
        </a>
      </div>
    </footer>
  )
}

export default Footer
