import React from 'react';
import { JobItem, JobLocation, JobStatus, JobType } from '../types/ConsistItem';
import { getBonusTimeRemaining } from '../pages/Consist';
import { stations } from '../types/Station';

function statusText(status: JobStatus): string {
  switch (status) {
    case JobStatus.NotStarted:
      return 'Not Started';
    case JobStatus.Active:
      return 'Active';
    case JobStatus.Paused:
      return 'Paused';
    default:
      return 'Unknown';
  }
}

function formatTime(seconds: number): string {
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const ss = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mm}:${ss}`;
}

function locationName(location: JobLocation): string {
  const station = stations.find(s => s.code === location.station_code);
  const yard = station?.yards.find(y => y.id === location.yard_id);
  const track = yard?.tracks.find(t => t.number === location.track_number);

  if (!station || !yard || !track) {
    return location.station_code + '-' + location.yard_id + '-' + location.track_number;
  }

  return station.name + ' ' + track.display_name;
}

function jobTypeMeta(type?: JobType) {
  switch (type) {
    case JobType.Freight:
      return { stripe: 'bg-rail-go', badge: 'bg-rail-go/15 text-rail-go', label: 'Freight' };
    case JobType.Shunting:
      return { stripe: 'bg-rail-stop', badge: 'bg-rail-stop/15 text-rail-stop', label: 'Shunting' };
    case JobType.Logistics:
      return {
        stripe: 'bg-rail-signal',
        badge: 'bg-rail-signal/20 text-amber-800 dark:text-rail-signal',
        label: 'Logistics',
      };
    default:
      return {
        stripe: 'bg-slate-300',
        badge: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
        label: 'Job',
      };
  }
}

function statusTone(status: JobStatus) {
  switch (status) {
    case JobStatus.Active:
      return 'text-rail-go';
    case JobStatus.Paused:
      return 'text-rail-caution';
    default:
      return 'text-slate-500 dark:text-slate-400';
  }
}

const Job: React.FC<{
  item: JobItem;
  onStart: () => void;
  onPause: () => void;
}> = ({ item, onStart, onPause }) => {
  const remaining = getBonusTimeRemaining(item);
  const meta = jobTypeMeta(item.type);
  const canStart = item.status === JobStatus.NotStarted || item.status === JobStatus.Paused;

  return (
    <div className="flex h-full min-h-[64px] w-full flex-1 items-stretch">
      <div className={`w-1.5 shrink-0 ${meta.stripe}`} />

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-3 py-3 sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${meta.badge}`}
          >
            {meta.label}
          </span>
          <span className="font-mono text-sm font-semibold text-rail-ink dark:text-white">
            {item.id}
          </span>
          <span className={`text-xs font-medium ${statusTone(item.status)}`}>
            {statusText(item.status)}
          </span>
        </div>

        {(item.weight > 0 || item.length > 0) && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {item.weight > 0 && <span className="mr-2">{item.weight}t</span>}
            {item.length > 0 && <span>{item.length}m</span>}
          </div>
        )}

        {item.start_location && (
          <div
            className={
              item.status === JobStatus.NotStarted
                ? 'text-sm font-medium text-rail-ink dark:text-slate-100'
                : 'text-xs text-slate-500 dark:text-slate-400'
            }
          >
            Pickup · {locationName(item.start_location)}
          </div>
        )}
        {item.end_location && (
          <div
            className={
              item.status !== JobStatus.NotStarted
                ? 'text-sm font-medium text-rail-ink dark:text-slate-100'
                : 'text-xs text-slate-500 dark:text-slate-400'
            }
          >
            Deliver · {locationName(item.end_location)}
          </div>
        )}
      </div>

      {item.bonus_time_limit > 0 && (
        <div className="flex w-[5.5rem] shrink-0 flex-col items-center justify-center border-l border-rail-line/70 px-2 dark:border-slate-700">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Bonus
          </span>
          <span
            className={`font-mono text-lg font-semibold tabular-nums ${
              item.status === JobStatus.Active && remaining < 60
                ? 'animate-pulse-soft text-rail-stop'
                : 'text-rail-ink dark:text-white'
            }`}
          >
            {formatTime(remaining)}
          </span>
        </div>
      )}

      <button
        onClick={canStart ? onStart : onPause}
        className="action-strip bg-rail-go hover:bg-emerald-600"
        aria-label={canStart ? 'Start Job' : 'Pause Job'}
        type="button"
      >
        <span className="text-xl leading-none" aria-hidden>
          {canStart ? '▶' : '⏸'}
        </span>
      </button>
    </div>
  );
};

export default Job;
