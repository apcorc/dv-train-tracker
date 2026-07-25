import React, { useEffect, useState } from 'react';
import { AnyConsistItem, JobItem, JobStatus, StaticConsistItem } from '../types/ConsistItem';
import { LocomotiveLoadRating, locomotives } from '../types/Locomotive';
import Dashboard from '../components/Dashboard';
import ItemRow from '../components/ItemRow';
import ConsistLocomotive from '../components/ConsistLocomotive';
import Job from '../components/Job';
import { Link } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// Helper for sortable item
function SortableItem({ id, children }: { id: string, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    animateLayoutChanges: (args) => {
      // Only animate the dragged item
      if (args.isDragging) return true;
      return false;
    },
  });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
        marginBottom: 8,
        cursor: 'grab',
        userSelect: 'none',
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

const Consist: React.FC = () => {
  const [items, setItems] = useState<AnyConsistItem[]>([]);
  const [, setTick] = useState(0);

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
  const noJobs = jobs.length === 0;
  const anyActiveJobs = jobs.some(j => j.status === JobStatus.Active);
  const allNotStarted = jobs.every(j => j.status === JobStatus.NotStarted);
  const anyPausedJobs = jobs.some(j => j.status === JobStatus.Paused);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 8px' }}>
      <Dashboard
        length={totalLength(items)}
        weight={totalWeight(items)}
        load={totalLoadRating(items)}
      />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {
            (noJobs || allNotStarted) && (
                <Link to="#" className='card' style={{ minWidth: 120, textAlign: 'center', lineHeight: '32px', borderRadius: 6, padding: '0 12px', textDecoration: 'none', cursor: 'default' }}>Jobs Not Started</Link>
            )
        }
        {
            anyPausedJobs && (
                <Link to="#" onClick={resumeAll} className='card' style={{ minWidth: 120, textAlign: 'center', lineHeight: '32px', borderRadius: 6, padding: '0 12px', textDecoration: 'none' }}>Resume All Jobs</Link>
            )
        }
        {
            anyActiveJobs && (
                <Link to="#" onClick={pauseAll} className='card' style={{ minWidth: 120, textAlign: 'center', lineHeight: '32px', borderRadius: 6, padding: '0 12px', textDecoration: 'none' }}>Pause All Jobs</Link>
            )
        }
        
        <Link to="/locomotives" style={{ minWidth: 120, textAlign: 'center', lineHeight: '32px',  borderRadius: 6, padding: '0 12px', textDecoration: 'none' }} className='card'>Add Locomotive</Link>
        <Link to="/newjob" style={{ minWidth: 120, textAlign: 'center', lineHeight: '32px', borderRadius: 6, padding: '0 12px', textDecoration: 'none' }} className='card'>Add Job</Link>
      </div>
      <div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => {
            if (active.id !== over?.id) {
              const oldIndex = items.findIndex((_, idx) => String(idx) === active.id);
              const newIndex = items.findIndex((_, idx) => String(idx) === over?.id);
              const updated = arrayMove(items, oldIndex, newIndex);
              persist(updated);
            }
          }}
        >
          <SortableContext
            items={items.map((_, idx) => String(idx))}
            strategy={verticalListSortingStrategy}
          >
            {items.length === 0 && (
              <div style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>No items in consist.</div>
            )}
            {items.map((item, idx) => (
              <SortableItem key={idx} id={String(idx)}>
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
                    <button
                      onClick={() => removeItem(idx)}
                      className="remove-btn"
                      aria-label="Remove"
                      tabIndex={0}
                      type="button"
                    >
                      <span style={{
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 28,
                        lineHeight: 1,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      }}>×</span>
                    </button>
                  }
                />
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default Consist;
