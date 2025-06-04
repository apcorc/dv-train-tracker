import React, { useState } from 'react';
import { JobItem, JobStatus } from '../types/ConsistItem';
import { stations } from '../types/Station';

const NewJob: React.FC = () => {
  const [form, setForm] = useState<JobItem>({
    id: '',
    weight: 0,
    length: 0,
    start_location: '',
    end_location: '',
    bonus_time_limit: 0,
    bonus_time_elapsed: 0,
    status: JobStatus.NotStarted,
  });

  const [startStation, setStartStation] = useState<string>('');
  const [startYard, setStartYard] = useState<string>('');
  const [startTrack, setStartTrack] = useState<string>('');
  const [endStation, setEndStation] = useState<string>('');
  const [endYard, setEndYard] = useState<string>('');
  const [endTrack, setEndTrack] = useState<string>('');

  const getYards = (stationCode: string) =>
    stations.find(s => s.code === stationCode)?.yards || [];
  const getTracks = (stationCode: string, yardId: string) =>
    getYards(stationCode).find(y => y.id === yardId)?.tracks || [];

  const handleStartPicker = (type: 'station' | 'yard' | 'track', value: string) => {
    if (type === 'station') {
      setStartStation(value);
      setStartYard('');
      setStartTrack('');
      setForm(f => ({ ...f, start_location: '' }));
    } else if (type === 'yard') {
      setStartYard(value);
      setStartTrack('');
      setForm(f => ({ ...f, start_location: '' }));
    } else if (type === 'track') {
      setStartTrack(value);
      const station = stations.find(s => s.code === startStation);
      const track = getTracks(startStation, startYard).find(t => t.display_name === value);
      if (station && track) {
        setForm(f => ({ ...f, start_location: `${station.code}-${track.display_name}` }));
      }
    }
  };

  const handleEndPicker = (type: 'station' | 'yard' | 'track', value: string) => {
    if (type === 'station') {
      setEndStation(value);
      setEndYard('');
      setEndTrack('');
      setForm(f => ({ ...f, end_location: '' }));
    } else if (type === 'yard') {
      setEndYard(value);
      setEndTrack('');
      setForm(f => ({ ...f, end_location: '' }));
    } else if (type === 'track') {
      setEndTrack(value);
      const station = stations.find(s => s.code === endStation);
      const track = getTracks(endStation, endYard).find(t => t.display_name === value);
      if (station && track) {
        setForm(f => ({ ...f, end_location: `${station.code}-${track.display_name}` }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]:
        name === 'weight' || name === 'length'
          ? Number(value)
          : name === 'bonus_time_limit'
          ? Math.round(Number(value) * 60)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = JSON.parse(localStorage.getItem('consistItems') || '[]');
    localStorage.setItem('consistItems', JSON.stringify([...existing, form]));
    window.location.hash = '/#';
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 8px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 16 }}>Add Job</h1>
      <a href="/#" style={{ color: '#337ab7', textDecoration: 'none', marginBottom: 24, display: 'inline-block' }}>Back to Consist</a>
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <label style={{ flex: 1, minWidth: 160 }}>
            ID:
            <input name="id" value={form.id} onChange={handleChange} style={{ width: '100%' }} />
          </label>
          <label style={{ flex: 1, minWidth: 120 }}>
            Weight:
            <input name="weight" type="number" value={form.weight} onChange={handleChange} style={{ width: '100%' }} />
          </label>
          <label style={{ flex: 1, minWidth: 120 }}>
            Length:
            <input name="length" type="number" value={form.length} onChange={handleChange} style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <label style={{ flex: 1, minWidth: 180 }}>
            Bonus Time Limit (minutes):
            <input
              name="bonus_time_limit"
              type="number"
              min={0}
              value={form.bonus_time_limit ? Math.round(form.bonus_time_limit / 60) : ''}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </label>
        </div>
        <div>
          <label>
            Start Location:
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              <select value={startStation} onChange={e => handleStartPicker('station', e.target.value)}>
                <option value="">Select Station</option>
                {stations.map(station => (
                  <option key={station.code} value={station.code}>{station.name}</option>
                ))}
              </select>
              {startStation && (
                <select value={startYard} onChange={e => handleStartPicker('yard', e.target.value)}>
                  <option value="">Select Yard</option>
                  {getYards(startStation).map(yard => (
                    <option key={yard.id} value={yard.id}>{yard.name}</option>
                  ))}
                </select>
              )}
              {startStation && startYard && (
                <select value={startTrack} onChange={e => handleStartPicker('track', e.target.value)}>
                  <option value="">Select Track</option>
                  {getTracks(startStation, startYard).map(track => (
                    <option key={track.display_name} value={track.display_name}>{track.display_name}</option>
                  ))}
                </select>
              )}
            </div>
          </label>
        </div>
        <div>
          <label>
            End Location:
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              <select value={endStation} onChange={e => handleEndPicker('station', e.target.value)}>
                <option value="">Select Station</option>
                {stations.map(station => (
                  <option key={station.code} value={station.code}>{station.name}</option>
                ))}
              </select>
              {endStation && (
                <select value={endYard} onChange={e => handleEndPicker('yard', e.target.value)}>
                  <option value="">Select Yard</option>
                  {getYards(endStation).map(yard => (
                    <option key={yard.id} value={yard.id}>{yard.name}</option>
                  ))}
                </select>
              )}
              {endStation && endYard && (
                <select value={endTrack} onChange={e => handleEndPicker('track', e.target.value)}>
                  <option value="">Select Track</option>
                  {getTracks(endStation, endYard).map(track => (
                    <option key={track.display_name} value={track.display_name}>{track.display_name}</option>
                  ))}
                </select>
              )}
            </div>
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <button type="submit" style={{ minWidth: 120 }}>
            Add Job
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewJob;
