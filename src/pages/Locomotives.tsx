import React from 'react';
import { Locomotive, locomotives } from '../types/Locomotive';
import { StaticConsistItem } from '../types/ConsistItem';
import { Link } from 'react-router-dom';

const addToConsist = (item: Locomotive) => {
  const newItem: StaticConsistItem = { id: item.id, isStatic: true, is_on: true, can_run: item.load_rating !== null };
  const existing = JSON.parse(localStorage.getItem('consistItems') || '[]');
  localStorage.setItem('consistItems', JSON.stringify([...existing, newItem]));
  window.location.href = `${process.env.PUBLIC_URL}/`;
};

const LocomotiveComponent: React.FC<{ item: Locomotive; onClick: () => void }> = ({ item, onClick }) => (
  <div
    className="locomotive-card card"
    onClick={onClick}
    tabIndex={0}
    role="button"
    aria-label={`Add ${item.display_name} to consist`}
  >
    <div style={{ fontWeight: 600, fontSize: 18, textAlign: 'center' }}>
      {item.display_name}
      {item.nickname && <span style={{ fontWeight: 400 }}> ({item.nickname})</span>}
    </div>
    <div style={{ color: '#888', fontSize: 13, margin: '4px 0 8px 0' }}>
      Weight: {item.weight}, Length: {item.length}
    </div>
    <div style={{ fontSize: 13, color: '#555', marginTop: 4, textAlign: 'center' }}>
      <b>Load Ratings:</b>
      <br />
      {item.load_rating
        ? <>
            <span>Flat Dry: {item.load_rating.grade_0_dry}t</span>
            {' | '}
            <span>2% Dry: {item.load_rating.grade_2_dry}t</span>
            {' | '}
            <span>2% Wet: {item.load_rating.grade_2_wet}t</span>
          </>
        : <span style={{ color: '#c0392b' }}>N/A</span>
      }
    </div>
  </div>
);

const Locomotives: React.FC = () => {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 8px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 16 }}>Add Locomotive</h1>
      <Link to="/" style={{ color: '#337ab7', textDecoration: 'none', marginBottom: 24, display: 'inline-block' }}>Back to Consist</Link>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
          justifyItems: 'stretch',
          alignItems: 'stretch',
        }}
      >
        {locomotives.map((item, idx) => (
          <LocomotiveComponent key={item.id || idx} item={item} onClick={() => addToConsist(item)} />
        ))}
      </div>
    </div>
  );
};

export default Locomotives;
