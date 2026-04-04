import React from 'react';

interface PokerTableProps {
  statusText: string;
}

const PokerTable: React.FC<PokerTableProps> = ({ statusText }) => {
  return (
    <div className="w-full p-5 flex items-center justify-center">
        <p className="relative z-10 uppercase font-bold text-black dark:text-white text-sm font-xl tracking-wider text-center">
          {statusText}
        </p>
    </div>
  );
};

export default PokerTable;
