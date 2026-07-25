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
            gap: 8,
            minHeight: 56,
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
                alignItems: 'center',
                gap: 8,
                minWidth: 0,
            }}>
                <div style={{ flex: 1, minWidth: 0 }}>
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
                    {item.start_location && (
                      <>
                        <span style={
                            item.status === JobStatus.NotStarted ? {
                                fontSize: 15,
                            } : {
                                fontSize: 13,
                                color: '#888',
                            }
                        }>
                            Pickup from {locationName(item.start_location)}
                        </span>
                        <br />
                      </>
                    )}
                    {item.end_location && (
                      <>
                        <span style={
                            item.status !== JobStatus.NotStarted ? {
                                fontSize: 15,
                            } : {
                                fontSize: 13,
                                color: '#888',
                            }
                        }>
                            Deliver to {locationName(item.end_location)}
                        </span>
                        <br />
                      </>
                    )}
                    <span style={{ fontSize: 13, color: '#888' }}>Status: {statusText(item.status)}</span>
                </div>
                {/* Bonus Time */}
                <div style={{
                    width: 100,
                    textAlign: 'center',
                    minHeight: 38,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 8,
                }}>
                    {item.bonus_time_limit > 0 && (
                        <>
                            <span>Bonus Time:</span>
                            <span>{formatTime(remaining)}</span>
                        </>
                    )}
                </div>
                {/* Start/Pause Button */}
                <div style={{
                    width: 50,
                    minWidth: 50,
                    maxWidth: 50,
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 8,
                }}>
                    <button
                        onClick={item.status === JobStatus.NotStarted || item.status === JobStatus.Paused ? onStart : onPause}
                        className="job-power-btn"
                        aria-label={item.status === JobStatus.NotStarted || item.status === JobStatus.Paused ? "Start Job" : "Pause Job"}
                        type="button"
                        tabIndex={0}
                    >
                        <span style={{
                            color: '#fff',
                            fontSize: 28,
                            lineHeight: 1,
                            pointerEvents: 'none',
                            userSelect: 'none',
                        }}>
                            {(item.status === JobStatus.NotStarted || item.status === JobStatus.Paused) ? '▶' : '⏸'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Job;