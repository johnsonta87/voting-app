import React from "react";

interface Vote {
  voterName: string;
  hasVoted: boolean;
  value?: string | null;
}

interface AverageEstimateProps {
  votes?: Array<Vote>;
  revealed?: boolean;
}

const AverageEstimate: React.FC<AverageEstimateProps> = ({ votes, revealed }) => {
  if (!revealed || !votes) return null;

  const numericVotes = votes
    .filter((v) => v.value && !Number.isNaN(Number(v.value)))
    .map((v) => Number(v.value));

  const average =
    numericVotes.length > 0
      ? (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(1)
      : null;

  const mostVoted = (() => {
    const allVotes = votes.filter((v) => v.value);
    if (allVotes.length === 0) return null;
    const freq: Record<string, number> = {};
    for (const v of allVotes) freq[v.value!] = (freq[v.value!] ?? 0) + 1;
    const maxCount = Math.max(...Object.values(freq));
    const top = Object.keys(freq).filter((k) => freq[k] === maxCount);

    const sortedTopVotes = [...top].sort((a, b) => {
      const aNumber = Number(a);
      const bNumber = Number(b);
      const aIsNumeric = !Number.isNaN(aNumber);
      const bIsNumeric = !Number.isNaN(bNumber);

      if (aIsNumeric && bIsNumeric) return bNumber - aNumber;
      if (aIsNumeric) return -1;
      if (bIsNumeric) return 1;

      return b.localeCompare(a, undefined, { numeric: true });
    });

    return sortedTopVotes[0] ?? null;
  })();

  if (!average && !mostVoted) return null;

  return (
    <div className="w-[250px] mx-auto bg-white dark:bg-black text-center border border-gray-200 dark:border-gray-400 rounded-lg p-6">
      {average && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2">
            Average estimate
          </p>
          <p className="text-6xl font-extrabold text-[#00aaa6]">{average}</p>
          <p className="text-xs mt-1">story points</p>
        </>
      )}
      {mostVoted && (
        <div
          className={
            average
              ? 'mt-4 pt-4 border-t border-gray-200 dark:border-gray-600'
              : ''
          }
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-1">
            Most voted
          </p>
          <p className="text-3xl font-bold text-[#00aaa6]">{mostVoted}</p>
          <p className="text-xs mt-1">story points</p>
        </div>
      )}
    </div>
  )
};

export default AverageEstimate;
