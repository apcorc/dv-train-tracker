import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Station } from '../types/Station';
import { JobLocation } from '../types/ConsistItem';

export interface LocationOption {
  label: string;
  value: JobLocation;
  stationName: string;
  stationCode: string;
  trackName: string;
  key: string;
}

function getAllLocationOptions(stations: Station[]): LocationOption[] {
  const options: LocationOption[] = [];
  stations.forEach(station => {
    station.yards.forEach(yard => {
      yard.tracks.forEach(track => {
        options.push({
          label: `${station.name} - ${yard.name} - ${track.display_name}`,
          value: {
            station_code: station.code,
            yard_id: yard.id,
            track_number: track.number,
          },
          stationName: station.name,
          stationCode: station.code,
          trackName: track.display_name,
          key: `${station.code}-${yard.id}-${track.number}-${track.display_name}`,
        });
      });
    });
  });
  return options;
}

export const AutocompleteInput: React.FC<{
  value: JobLocation | undefined;
  stations: Station[];
  onChange: (value: JobLocation | undefined) => void;
  label: string;
}> = ({ value, stations, onChange, label }) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allLocationOptions = getAllLocationOptions(stations);

  const matches = useMemo(() => {
    const search = inputValue.trim().toLowerCase();
    if (!search) return [];

    const terms = search.split(/\s+/);
    return allLocationOptions.filter(option =>
      terms.every(
        term =>
          option.label.toLowerCase().includes(term) ||
          option.stationName.toLowerCase().includes(term) ||
          option.stationCode.toLowerCase().includes(term) ||
          option.trackName.toLowerCase().includes(term)
      )
    );
  }, [allLocationOptions, inputValue]);

  useEffect(() => {
    const option = allLocationOptions.find(
      opt =>
        opt.value.station_code === value?.station_code &&
        opt.value.yard_id === value?.yard_id &&
        opt.value.track_number === value?.track_number
    );
    if (option) {
      setInputValue(option.label);
    }
  }, [allLocationOptions, value]);

  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const element = dropdownRef.current.children[selectedIndex] as HTMLElement;
      if (element) {
        element.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    setSelectedIndex(-1);
    onChange(undefined);
  };

  const selectOption = (option: LocationOption) => {
    setInputValue(option.label);
    setIsOpen(false);
    setSelectedIndex(-1);
    onChange(option.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || matches.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, matches.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectOption(matches[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={inputValue}
        placeholder={label}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className="field"
        autoComplete="off"
      />
      {isOpen && inputValue.trim() && (
        <div
          ref={dropdownRef}
          className="panel absolute z-20 mt-1 max-h-48 w-full overflow-y-auto py-1 shadow-lift"
        >
          {matches.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">No matches</div>
          ) : (
            matches.map((option, index) => (
              <div
                key={option.key}
                className={`cursor-pointer px-3 py-2 text-sm transition ${
                  selectedIndex === index
                    ? 'bg-rail-mist text-rail-ink dark:bg-slate-800 dark:text-white'
                    : 'hover:bg-rail-mist/70 dark:hover:bg-slate-800/80'
                }`}
                onMouseDown={() => selectOption(option)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
