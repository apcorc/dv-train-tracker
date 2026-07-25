import React, { useState } from 'react';
import { JobItem, JobLocation, JobStatus, JobType } from '../types/ConsistItem';
import { stations } from '../types/Station';
import { AutocompleteInput } from '../components/AutocompleteInput';
import Layout from '../components/Layout';

function updateJobId(currentId: string, newLocCode: string, newTypeCode: string): string {
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
      case JobType.Freight:
        return 'FH';
      case JobType.Shunting:
        return 'SH';
      case JobType.Logistics:
        return 'LH';
      default:
        return '';
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

  const handleLocationChange = (
    field: 'start_location' | 'end_location',
    value: JobLocation | undefined
  ) => {
    setForm(prev => {
      if (field === 'start_location') {
        let newId = prev.id;

        if (value) {
          newId = updateJobId(prev.id, value.station_code, jobTypeCode(prev.type));
        }

        return {
          ...prev,
          start_location: value,
          id: newId,
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setForm(prev => {
      const typeCode = jobTypeCode(value as JobType);
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
    <Layout title="Add Job" subtitle="Set pickup, delivery, and bonus time">
      <form onSubmit={handleSubmit} className="panel mx-auto max-w-xl animate-fade-up space-y-5 p-5 sm:p-6">
        <div>
          <label className="label" htmlFor="type">
            Job Type
          </label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleTypeChange}
            className="field"
          >
            {Object.values(JobType).map(type => (
              <option key={type} value={type}>
                {jobTypeString(type)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Start Location</label>
          <AutocompleteInput
            value={form.start_location}
            stations={stations}
            onChange={v => handleLocationChange('start_location', v)}
            label="Search station, yard, or track"
          />
        </div>

        <div>
          <label className="label">End Location</label>
          <AutocompleteInput
            value={form.end_location}
            stations={stations}
            onChange={v => handleLocationChange('end_location', v)}
            label="Search station, yard, or track"
          />
        </div>

        <div>
          <label className="label" htmlFor="id">
            Job ID
          </label>
          <input
            id="id"
            name="id"
            value={form.id}
            onChange={handleChange}
            className="field font-mono"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="weight">
              Weight (t)
            </label>
            <input
              id="weight"
              name="weight"
              type="number"
              value={form.weight}
              onChange={handleChange}
              className="field"
            />
          </div>
          <div>
            <label className="label" htmlFor="length">
              Length (m)
            </label>
            <input
              id="length"
              name="length"
              type="number"
              value={form.length}
              onChange={handleChange}
              className="field"
            />
          </div>
          <div>
            <label className="label" htmlFor="bonus_time_limit">
              Time Bonus (min)
            </label>
            <input
              id="bonus_time_limit"
              name="bonus_time_limit"
              type="number"
              min={0}
              value={form.bonus_time_limit ? Math.round(form.bonus_time_limit / 60) : ''}
              onChange={handleChange}
              className="field"
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-rail-line/70 pt-4 dark:border-slate-700">
          <button type="submit" className="btn-primary min-w-[8rem]">
            Add Job
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default NewJob;
