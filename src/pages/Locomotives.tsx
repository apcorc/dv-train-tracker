import React from 'react';
import { Locomotive, locomotives } from '../types/Locomotive';
import { StaticConsistItem } from '../types/ConsistItem';


const addToConsist = (id: string) => {
  const newItem: StaticConsistItem = { id, isStatic: true, is_on: true };
  const existing = JSON.parse(localStorage.getItem('consistItems') || '[]');
  localStorage.setItem('consistItems', JSON.stringify([...existing, newItem]));
  window.location.hash = '/#';
};

const LocomotiveComponent: React.FC<{ item: Locomotive }> = ({ item }) => (
  <div>
    <strong>
      {item.display_name}
      {item.nickname && ` (${item.nickname})`}
    </strong> (Weight: {item.weight}, Length: {item.length})
    <button style={{ marginLeft: 8 }} onClick={() => addToConsist(item.id)}>
      Add to Consist
    </button>
  </div>
);

const Locomotives: React.FC = () => {
  return (
    <div>
      <h1>All Locomotives</h1>
      <a href="/#">Back</a>
      <ul>
        {locomotives.map((item, idx) => (
          <li key={idx}>
            <LocomotiveComponent item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Locomotives;
