import React from "react";

interface AverageEstimateProps {
  average: string | null;
}

const AverageEstimate: React.FC<AverageEstimateProps> = ({ average }) => {
  if (!average) return null;

  return (
    <div className="w-[250px] mx-auto bg-white dark:bg-black text-center border border-gray-200 dark:border-gray-400 rounded-lg p-6">
      <p className="text-xs font-medium uppercase tracking-wider mb-2">
        Average estimate
      </p>
      <p className="text-6xl font-extrabold text-black dark:text-white">
        {average}
      </p>
      <p className="text-xs mt-1">story points</p>
    </div>
  )
};

export default AverageEstimate;
