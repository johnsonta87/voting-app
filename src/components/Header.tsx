import { Moon, Sun } from 'lucide-react'

type HeaderProps = {
  voterName: string
  onChangeName: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  title?: string
  changeLabel?: string
}

function Header({
  voterName,
  onChangeName,
  theme,
  onToggleTheme,
  title = 'Team Planning Poker',
  changeLabel = 'change',
}: Readonly<HeaderProps>) {
  return (
    <header className="bg-white dark:bg-black border-b border-gray-100 dark:border-gray-400 shadow-sm">
      <div className="w-full md:max-w-7xl mx-auto px-5 py-3 flex flex-col md:flex-row md:items-center md:justify-between">
        <span className="font-bold text-black dark:text-white text-lg flex items-center gap-2 w-full mb-4 md:mb-0 md:w-auto">
          <img
            src={'/assets/images/logo.png'}
            alt="Logo"
            className="w-5 md:w-8 md:mx-auto"
          />{' '}
          <span>{title}</span>
        </span>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-black dark:text-white">Voting as</span>
          <span className="font-semibold text-[#00aaa6]">{voterName}</span>
          {/*hide for now*/}
          <button
            onClick={onChangeName}
            className="hidden text-xs text-black dark:text-white underline ml-1"
          >
            {changeLabel}
          </button>
          |<button
            type="button"
            onClick={onToggleTheme}
            className="text-xs cursor-pointer font-semibold text-black dark:text-white px-2 py-1"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? (
              <Sun size={16} aria-hidden="true" />
            ) : (
              <Moon size={16} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

