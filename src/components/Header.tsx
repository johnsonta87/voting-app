type HeaderProps = {
  voterName: string
  onChangeName: () => void
  title: string
  changeLabel?: string
}

function Header({
  voterName,
  onChangeName,
  title = 'OCC Planning Poker',
  changeLabel = 'change',
}: Readonly<HeaderProps>) {
  return (
    <header className="bg-white dark:bg-[#00203e] border-b border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
        <span className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
          🃏 <span>{title}</span>
        </span>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white">Voting as</span>
          <span className="font-semibold text-gray-900 dark:text-white">{voterName}</span>
          <button
            onClick={onChangeName}
            className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 underline ml-1"
          >
            {changeLabel}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

