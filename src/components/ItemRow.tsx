import React from 'react';

const ItemRow: React.FC<{
    left: React.ReactNode;
    right: React.ReactNode;
}> = ({ left, right }) => (
    <div
        style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: 8,
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 16,
        }}
        className='card'
    >
        <div style={{ flex: 1, minWidth: 200 }}>{left}</div>
        <div style={{ display: 'flex', gap: 8 }}>{right}</div>
    </div>
);

export default ItemRow;