import React from 'react';

interface TicketBannerProps {
  statusText: string;
}

const TicketBanner: React.FC<TicketBannerProps> = ({ statusText }) => {
  return (
	<div className="bg-white dark:bg-[#00203e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
	  <p className="text-xs mt-2">{statusText}</p>
	</div>
  );
};

export default TicketBanner;
