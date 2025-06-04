import React, { useEffect, useState } from 'react';
import { AnyConsistItem, JobItem, JobStatus, StaticConsistItem } from '../types/ConsistItem';
import { LocomotiveLoadRating, locomotives } from '../types/Locomotive';
import { stations } from '../types/Station';

// Type guards
function isStaticItem(item: AnyConsistItem): item is StaticConsistItem {
  return 'isStatic' in item;
}

function isJob(item: AnyConsistItem): item is JobItem {
  return 'start_location' in item;
}

function totalWeight(items: AnyConsistItem[]): number {
  return Math.round(items.reduce((acc, item) => acc + weight(item), 0));
}

function totalLength(items: AnyConsistItem[]): number {
  return Math.round(items.reduce((acc, item) => acc + length(item), 0));
}

function totalLoadRating(items: AnyConsistItem[]): LocomotiveLoadRating {
    const total: LocomotiveLoadRating = {
        grade_0_dry: 0,
        grade_2_dry: 0,
        grade_2_wet: 0,
    };
    
    items.forEach(item => {
        if (isStaticItem(item) && item.is_on) {
            const loco = locomotives.find(l => l.id === item.id);
            if (loco) {
                total.grade_0_dry += loco.load_rating.grade_0_dry;
                total.grade_2_dry += loco.load_rating.grade_2_dry;
                total.grade_2_wet += loco.load_rating.grade_2_wet;
            }
        }
    });
    
    return total;
}

function weight(item: AnyConsistItem): number {
    if (isStaticItem(item)) {
        const loco = locomotives.find(l => l.id === item.id);
        return loco ? loco.weight : 0;
    }
    if (isJob(item)) {
        return item.weight;
    }
    return 0; // Default case, should not happen
}

function length(item: AnyConsistItem): number {
    if (isStaticItem(item)) {
        const loco = locomotives.find(l => l.id === item.id);
        return loco ? loco.length : 0;
    }
    if (isJob(item)) {
        return item.length;
    }
    return 0; // Default case, should not happen
}

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

function locationName(location: string): string {
    const [station_code, yard_id, track_number] = location.split('-');

    if (!station_code || !yard_id || !track_number) {
        return location;
    }

    // Assuming you have a function or mapping to get station names by code
    const station = stations.find(s => s.code === station_code);
    const yard = station?.yards.find(y => y.id === yard_id);
    const track = yard?.tracks.find(t => t.number.toString() === track_number);
    
    if (!station || !yard || !track) {
        return location;
    }

    return station.name + ' ' + yard.id + ' ' + track.display_name;
}

function getBonusTimeRemaining(item: JobItem): number {
  if (item.status === JobStatus.Active && item.end_timestamp) {
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, item.end_timestamp - now);
  }
  // If paused or not started, remaining = limit - elapsed
  return Math.max(0, item.bonus_time_limit - (item.bonus_time_elapsed || 0));
}

// Components for each concretion
const Locomotive: React.FC<{ 
    item: StaticConsistItem;
    onStart: () => void;
    onStop: () => void; 
}> = ({ item, onStart, onStop }) => {
  // Find the locomotive by id
  const loco = locomotives.find(l => l.id === item.id);

  if (!loco) {
    return <div><strong>Locomotive:</strong> {item.id} (Not found)</div>;
  }

  return (
    <div>
      <strong>Locomotive:</strong> {loco.display_name}
      {loco.nickname && ` (${loco.nickname})`}
      {' '} (Weight: {loco.weight}, Length: {loco.length}) <br />
      {item.is_on ? (
        <button style={{ marginLeft: 8 }} onClick={onStop}>Stop</button>
      ) : (
        <button style={{ marginLeft: 8 }} onClick={onStart}>Start</button>
      )}
    </div>
  );
};

