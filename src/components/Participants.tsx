import React from 'react';

interface ParticipantsProps {
  votes?: Array<{
    voterName: string;
    hasVoted: boolean;
    value?: string | null;
  }>;
  voterName: string;
  revealed: boolean;
  iAmInList: boolean;
}

function ParticipantRow({
  name,
  isMe,
  hasVoted,
  value,
  revealed,
}: {
  name: string;
  isMe: boolean;
  hasVoted: boolean;
  value: string;
  revealed: boolean | undefined;
}) {
  const voteDisplay = (() => {
	if (!revealed) {
	  return hasVoted ? (
      <span className="text-[#00aaa6] text-sm font-semibold flex items-center gap-1">
        ✅ Voted
      </span>
    ) : (
      <span className="text-amber-500 dark:text-amber-400 text-sm font-semibold flex items-center gap-1">
        ⏳ Thinking…
      </span>
    )
	}
	if (value) {
	  return (
		<span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold text-base">
		  {value}
		</span>
	  );
	}
	return <span className="text-xs">—</span>;
  })();
  return (
	<div
	  className={[
		'flex items-center justify-between px-4 py-3 rounded-md',
		isMe
		  ? 'bg-gray-200 dark:bg-gray-400/20 border border-black dark:border-white'
		  : 'bg-gray-50 dark:bg-gray-700/40',
	  ].join(' ')}
	>
	  <div className="flex items-center gap-2">
		<span className="text-lg">👤</span>
		<span
		  className={[
			'font-medium text-sm',
			isMe
			  ? 'text-black dark:text-white'
			  : 'text-gray-700 dark:text-gray-300',
		  ].join(' ')}
		>
		  {name}
		  {isMe && ' (you)'}
		</span>
	  </div>
	  <div>{voteDisplay}</div>
	</div>
  );
}

const Participants: React.FC<ParticipantsProps> = ({
  votes,
  voterName,
  revealed,
  iAmInList,
}) => (
  <div className="bg-white dark:bg-black">
    <p className="text-xs text-black dark:text-white font-medium uppercase tracking-wider mb-4">
      Participants
    </p>
    <div className="flex flex-col gap-2">
      {/* Current user if not yet in the list */}
      {!iAmInList && (
        <ParticipantRow
          name={voterName}
          isMe={true}
          hasVoted={false}
          value={''}
          revealed={revealed}
        />
      )}

      {votes?.map((vote) => (
        <ParticipantRow
          key={vote.voterName}
          name={vote.voterName}
          isMe={vote.voterName === voterName}
          hasVoted={vote.hasVoted}
          value={vote.value || ''}
          revealed={revealed}
        />
      ))}

      {!votes && <p className="text-sm animate-pulse">Loading…</p>}
    </div>
  </div>
)

export default Participants;

