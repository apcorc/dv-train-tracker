import React from 'react';
import { LocomotiveLoadRating } from '../types/Locomotive';

const getLoadTone = (weight: number, load: number) => {
  if (load === 0) {
    return {
      text: 'text-slate-400',
      bar: 'bg-slate-300 dark:bg-slate-600',
      label: 'No power',
    };
  }
  const ratio = weight / load;
  if (ratio < 0.75) {
    return { text: 'text-rail-go', bar: 'bg-rail-go', label: 'Comfortable' };
  }
  if (ratio < 0.85) {
    return { text: 'text-rail-signal', bar: 'bg-rail-signal', label: 'Watch grade' };
  }
  if (ratio < 1) {
    return { text: 'text-rail-caution', bar: 'bg-rail-caution', label: 'Near limit' };
  }
  return { text: 'text-rail-stop', bar: 'bg-rail-stop', label: 'Overloaded' };
};

const StatCard: React.FC<{
  label: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ label, children, className = '', style }) => (
  <div
    className={`panel flex min-h-[140px] flex-1 flex-col justify-center px-3 py-4 text-center sm:min-h-[160px] sm:px-4 ${className}`}
    style={style}
  >
    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
      {label}
    </div>
    <div className="mt-2">{children}</div>
  </div>
);

const Dashboard: React.FC<{ length: number; weight: number; load: LocomotiveLoadRating }> = ({
  length,
  weight,
  load,
}) => {
  const tone = getLoadTone(weight, load.grade_2_dry);
  const ratio = load.grade_2_dry > 0 ? Math.min(weight / load.grade_2_dry, 1.25) : 0;
  const fill = Math.min(ratio * 100, 100);

  return (
    <div className="mb-6 animate-fade-up">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-[0.04em] text-rail-ink dark:text-white sm:text-4xl">
            Consist
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Weight, length, and live load rating
          </p>
        </div>
        <div
          className={`hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex ${tone.text} bg-white/70 ring-1 ring-inset ring-current/20 dark:bg-slate-900/70`}
        >
          {tone.label}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard label="Total Weight" style={{ animationDelay: '40ms' }} className="animate-fade-up">
          <div className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {weight}
            <span className="ml-0.5 text-lg font-semibold text-slate-400 sm:text-xl">t</span>
          </div>
        </StatCard>

        <StatCard label="Total Length" style={{ animationDelay: '80ms' }} className="animate-fade-up">
          <div className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {length}
            <span className="ml-0.5 text-lg font-semibold text-slate-400 sm:text-xl">m</span>
          </div>
        </StatCard>

        <StatCard label="Load Rating" style={{ animationDelay: '120ms' }} className="animate-fade-up">
          <div className={`font-display text-3xl font-bold tracking-tight sm:text-4xl ${tone.text}`}>
            {load.grade_2_dry}
            <span className="ml-0.5 text-lg font-semibold opacity-70 sm:text-xl">t</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            ☀ 2% dry
          </div>
          <div className="mx-auto mt-3 h-1.5 w-full max-w-[7rem] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${tone.bar}`}
              style={{ width: `${fill}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between gap-1 text-[10px] leading-tight text-slate-500 dark:text-slate-400">
            <span>
              {load.grade_0_dry}t
              <br />
              ☀ 0%
            </span>
            <span>
              {load.grade_2_wet}t
              <br />
              ⛆ 2%
            </span>
          </div>
        </StatCard>
      </div>
    </div>
  );
};

export default Dashboard;
