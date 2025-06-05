import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Station } from '../types/Station';

export interface LocationOption {
  label: string;
  value: string;
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
          value: `${station.code}-${yard.id}-${track.number}`,
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
    value: string;
    stations: Station[],
    onChange: (value: string) => void;
    label: string;
}> = ({ value, stations, onChange, label }) => {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const allLocationOptions = getAllLocationOptions(stations);

    // Get matching options
    const matches = useMemo(() => {
        const search = inputValue.trim().toLowerCase();
        if (!search) return [];

        const terms = search.split(/\s+/);
        return allLocationOptions.filter(option => terms.every(term => option.label.toLowerCase().includes(term) ||
            option.stationName.toLowerCase().includes(term) ||
            option.stationCode.toLowerCase().includes(term) ||
            option.trackName.toLowerCase().includes(term)
        )
        );
    }, [allLocationOptions, inputValue]);

    console.log('Matches:', matches);

    // Update input when value changes externally
    useEffect(() => {
        const option = allLocationOptions.find(opt => opt.value === value);
        if (option) {
            setInputValue(option.label);
        }
    }, [allLocationOptions, value]);

    // Scroll selected item into view
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
        onChange('');
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
        <div style={{ position: 'relative', width: '100%' }}>
            <input
                type="text"
                value={inputValue}
                placeholder={label}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 150)}
                style={{ width: '100%' }}
                autoComplete="off" />
            {isOpen && inputValue.trim() && (
                <div
                    ref={dropdownRef}
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
                    {matches.length === 0 ? (
                        <div style={{ padding: 8, color: '#888' }}>
                            No matches
                        </div>
                    ) : (
                        matches.map((option, index) => (
                            <div
                                key={option.key}
                                style={{
                                    padding: 8,
                                    cursor: 'pointer',
                                    background: selectedIndex === index ? '#eaf1fb' : undefined,
                                }}
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