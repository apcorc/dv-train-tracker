import React, { useEffect, useState } from 'react';
import { AnyConsistItem, JobItem, JobStatus, StaticConsistItem } from '../types/ConsistItem';
import { LocomotiveLoadRating, locomotives } from '../types/Locomotive';
import Dashboard from '../components/Dashboard';
import ItemRow from '../components/ItemRow';
import ConsistLocomotive from '../components/ConsistLocomotive';
import Job from '../components/Job';
import Layout from '../components/Layout';
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
  return 0;
}

function length(item: AnyConsistItem): number {
  if (isStaticItem(item)) {
    const loco = locomotives.find(l => l.id === item.id);
    return loco ? loco.length : 0;
  }
  if (isJob(item)) {
    return item.length;
  }
  return 0;
}

export function getBonusTimeRemaining(item: JobItem): number {
  if (item.status === JobStatus.Active && item.end_timestamp) {
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, item.end_timestamp - now);
  }
  return Math.max(0, item.bonus_time_limit - (item.bonus_time_elapsed || 0));
}

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    animateLayoutChanges: args => {
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
      }}
      className={`mb-2.5 touch-none select-none ${
        isDragging ? 'z-10 cursor-grabbing opacity-70' : 'cursor-grab'
      }`}
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
      if (i !== idx || !isStaticItem(item) || item.is_on) {
        return item;
      }
      return { ...item, is_on: true };
    });
    persist(updated);
  };

  const stopLocomotive = (idx: number) => {
    const updated = items.map((item, i) => {
      if (i !== idx || !isStaticItem(item) || !item.is_on) {
        return item;
      }
      return { ...item, is_on: false };
    });
    persist(updated);
  };

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

  const pauseJob = (idx: number) => {
    const updated = items.map((item, i) => (i === idx ? pauseJobItem(item) : item));
    persist(updated);
  };

  const pauseAll = () => {
    const updated = items.map(item => pauseJobItem(item));
    persist(updated);
  };

  const resumeAll = () => {
    const updated = items.map(item => resumeJobItem(item));
    persist(updated);
  };

  const jobs = items.filter(isJob);
  const noJobs = jobs.length === 0;
  const anyActiveJobs = jobs.some(j => j.status === JobStatus.Active);
  const allNotStarted = jobs.every(j => j.status === JobStatus.NotStarted);
  const anyPausedJobs = jobs.some(j => j.status === JobStatus.Paused);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  return (
    <Layout>
      <Dashboard
        length={totalLength(items)}
        weight={totalWeight(items)}
        load={totalLoadRating(items)}
      />

      <div className="mb-6 flex flex-wrap items-center gap-2 animate-fade-up" style={{ animationDelay: '160ms' }}>
        {(noJobs || allNotStarted) && (
          <span className="btn-secondary pointer-events-none opacity-80">Jobs Not Started</span>
        )}
        {anyPausedJobs && (
          <button type="button" onClick={resumeAll} className="btn-primary">
            Resume All Jobs
          </button>
        )}
        {anyActiveJobs && (
          <button type="button" onClick={pauseAll} className="btn-secondary">
            Pause All Jobs
          </button>
        )}
        <Link to="/locomotives" className="btn-secondary no-underline">
          Add Locomotive
        </Link>
        <Link to="/newjob" className="btn-primary no-underline">
          Add Job
        </Link>
      </div>

      <section className="animate-fade-up" style={{ animationDelay: '200ms' }}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold uppercase tracking-[0.06em] text-rail-steel dark:text-slate-200">
            Train Order
          </h2>
          <span className="text-xs font-medium text-slate-400">
            {items.length === 0 ? 'Empty' : `${items.length} car${items.length === 1 ? '' : 's'} · drag to reorder`}
          </span>
        </div>

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
              <div className="panel flex flex-col items-center justify-center px-6 py-14 text-center">
                <div className="mb-2 font-display text-2xl font-bold uppercase tracking-[0.08em] text-slate-400">
                  No cars yet
                </div>
                <p className="mb-5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  Add a locomotive and jobs to build your consist. Load ratings update as you power units on and off.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Link to="/locomotives" className="btn-secondary no-underline">
                    Add Locomotive
                  </Link>
                  <Link to="/newjob" className="btn-primary no-underline">
                    Add Job
                  </Link>
                </div>
              </div>
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
                      className="action-strip bg-rail-stop hover:bg-red-600"
                      aria-label="Remove"
                      type="button"
                    >
                      <span className="text-2xl font-bold leading-none" aria-hidden>
                        ×
                      </span>
                    </button>
                  }
                />
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      </section>
    </Layout>
  );
};

export default Consist;
