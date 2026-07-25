import React, { useState } from 'react';
import { JobItem, JobLocation, JobStatus, JobType } from '../types/ConsistItem';
import { stations } from '../types/Station';
import { AutocompleteInput } from '../components//AutocompleteInput';
import { Link } from 'react-router-dom';

function updateJobId(currentId: string, newLocCode: string, newTypeCode: string): string {
  // Match format: CODE-TYPECODE-NUMBER (e.g., SM-B-1, ABC-FH-12)
  const match = currentId.match(/^([A-Za-z0-9]+)-([A-Za-z]+)-(\d+)$/);
  if (match) {
    const [, , , number] = match;
    const locCode = newLocCode ? newLocCode : 'XX';
    return `${locCode}-${newTypeCode}-${number}`;
  }
  return currentId;
}

const NewJob: React.FC = () => {
  const [form, setForm] = useState<JobItem>({
    id: 'XX-FH-00',
    weight: 0,
    length: 0,
    start_location: undefined,
    end_location: undefined,
    bonus_time_limit: 0,
    bonus_time_elapsed: 0,
    status: JobStatus.NotStarted,
    type: JobType.Freight,
  });

  function jobTypeCode(type: JobType): string {
    switch (type) {
      case JobType.Freight: return 'FH';
      case JobType.Shunting: return 'SH';
      case JobType.Logistics: return 'LH';
      default: return '';
    }
  }

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

  const handleLocationChange = (field: 'start_location' | 'end_location', value: JobLocation | undefined) => {
    setForm(prev => {
      if (field === 'start_location') {
        // Try to get station code from value (assuming value is code or can map to code)
        let newId = prev.id;

        if (value) {
          newId = updateJobId(prev.id, value.station_code, jobTypeCode(prev.type));
        }

        return {
          ...prev,
          start_location: value,
          id: newId,
        };
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setForm(prev => {
      const typeCode = jobTypeCode(value as JobType);
      // Try to get station code from start_location
      const code = prev.start_location?.station_code ?? '';
      const newId = updateJobId(prev.id, code, typeCode);
      return {
        ...prev,
        type: value as JobType,
        id: newId,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = JSON.parse(localStorage.getItem('consistItems') || '[]');
    
    // Generate default ID if empty
    const formToSubmit = { ...form };
    if (!formToSubmit.id.trim()) {
      const existingJobs = existing.filter((item: any) => 'start_location' in item);
      formToSubmit.id = `Job ${existingJobs.length + 1}`;
    }

    localStorage.setItem('consistItems', JSON.stringify([...existing, formToSubmit]));
    window.location.href = `${process.env.PUBLIC_URL}/`;
  };

  function jobTypeString(type: JobType): string {
    switch (type) {
        case JobType.Freight:
            return 'Freight';
        case JobType.Shunting:
            return 'Shunting';
        case JobType.Logistics:
            return 'Logistics';
        default:
            return 'Unknown';
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 8px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 16 }}>Add Job</h1>
      <Link to="/" style={{ color: '#337ab7', textDecoration: 'none', marginBottom: 24, display: 'inline-block' }}>Back to Consist</Link>
      <form
        onSubmit={handleSubmit}
        style={{
          borderRadius: 12,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
        className='card'
      >
        <div>
          <label style={{ flex: 1, minWidth: 160 }}>
            Job Type:
            <select name="type" value={form.type} onChange={handleTypeChange} style={{ width: '100%' }} className='input'>
                {Object.values(JobType).map((type) => (
                    <option value={type}>{jobTypeString(type)}</option>
                ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Start Location:
            <AutocompleteInput
              value={form.start_location}
              stations={stations}
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
              stations={stations}
              onChange={v => handleLocationChange('end_location', v)}
              label="End Location"
            />
          </label>
        </div>
        <div>
          <label style={{ flex: 1, minWidth: 160 }}>
            ID:
            <input name="id" value={form.id} onChange={handleChange} style={{ width: '100%' }} className='input' />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <label style={{ flex: 1, minWidth: 120 }}>
            Weight:
            <input name="weight" type="number" value={form.weight} onChange={handleChange} style={{ width: '100%' }} className='input' />
          </label>
          <label style={{ flex: 1, minWidth: 120 }}>
            Length:
            <input name="length" type="number" value={form.length} onChange={handleChange} style={{ width: '100%' }} className='input' />
          </label>
          <label style={{ flex: 1, minWidth: 160 }}>
            Time Bonus:
            <input
              name="bonus_time_limit"
              type="number"
              min={0}
              value={form.bonus_time_limit ? Math.round(form.bonus_time_limit / 60) : ''}
              onChange={handleChange}
              style={{ width: '100%' }} 
              className='input'
            />
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <button type="submit" style={{ minWidth: 120 }} className='input'>
            Add Job
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewJob;
