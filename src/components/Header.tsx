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
  title = 'OCC Planning Poker',
  changeLabel = 'change',
}: Readonly<HeaderProps>) {
  return (
    <header className="bg-white dark:bg-black border-b border-gray-100 dark:border-gray-400 shadow-sm">
      <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
        <span className="font-bold text-black dark:text-white text-lg flex items-center gap-2">
          <img
            src={'/assets/images/logo.png'}
            alt="Logo"
            className="w-8 mx-auto"
          />{' '}
          <span>{title}</span>
        </span>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={onToggleTheme}
            className="text-xs cursor-pointer font-semibold text-black dark:text-white px-2 py-1"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          |
          <span className="text-black dark:text-white">Voting as</span>
          <span className="font-semibold text-black dark:text-white">{voterName}</span>
          <button
            onClick={onChangeName}
            className="text-xs text-black dark:text-white underline ml-1"
          >
            {changeLabel}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

