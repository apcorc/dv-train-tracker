import React, { useEffect, useState } from 'react';
import { AnyConsistItem, JobItem, JobStatus, StaticConsistItem } from '../types/ConsistItem';
import { LocomotiveLoadRating, locomotives } from '../types/Locomotive';
import Dashboard from '../components/Dashboard';
import ItemRow from '../components/ItemRow';
import ConsistLocomotive from '../components/ConsistLocomotive';
import Job from '../components/Job';
import { Link } from 'react-router-dom';

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
            if (loco && loco.load_rating) {
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

export function getBonusTimeRemaining(item: JobItem): number {
  if (item.status === JobStatus.Active && item.end_timestamp) {
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, item.end_timestamp - now);
  }
  // If paused or not started, remaining = limit - elapsed
  return Math.max(0, item.bonus_time_limit - (item.bonus_time_elapsed || 0));
}

const Consist: React.FC = () => {
  const [items, setItems] = useState<AnyConsistItem[]>([]);
  const [, setTick] = useState(0);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('consistItems');
    if (stored) {
      setItems(JSON.parse(stored));
    }
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

  const startLocomotive = (idx: number) => {
    const updated = items.map((item, i) => {
      if (i !== idx || !isStaticItem(item) || item.is_on) { return item; }
      return { ...item, is_on: true }
    });
    persist(updated);
  };

  const stopLocomotive = (idx: number) => {
    const updated = items.map((item, i) => {
      if (i !== idx || !isStaticItem(item) || !item.is_on) { return item; }
      return { ...item, is_on: false }
    });
    persist(updated);
  };

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
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 8px' }}>
      <Dashboard
        length={totalLength(items)}
        weight={totalWeight(items)}
        load={totalLoadRating(items)}
      />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <button onClick={allPaused ? resumeAll : pauseAll} style={{ minWidth: 120 }}>
          {allPaused ? 'Resume All Jobs' : 'Pause All Jobs'}
        </button>
        <Link to="/locomotives" style={{ minWidth: 120, textAlign: 'center', lineHeight: '32px', background: '#eaf1fb', borderRadius: 6, padding: '0 12px', textDecoration: 'none' }}>Add Locomotive</Link>
        <Link to="/newjob" style={{ minWidth: 120, textAlign: 'center', lineHeight: '32px', background: '#eaf1fb', borderRadius: 6, padding: '0 12px', textDecoration: 'none' }}>Add Job</Link>
      </div>
      <div>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>No items in consist.</div>
        )}
        {items.map((item, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={() => setDraggedIdx(idx)}
            onDragOver={e => {
              e.preventDefault();
              if (draggedIdx === null || draggedIdx === idx) return;
              const updated = [...items];
              const [dragged] = updated.splice(draggedIdx, 1);
              updated.splice(idx, 0, dragged);
              setDraggedIdx(idx);
              setItems(updated);
            }}
            onDragEnd={() => {
              setDraggedIdx(null);
              persist(items);
            }}
            style={{
              opacity: draggedIdx === idx ? 0.7 : 1,
              userSelect: 'none',
              marginBottom: 8,
              cursor: 'move',
            }}
          >
            <ItemRow
              left={
                isStaticItem(item) ? (
                  <ConsistLocomotive
                    item={item}
                    onStart={() => startLocomotive(idx)}
                    onStop={() => stopLocomotive(idx)}
                  />
                ) : isJob(item) ? (
                  <Job
                    item={item}
                    onStart={() => startJob(idx)}
                    onPause={() => pauseJob(idx)}
                  />
                ) : null
              }
              right={
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => moveItem(idx, idx - 1)}
                    disabled={idx === 0}
                    title="Move Up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveItem(idx, idx + 1)}
                    disabled={idx === items.length - 1}
                    title="Move Down"
                  >
                    ↓
                  </button>
                  <button onClick={() => removeItem(idx)}>Remove</button>
                </div>
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Consist;