const formatTime = (seconds: number) => {
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const ss = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mm}:${ss}`;
};

const Job: React.FC<{
  item: JobItem;
  onStart: () => void;
  onPause: () => void;
}> = ({ item, onStart, onPause }) => {
  const remaining = getBonusTimeRemaining(item);

  return (
    <div>
      <strong>Job:</strong> {item.id} (Weight: {item.weight}, Length: {item.length})
      <br />
      From {locationName(item.start_location)} to {locationName(item.end_location)}.<br />
      Bonus Time Limit: {Math.round(item.bonus_time_limit / 60)} min<br />
      <strong>Bonus Time Remaining: {formatTime(remaining)}</strong><br />
      Status: {statusText(item.status)}
      {item.status === JobStatus.NotStarted || item.status === JobStatus.Paused ? (
        <button style={{ marginLeft: 8 }} onClick={onStart}>Start</button>
      ) : (
        <button style={{ marginLeft: 8 }} onClick={onPause}>Pause</button>
      )}
    </div>
  );
};

const Consist: React.FC = () => {
  const [items, setItems] = useState<AnyConsistItem[]>([]);
  const [, setTick] = useState(0); // for re-rendering timer

  useEffect(() => {
    const stored = localStorage.getItem('consistItems');
    if (stored) {
      setItems(JSON.parse(stored));
    }
    // Timer to update remaining time every second
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const persist = (updated: AnyConsistItem[]) => {
    setItems(updated);
    localStorage.setItem('consistItems', JSON.stringify(updated));
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    persist(updated);
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    persist(updated);
  };

  const startLocomotive = (item: AnyConsistItem) => {
    if (!isStaticItem(item)) { return }
    if (item.is_on) { return }
    const updated = items.map(i => (i.id === item.id ? { ...i, is_on: true } : i));
    persist(updated);
  }

  const stopLocomotive = (item: AnyConsistItem) => {
    if (!isStaticItem(item)) { return }
    if (!item.is_on) { return }
    const updated = items.map(i => (i.id === item.id ? { ...i, is_on: false } : i));
    persist(updated);
  }

  // Helper to pause a job item
  function pauseJobItem(item: AnyConsistItem): AnyConsistItem {
    if (!isJob(item) || item.status !== JobStatus.Active || !item.end_timestamp) return item;
    const timeSpent = Math.max(0, item.bonus_time_limit - getBonusTimeRemaining(item));
    return {
      ...item,
      status: JobStatus.Paused,
      bonus_time_elapsed: timeSpent,
      end_timestamp: undefined,
    };
  }

  // Helper to resume a job item (only if paused)
  function resumeJobItem(item: AnyConsistItem): AnyConsistItem {
    if (!isJob(item) || item.status !== JobStatus.Paused) return item;
    const now = Math.floor(Date.now() / 1000);
    const remaining = item.bonus_time_limit - (item.bonus_time_elapsed || 0);
    return {
      ...item,
      status: JobStatus.Active,
      end_timestamp: now + remaining,
    };
  }

  // Start a job: set status, end_timestamp
  const startJob = (idx: number) => {
    const updated = items.map((item, i) => {
      if (i !== idx || !isJob(item)) return item;
      const now = Math.floor(Date.now() / 1000);
      const remaining = item.bonus_time_limit - (item.bonus_time_elapsed || 0);
      return {
        ...item,
        status: JobStatus.Active,
        end_timestamp: now + remaining,
      };
    });
    persist(updated);
  };

  // Pause a job: update elapsed, clear end_timestamp, set status
  const pauseJob = (idx: number) => {
    const updated = items.map((item, i) => (i === idx ? pauseJobItem(item) : item));
    persist(updated);
  };

  // Pause all active jobs
  const pauseAll = () => {
    const updated = items.map(item => pauseJobItem(item));
    persist(updated);
  };

  // Resume all paused jobs (do not start NotStarted jobs)
  const resumeAll = () => {
    const updated = items.map(item => resumeJobItem(item));
    persist(updated);
  };

  // Determine if all jobs are paused (and at least one is a job)
  const jobs = items.filter(isJob);
  const allPaused = jobs.length > 0 && jobs.every(j => j.status !== JobStatus.Active);

  return (
    <div>
      <h1>Consist</h1>
      <button onClick={allPaused ? resumeAll : pauseAll}>
        {allPaused ? 'Resume All' : 'Pause All'}
      </button>
      <a href="./#/locomotives" style={{ marginLeft: 16 }}>Add Locomotive</a>
      <a href="./#/newjob" style={{ marginLeft: 8 }}>Add Job</a>
      <p>Total weight: { totalWeight(items) }t</p>
      <p>Total length: { totalLength(items) }m</p>
      <p>Total Load Rating (2% Dry) { totalLoadRating(items).grade_2_dry }t</p>
      <ul>
        {items.map((item, idx) => (
          <li key={idx}>
            {isStaticItem(item) && (
                <Locomotive 
                  item={item} 
                  onStart={() => startLocomotive(item)} 
                  onStop={() => stopLocomotive(item)} 
                />
            )}
            {isJob(item) && (
              <Job
                item={item}
                onStart={() => startJob(idx)}
                onPause={() => pauseJob(idx)}
              />
            )}
            <button style={{ marginLeft: 8 }} onClick={() => removeItem(idx)}>
              Remove
            </button>
            <button
              style={{ marginLeft: 4 }}
              onClick={() => moveItem(idx, idx - 1)}
              disabled={idx === 0}
              title="Move Up"
            >
              ↑
            </button>
            <button
              style={{ marginLeft: 2 }}
              onClick={() => moveItem(idx, idx + 1)}
              disabled={idx === items.length - 1}
              title="Move Down"
            >
              ↓
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Consist;
