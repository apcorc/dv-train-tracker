import React, { useEffect, useState } from 'react';
import { AnyConsistItem, JobItem, JobStatus, StaticConsistItem } from '../types/ConsistItem';
import { locomotives } from '../types/Locomotive';
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

// Components for each concretion
const Locomotive: React.FC<{ item: StaticConsistItem }> = ({ item }) => {
  // Find the locomotive by id
  const loco = locomotives.find(l => l.id === item.id);

  if (!loco) {
    return <div><strong>Locomotive:</strong> {item.id} (Not found)</div>;
  }

  return (
    <div>
      <strong>Locomotive:</strong> {loco.display_name}
      {loco.nickname && ` (${loco.nickname})`}
      {' '} (Weight: {loco.weight}, Length: {loco.length})
    </div>
  );
};

const Job: React.FC<{ item: JobItem }> = ({ item }) => (
  <div>
    <strong>Job:</strong> {item.id} (Weight: {item.weight}, Length: {item.length})
    <br />
    From {locationName(item.start_location)} to {locationName(item.end_location)}.<br />
    Bonus Time Limit: {Math.round(item.bonus_time_limit / 60)} min<br />
    Bonus Time Elapsed: {Math.round(item.bonus_time_elapsed / 60)} min<br />
    Status: {statusText(item.status)}
  </div>
);

const Consist: React.FC = () => {
  const [items, setItems] = useState<AnyConsistItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('consistItems');
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  const removeItem = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
    localStorage.setItem('consistItems', JSON.stringify(updated));
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setItems(updated);
    localStorage.setItem('consistItems', JSON.stringify(updated));
  };

  return (
    <div>
      <h1>Consist</h1>
      <a href="./#/locomotives">Add Locomotive</a>&nbsp;<a href="./#/newjob">Add Job</a>
      <p>Total weight: { totalWeight(items) }t</p>
      <p>Total length: { totalLength(items) }m</p>
      <ul>
        {items.map((item, idx) => (
          <li key={idx}>
            {isStaticItem(item) && <Locomotive item={item} />}
            {isJob(item) && <Job item={item} />}
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
