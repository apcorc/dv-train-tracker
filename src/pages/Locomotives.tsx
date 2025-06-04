import React from 'react';
import { Locomotive, locomotives } from '../types/Locomotive';
import { StaticConsistItem } from '../types/ConsistItem';


const addToConsist = (item: Locomotive) => {
  const newItem: StaticConsistItem = { id: item.id, isStatic: true, is_on: true, can_run: item.load_rating !== null };
  const existing = JSON.parse(localStorage.getItem('consistItems') || '[]');
  localStorage.setItem('consistItems', JSON.stringify([...existing, newItem]));
  window.location.hash = '/#';
};

const LocomotiveComponent: React.FC<{ item: Locomotive }> = ({ item }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: 8, padding: '16px 20px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
    <div>
      <strong>
        {item.display_name}
        {item.nickname && ` (${item.nickname})`}
      </strong>
      <span style={{ color: '#888' }}>
        {' '} (Weight: {item.weight}, Length: {item.length})
      </span>
    </div>
    <button style={{ minWidth: 120 }} onClick={() => addToConsist(item)}>
      Add to Consist
    </button>
  </div>
);

const Locomotives: React.FC = () => {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 8px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 16 }}>Add Locomotive</h1>
      <a href="/#" style={{ color: '#337ab7', textDecoration: 'none', marginBottom: 24, display: 'inline-block' }}>Back to Consist</a>
      <div>
        {locomotives.map((item, idx) => (
          <LocomotiveComponent key={idx} item={item} />
        ))}
      </div>
    </div>
  );
};

export default Locomotives;
