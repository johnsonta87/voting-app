import React from 'react';

interface TicketBannerProps {
  statusText: string;
}

const StatusBanner: React.FC<TicketBannerProps> = ({ statusText }) => {
  return (
	<div className="bg-white dark:bg-[#00203e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
	  <h2 className="mt-2">{statusText}</h2>
	</div>
  );
};

export default StatusBanner;
