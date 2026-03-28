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
		<span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-1">
		  ✅ Voted
		</span>
	  ) : (
		<span className="text-amber-500 dark:text-amber-400 text-sm font-medium flex items-center gap-1">
		  ⏳ Thinking…
		</span>
	  );
	}
	if (value) {
	  return (
		<span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white font-bold text-base shadow-sm">
		  {value}
		</span>
	  );
	}
	return <span className="text-xs">—</span>;
  })();
  return (
	<div
	  className={[
		'flex items-center justify-between px-4 py-3 rounded-xl',
		isMe
		  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800'
		  : 'bg-gray-50 dark:bg-gray-700/40',
	  ].join(' ')}
	>
	  <div className="flex items-center gap-2">
		<span className="text-lg">👤</span>
		<span
		  className={[
			'font-medium text-sm',
			isMe
			  ? 'text-blue-700 dark:text-blue-300'
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
  <div className="bg-white dark:bg-[#00203e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
    <p className="text-xs font-medium uppercase tracking-wider mb-4">
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

