import React from 'react';

interface TicketBannerProps {
  editingTicket: boolean;
  setEditingTicket: (v: boolean) => void;
  ticketDraft: string;
  setTicketDraft: (v: string) => void;
  handleSaveTicket: () => void;
  roomData: { ticketName?: string; revealed?: boolean } | null | undefined;
  statusText: string;
}

const TicketBanner: React.FC<TicketBannerProps> = ({
  editingTicket,
  setEditingTicket,
  ticketDraft,
  setTicketDraft,
  handleSaveTicket,
  roomData,
  statusText,
}) => {
  return (
	<div className="bg-white dark:bg-[#00203e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
	  {editingTicket ? (
		<div className="flex gap-2">
		  <input
			type="text"
			value={ticketDraft}
			onChange={(e) => setTicketDraft(e.target.value)}
			onKeyDown={(e) => {
			  if (e.key === 'Enter') handleSaveTicket();
			  if (e.key === 'Escape') setEditingTicket(false);
			}}
			className="flex-1 border-2 border-blue-400 rounded-lg px-3 py-2 text-base focus:outline-none dark:bg-gray-700 dark:text-white"
			autoFocus
		  />
		  <button
			onClick={handleSaveTicket}
			className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
		  >
			Save
		  </button>
		  <button
			onClick={() => setEditingTicket(false)}
			className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium"
		  >
			Cancel
		  </button>
		</div>
	  ) : (
		<button
		  type="button"
		  className="group flex items-start gap-2 w-full text-left"
		  onClick={() => {
			if (roomData && !roomData.revealed) {
			  setTicketDraft(roomData.ticketName || '');
			  setEditingTicket(true);
			}
		  }}
		>
		  <div className="flex-1">
			<p className="text-xs font-medium uppercase tracking-wider mb-1">
			  Currently voting on (optional):
			</p>
			<h2 className="text-xl font-bold ">
			  {roomData?.ticketName || (
				<span className="text-gray-400 dark:text-gray-500 font-normal italic">
				  No ticket — click to set one
				</span>
			  )}
			</h2>
		  </div>
		</button>
	  )}
	  <p className="text-xs mt-2">{statusText}</p>
	</div>
  );
};

export default TicketBanner;

