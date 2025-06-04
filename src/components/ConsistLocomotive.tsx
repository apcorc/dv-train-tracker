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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
                <strong>Locomotive:</strong> {loco.display_name}
                {loco.nickname && ` (${loco.nickname})`}
                {' '}<span style={{ color: '#888' }}>(Weight: {loco.weight}, Length: {loco.length})</span>
                {item.can_run && (
                    <>
                        <br />
                        <span style={{ fontSize: 13, color: item.is_on ? '#27ae60' : '#c0392b' }}>
                            {item.is_on ? 'Running' : 'Stopped'}
                        </span>
                    </>
                )}
            </div>
            {item.can_run && (
                <div style={{ display: 'flex', gap: 8 }}>
                    {item.is_on ? (
                        <button onClick={onStop}>Stop</button>
                    ) : (
                        <button onClick={onStart}>Start</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ConsistLocomotive;