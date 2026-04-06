import { Moon, Sun } from 'lucide-react'

type EntryScreenProps = Readonly<{
  nameInput: string
  onNameInputChange: (value: string) => void
  onJoin: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  isJoinDisabled?: boolean
}>

function EntryScreen(props: EntryScreenProps) {
  const {
    nameInput,
    onNameInputChange,
    onJoin,
    theme,
    onToggleTheme,
    isJoinDisabled = !nameInput.trim(),
  } = props

  return (
    <div className="min-h-screen bg-white dark:bg-black lg:flex">
      <div className="flex min-h-screen w-full items-center px-4 py-8 sm:px-8 lg:w-1/2 lg:px-12 xl:px-16 shadow-lg">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={onToggleTheme}
                className="text-xs cursor-pointer text-black dark:text-white"
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
            <div className="text-5xl mb-3">
              <img
                src={'/assets/images/logo.png'}
                alt="Logo"
                className="w-16 mx-auto"
              />
            </div>
            <h1 className="text-2xl font-bold text-[#00aaa6]">
              Team Planning Poker
            </h1>
            <p className="text-gray-900 dark:text-white text-sm mt-1">
              Enter your name to join the session
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => onNameInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onJoin()}
              placeholder="Your name"
              className="border-2 text-center border-gray-200 dark:border-white rounded-md px-4 py-3 text-base focus:outline-none focus:border-[#00aaa6] dark:bg-white dark:text-black transition-colors"
              autoFocus
            />
            <button
              onClick={onJoin}
              disabled={isJoinDisabled}
              className="bg-[#00aaa6] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-md transition-colors"
            >
              Join Session
            </button>
          </div>
        </div>
      </div>

      <div className="relative hidden lg:block lg:min-h-screen lg:w-1/2">
        <img
          src="/assets/images/poker-joker-cards-bg.png"
          alt="Planning poker placeholder"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-white/75 dark:bg-black/90"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

export default EntryScreen
