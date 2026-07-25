import React from 'react';
import { Locomotive, locomotives } from '../types/Locomotive';
import { StaticConsistItem } from '../types/ConsistItem';
import Layout from '../components/Layout';

const addToConsist = (item: Locomotive) => {
  const newItem: StaticConsistItem = {
    id: item.id,
    isStatic: true,
    is_on: true,
    can_run: item.load_rating !== null,
  };
  const existing = JSON.parse(localStorage.getItem('consistItems') || '[]');
  localStorage.setItem('consistItems', JSON.stringify([...existing, newItem]));
  window.location.href = `${process.env.PUBLIC_URL}/`;
};

const LocomotiveCard: React.FC<{ item: Locomotive; onClick: () => void; index: number }> = ({
  item,
  onClick,
  index,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="panel group flex min-h-[170px] w-full flex-col items-start justify-between p-4 text-left transition hover:-translate-y-0.5 hover:border-rail-amber/50 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-rail-amber animate-fade-up"
    style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    aria-label={`Add ${item.display_name} to consist`}
  >
    <div>
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {item.load_rating == null ? 'Unpowered' : 'Locomotive'}
      </div>
      <div className="font-display text-xl font-bold uppercase leading-tight tracking-[0.03em] text-rail-ink group-hover:text-rail-steel dark:text-white dark:group-hover:text-rail-signal">
        {item.display_name}
      </div>
      {item.nickname && (
        <div className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">({item.nickname})</div>
      )}
    </div>

    <div className="mt-4 w-full">
      <div className="mb-2 flex gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>{item.weight}t</span>
        <span>{item.length}m</span>
      </div>
      {item.load_rating ? (
        <div className="grid grid-cols-3 gap-1 border-t border-rail-line/70 pt-2 text-center text-[10px] dark:border-slate-700">
          <div>
            <div className="font-mono text-xs font-semibold text-rail-ink dark:text-slate-100">
              {item.load_rating.grade_0_dry}t
            </div>
            <div className="text-slate-400">☀ 0%</div>
          </div>
          <div>
            <div className="font-mono text-xs font-semibold text-rail-ink dark:text-slate-100">
              {item.load_rating.grade_2_dry}t
            </div>
            <div className="text-slate-400">☀ 2%</div>
          </div>
          <div>
            <div className="font-mono text-xs font-semibold text-rail-ink dark:text-slate-100">
              {item.load_rating.grade_2_wet}t
            </div>
            <div className="text-slate-400">⛆ 2%</div>
          </div>
        </div>
      ) : (
        <div className="border-t border-rail-line/70 pt-2 text-xs font-medium text-rail-stop dark:border-slate-700">
          No load rating
        </div>
      )}
    </div>
  </button>
);

const Locomotives: React.FC = () => {
  return (
    <Layout title="Add Locomotive" subtitle="Tap a unit to append it to your consist">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {locomotives.map((item, idx) => (
          <LocomotiveCard
            key={item.id || idx}
            item={item}
            index={idx}
            onClick={() => addToConsist(item)}
          />
        ))}
      </div>
    </Layout>
  );
};

export default Locomotives;
