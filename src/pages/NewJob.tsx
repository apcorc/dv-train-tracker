import React, { useState } from 'react';
import { JobItem, JobStatus } from '../types/ConsistItem';
import { stations } from '../types/Station';

interface LocationOption {
  label: string;
  value: string;
  stationName?: string;
  stationCode?: string;
  trackNumber?: number;
  trackName?: string;
}

function getAllLocationOptions() {
  const options: LocationOption[] = [];
  stations.forEach(station => {
    station.yards.forEach(yard => {
      yard.tracks.forEach(track => {
        options.push({
          label: `${station.name} - ${yard.name} - ${track.display_name}`,
          value: `${station.code}-${yard.id}-${track.number}`,
          stationName: station.name,
          stationCode: station.code,
          trackNumber: track.number,
          trackName: track.display_name,
        });
      });
    });
  });
  return options;
}

const allLocationOptions = getAllLocationOptions();

const AutocompleteInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  const [focused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(-1);

  const optionsRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const tokens = inputValue.toLowerCase().split(' ');

  const filtered = allLocationOptions.filter(option => {
    return tokens.every(token => {
      return option.label.toLowerCase().includes(token)
        || (option.stationName && option.stationName.toLowerCase().includes(token))
        || (option.stationCode && option.stationCode.toLowerCase().includes(token))
        || (option.trackName && option.trackName.toLowerCase().includes(token));
    });
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowOptions(true);
    setHighlighted(-1);
    onChange('');
  };

  const handleSelect = (option: LocationOption) => {
    setInputValue(option.label);
    setShowOptions(false);
    setHighlighted(-1);
    onChange(option.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showOptions || filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlighted >= 0 && highlighted < filtered.length) {
        handleSelect(filtered[highlighted]);
      }
    }
  };

  // Scroll highlighted option into view
  React.useEffect(() => {
    if (highlighted >= 0 && optionsRefs.current[highlighted]) {
      optionsRefs.current[highlighted]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlighted]);

  React.useEffect(() => {
    // When value changes externally, update inputValue to show label
    const match = allLocationOptions.find(opt => opt.value === value);
    if (match) setInputValue(match.label);
  }, [value]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={inputValue}
        placeholder={label}
        onFocus={() => { setFocused(true); setShowOptions(true); }}
        onBlur={() => setTimeout(() => setShowOptions(false), 150)}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        style={{ width: '100%' }}
        autoComplete="off"
      />
      {showOptions && (
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 4,
            width: '100%',
            maxHeight: 180,
            overflowY: 'auto',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          {filtered.length === 0 && (
            <div style={{ padding: 8, color: '#888' }}>No matches</div>
          )}
          {filtered.map((opt, idx) => (
            <div
              key={opt.value}
              ref={el => optionsRefs.current[idx] = el}
              style={{
                padding: 8,
                cursor: 'pointer',
                background: highlighted === idx ? '#eaf1fb' : value === opt.value ? '#f0f8ff' : undefined,
              }}
              onMouseDown={() => handleSelect(opt)}
              onMouseEnter={() => setHighlighted(idx)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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

  const handleLocationChange = (field: 'start_location' | 'end_location', value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
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
            <AutocompleteInput
              value={form.start_location}
              onChange={v => handleLocationChange('start_location', v)}
              label="Start Location"
            />
          </label>
        </div>
        <div>
          <label>
            End Location:
            <AutocompleteInput
              value={form.end_location}
              onChange={v => handleLocationChange('end_location', v)}
              label="End Location"
            />
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <button type="submit" style={{ minWidth: 120 }} disabled={!form.start_location || !form.end_location}>
            Add Job
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewJob;
