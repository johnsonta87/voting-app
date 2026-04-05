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
    <>
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
        {storyPoints.map((point) => {
          const selected = mySelectedValue === point
          return (
            <button
              key={point}
              onClick={() => handleVote(point)}
              className={[
                'aspect-2/3 flex items-center justify-center rounded-md text-base font-bold cursor-pointer',
                'border-2 transition-all duration-150 select-none border-gray-200 dark:border-white',
                'hover:-translate-y-1 hover:shadow-md active:scale-95',
                selected
                  ? 'bg-[#00aaa6] text-white shadow-lg -translate-y-1'
                  : 'text-gray-700 dark:text-gray-200 hover:border-[#00aaa6]',
              ].join(' ')}
            >
              {point}
            </button>
          )
        })}
      </div>
      {mySelectedValue && (
        <p className="text-sm text-[#00aaa6] dark:text-white mt-6 font-semibold text-center">
          You selected <strong>{mySelectedValue}</strong> · tap another card to
          change
        </p>
      )}
    </>
  )
}

export default VotingCards

