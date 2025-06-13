import React from 'react';
import { JobItem, JobStatus, JobType } from '../types/ConsistItem';
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

    return station.name + ' ' + track.display_name;
}

function jobTypeColor(type?: JobType): string {
    switch (type) {
        case JobType.Freight:
            return '#27ae60'; // green
        case JobType.Shunting:
            return '#c0392b'; // red
        case JobType.Logistics:
            return '#f1c40f'; // yellow
        default:
            return '#bbb';    // gray
    }
}

const Job: React.FC<{
    item: JobItem;
    onStart: () => void;
    onPause: () => void;
}> = ({ item, onStart, onPause }) => {
    const remaining = getBonusTimeRemaining(item);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'stretch',
            flexWrap: 'wrap',
            gap: 8,
        }}>
            {/* Colored stripe */}
            <div
                style={{
                    width: 6,
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    background: jobTypeColor(item.type),
                    marginRight: 6,
                    minHeight: 56,
                }}
            />
            {/* Main content */}
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
            }}>
                <div>
                    <span>{item.id}</span>
                    <br />
                    {(item.weight > 0) && (
                        <span style={{ color: '#888', paddingRight: 8 }}>
                            Weight: {item.weight}
                        </span>
                    )}
                    {(item.length > 0) && (
                        <span style={{ color: '#888' }}>
                            Length: {item.length}
                        </span>
                    )}
                    {(item.weight > 0 || item.length > 0) && <br />}
                    {(item.start_location && item.end_location) && (
                        <span style={{ fontSize: 13 }}>
                            From <b>{locationName(item.start_location)}</b> to <b>{locationName(item.end_location)}</b>
                            <br />
                        </span>
                    )}
                    {(item.start_location && !item.end_location) && (
                        <span style={{ fontSize: 13 }}>
                            From <b>{locationName(item.start_location)}</b>
                            <br />
                        </span>
                    )}
                    {(!item.start_location && item.end_location) && (
                        <span style={{ fontSize: 13 }}>
                            To <b>{locationName(item.end_location)}</b>
                            <br />
                        </span>
                    )}
                    {item.bonus_time_limit > 0 && (
                        <span style={{ fontSize: 13 }}>
                            Bonus Time Limit: {Math.round(item.bonus_time_limit / 60)} min |{' '}
                            <strong>Remaining: {formatTime(remaining)}</strong>
                            <br />
                        </span>
                    )}
                    <span style={{ fontSize: 13, color: '#888' }}>Status: {statusText(item.status)}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {item.status === JobStatus.NotStarted || item.status === JobStatus.Paused ? (
                        <button onClick={onStart}>Start</button>
                    ) : (
                        <button onClick={onPause}>Pause</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Job;