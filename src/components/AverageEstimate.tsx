import React from "react";

interface AverageEstimateProps {
  average: string | null;
}

const AverageEstimate: React.FC<AverageEstimateProps> = ({ average }) => {
  if (!average) return null;

  return (
    <div className="bg-white dark:bg-[#00203e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-400 p-5 text-center">
      <p className="text-xs font-medium uppercase tracking-wider mb-2">
        Average estimate
      </p>
      <p className="text-6xl font-extrabold text-blue-600 dark:text-blue-400">
        {average}
      </p>
      <p className="text-xs mt-1">story points</p>
    </div>
  )
};

export default AverageEstimate;
