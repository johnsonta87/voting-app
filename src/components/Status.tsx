import React from 'react';

interface Vote {
  hasVoted: boolean;
}

interface StatusProps {
  votes?: Array<Vote>;
  revealed?: boolean;
}

const Status: React.FC<StatusProps> = ({ votes, revealed }) => {
  const votedCount = votes?.filter((v) => v.hasVoted).length ?? 0;

  const statusText = (() => {
    if (!votes) return '…'
    if (revealed) return 'Estimates revealed'
    if (votedCount === 0) return 'Waiting for estimates…'
    return `${votedCount} voted · hidden until revealed`
  })();

  return (
    <div className="w-full p-5 flex items-center justify-center">
        <p className="relative z-10 uppercase font-bold text-black dark:text-white text-sm font-xl tracking-wider text-center">
          {statusText}
        </p>
    </div>
  );
};

export default Status;
