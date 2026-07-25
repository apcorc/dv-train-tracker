import React from 'react';
import { StaticConsistItem } from '../types/ConsistItem';
import { locomotives } from '../types/Locomotive';

const ConsistLocomotive: React.FC<{
  item: StaticConsistItem;
  onStart: () => void;
  onStop: () => void;
}> = ({ item, onStart, onStop }) => {
  const loco = locomotives.find(l => l.id === item.id);

  if (!loco) {
    return <div><strong>Locomotive:</strong> {item.id} (Not found)</div>;
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      flexWrap: 'wrap', 
      gap: 8, 
      height: '100%'
    }}>
      <div style={{padding: '16px 0px 16px 20px'}}>
        {loco.display_name}
        {loco.nickname && ` (${loco.nickname})`}
        {item.can_run && (
          <span style={{ fontSize: 13 }}>
            <span style={{ marginLeft: 8, marginRight: 8 }}>-</span>
            <span style={{color: item.is_on ? '#27ae60' : '#c0392b'}}>
              {item.is_on ? 'Running' : 'Stopped'}
            </span>
          </span>
        )}
      </div>
      {
        item.can_run ? (
          <div
            style={{
              width: 50,
              minWidth: 50,
              maxWidth: 50,
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 8,
            }}
          >
            <button
              onClick={item.is_on ? onStop : onStart}
              className="power-btn"
              aria-label={item.is_on ? "Stop Locomotive" : "Start Locomotive"}
              type="button"
              tabIndex={0}
            >
              <span
                style={{
                  color: '#fff',
                  fontSize: 28,
                  lineHeight: 1,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                ⏻
              </span>
            </button>
          </div>
        ) : (
          <div
            style={{
              width: 50,
              minWidth: 50,
              maxWidth: 50,
              height: '100%',
              background: '#bbb',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 8,
              borderRadius: 0,
              opacity: 0.7,
              cursor: 'default',
            }}
            aria-label="Locomotive cannot run"
            tabIndex={-1}
          >
            <span
              style={{
                color: '#eee',
                fontSize: 28,
                lineHeight: 1,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              ⏻
            </span>
          </div>
        )
      }
    </div>
  );
};

export default ConsistLocomotive;