import React from 'react';
import { StaticConsistItem } from '../types/ConsistItem';
import { locomotives } from '../types/Locomotive';

const ConsistLocomotive: React.FC<{
  item: StaticConsistItem;
  onStart: () => void;
  onStop: () => void;
}> = ({ item, onStart, onStop }) => {
  const loco = locomotives.find(l => l.id === item.id);

  if (!loco) {
    return (
      <div className="px-4 py-4 text-sm">
        <strong>Locomotive:</strong> {item.id} (Not found)
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[64px] w-full flex-1 items-stretch">
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="rounded bg-rail-steel/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-rail-steel dark:bg-rail-amber/15 dark:text-rail-signal">
            Loco
          </span>
          <span className="font-semibold text-rail-ink dark:text-white">
            {loco.display_name}
            {loco.nickname && (
              <span className="font-normal text-slate-500 dark:text-slate-400">
                {' '}
                ({loco.nickname})
              </span>
            )}
          </span>
        </div>
        {item.can_run && (
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`inline-flex h-2 w-2 rounded-full ${
                item.is_on ? 'animate-pulse-soft bg-rail-go' : 'bg-rail-stop'
              }`}
            />
            <span className={item.is_on ? 'font-medium text-rail-go' : 'font-medium text-rail-stop'}>
              {item.is_on ? 'Running' : 'Stopped'}
            </span>
            <span className="text-slate-400">
              · {loco.weight}t · {loco.length}m
            </span>
          </div>
        )}
        {!item.can_run && (
          <div className="text-sm text-slate-500">
            {loco.weight}t · {loco.length}m · No load rating
          </div>
        )}
      </div>

      {item.can_run ? (
        <button
          onClick={item.is_on ? onStop : onStart}
          className={`action-strip ${
            item.is_on
              ? 'bg-rail-go hover:bg-emerald-600'
              : 'bg-slate-400 hover:bg-slate-500 dark:bg-slate-600 dark:hover:bg-slate-500'
          }`}
          aria-label={item.is_on ? 'Stop Locomotive' : 'Start Locomotive'}
          type="button"
        >
          <span className="text-2xl leading-none" aria-hidden>
            ⏻
          </span>
        </button>
      ) : (
        <div
          className="action-strip cursor-default bg-slate-300 text-slate-100 dark:bg-slate-700"
          aria-label="Locomotive cannot run"
        >
          <span className="text-2xl leading-none opacity-60" aria-hidden>
            ⏻
          </span>
        </div>
      )}
    </div>
  );
};

export default ConsistLocomotive;
