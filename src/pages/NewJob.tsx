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

  // Picker state for start and end locations
  const [startStation, setStartStation] = useState<string>('');
  const [startYard, setStartYard] = useState<string>('');
  const [startTrack, setStartTrack] = useState<string>('');
  const [endStation, setEndStation] = useState<string>('');
  const [endYard, setEndYard] = useState<string>('');
  const [endTrack, setEndTrack] = useState<string>('');

  // Helper to get yards and tracks
  const getYards = (stationCode: string) =>
    stations.find(s => s.code === stationCode)?.yards || [];
  const getTracks = (stationCode: string, yardId: string) =>
    getYards(stationCode).find(y => y.id === yardId)?.tracks || [];

  // When a picker changes, update the corresponding state and the form's location
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
      const yard = getYards(startStation).find(y => y.id === startYard);
      const track = getTracks(startStation, startYard).find(t => t.number.toString() === value);
      if (station && yard && track) {
        setForm(f => ({ ...f, start_location: `${station.code}-${yard.id}-${track.number}` }));
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
      const yard = getYards(endStation).find(y => y.id === endYard);
      const track = getTracks(endStation, endYard).find(t => t.number.toString() === value);
      if (station && yard && track) {
        setForm(f => ({ ...f, end_location: `${station.code}-${yard.id}-${track.number}` }));
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
          ? Math.round(Number(value) * 60) // convert minutes to seconds
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
    <div>
      <h1>Add New Job</h1>
      <a href="/#">Back</a>
      <br /><br />
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            ID:
            <input name="id" value={form.id} onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label>
            Weight:
            <input name="weight" type="number" value={form.weight} onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label>
            Length:
            <input name="length" type="number" value={form.length} onChange={handleChange} required />
          </label>
        </div>
        {/* Start Location Picker */}
        <div>
          <label>
            Start Location:
            <div>
              <select value={startStation} onChange={e => handleStartPicker('station', e.target.value)} required>
                <option value="">Select Station</option>
                {stations.map(station => (
                  <option key={station.code} value={station.code}>{station.name}</option>
                ))}
              </select>
              {startStation && (
                <select value={startYard} onChange={e => handleStartPicker('yard', e.target.value)} required>
                  <option value="">Select Yard</option>
                  {getYards(startStation).map(yard => (
                    <option key={yard.id} value={yard.id}>{yard.name}</option>
                  ))}
                </select>
              )}
              {startStation && startYard && (
                <select value={startTrack} onChange={e => handleStartPicker('track', e.target.value)} required>
                  <option value="">Select Track</option>
                  {getTracks(startStation, startYard).map(track => (
                    <option key={track.number} value={track.number}>{track.display_name}</option>
                  ))}
                </select>
              )}
            </div>
          </label>
        </div>
        {/* End Location Picker */}
        <div>
          <label>
            End Location:
            <div>
              <select value={endStation} onChange={e => handleEndPicker('station', e.target.value)} required>
                <option value="">Select Station</option>
                {stations.map(station => (
                  <option key={station.code} value={station.code}>{station.name}</option>
                ))}
              </select>
              {endStation && (
                <select value={endYard} onChange={e => handleEndPicker('yard', e.target.value)} required>
                  <option value="">Select Yard</option>
                  {getYards(endStation).map(yard => (
                    <option key={yard.id} value={yard.id}>{yard.name}</option>
                  ))}
                </select>
              )}
              {endStation && endYard && (
                <select value={endTrack} onChange={e => handleEndPicker('track', e.target.value)} required>
                  <option value="">Select Track</option>
                  {getTracks(endStation, endYard).map(track => (
                    <option key={track.number} value={track.number}>{track.display_name}</option>
                  ))}
                </select>
              )}
            </div>
          </label>
        </div>
        <div>
          <label>
            Bonus Time Limit (minutes):
            <input
              name="bonus_time_limit"
              type="number"
              min={0}
              value={form.bonus_time_limit ? Math.round(form.bonus_time_limit / 60) : ''}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <button type="submit" disabled={!form.start_location || !form.end_location}>Add Job</button>
      </form>
    </div>
  );
};

export default NewJob;
