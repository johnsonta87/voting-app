import React from 'react'

interface VotingCardsProps {
  storyPoints: Array<string>
  mySelectedValue: string | null
  handleVote: (point: string) => void
  revealed: boolean | undefined
}

const VotingCards: React.FC<VotingCardsProps> = ({
  storyPoints,
  mySelectedValue,
  handleVote,
  revealed,
}) => {
  if (revealed) return null
  return (
    <div className="bg-white dark:bg-[#00203e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-400 p-5">
      <p className="text-xs font-medium uppercase tracking-wider mb-4">
        Pick a card to vote
      </p>
      <div className="grid grid-cols-9 gap-2">
        {storyPoints.map((point) => {
          const selected = mySelectedValue === point
          return (
            <button
              key={point}
              onClick={() => handleVote(point)}
              className={[
                'aspect-2/3 flex items-center justify-center rounded-md text-base font-bold cursor-pointer',
                'border-2 transition-all duration-150 select-none',
                'hover:-translate-y-1 hover:shadow-md active:scale-95',
                selected
                  ? 'border-blue-500 bg-blue-500 text-white shadow-lg -translate-y-1'
                  : 'border-gray-200 dark:border-gray-400 text-gray-700 dark:text-gray-200 hover:border-blue-400',
              ].join(' ')}
            >
              {point}
            </button>
          )
        })}
      </div>
      {mySelectedValue && (
        <p className="text-sm text-blue-600 dark:text-blue-400 mt-3 font-medium text-center">
          You selected <strong>{mySelectedValue}</strong> · tap another card to
          change
        </p>
      )}
    </div>
  )
}

export default VotingCards

