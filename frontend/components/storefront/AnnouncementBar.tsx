import React from 'react';

interface AnnouncementBarProps {
  text?: string;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  text = 'COMPLIMENTARY DOMESTIC COURIER ON ALL ORDERS OVER EGP 1,500'
}) => {
  return (
    <div className="bg-noir-950 text-white text-[11px] font-medium tracking-luxury py-2.5 px-4 text-center select-none border-b border-white/10">
      <div className="container mx-auto flex items-center justify-center gap-3">
        <span>{text}</span>
      </div>
    </div>
  );
};
