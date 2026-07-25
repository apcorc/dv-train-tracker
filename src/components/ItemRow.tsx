import React from 'react';

const ItemRow: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
}> = ({ left, right }) => (
  <div className="panel flex min-h-[64px] items-stretch overflow-hidden transition hover:shadow-lift">
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">{left}</div>
    <div className="flex shrink-0 self-stretch">{right}</div>
  </div>
);

export default ItemRow;
