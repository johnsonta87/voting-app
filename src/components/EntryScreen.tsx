type EntryScreenProps = {
  nameInput: string
  onNameInputChange: (value: string) => void
  onJoin: () => void
  isJoinDisabled?: boolean
}

function EntryScreen({
  nameInput,
  onNameInputChange,
  onJoin,
  isJoinDisabled = !nameInput.trim(),
}: EntryScreenProps) {

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#00203e] rounded-2xl shadow-xl p-8 w-full max-w-sm dark:border-2">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🃏</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            OCC Planning Poker
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
            className="border-2 text-center border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
            autoFocus
          />
          <button
            onClick={onJoin}
            disabled={isJoinDisabled}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Join Session
          </button>
        </div>
      </div>
    </div>
  )
}

export default EntryScreen
