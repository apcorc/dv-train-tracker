import React from 'react';

const ItemRow: React.FC<{
    left: React.ReactNode;
    right: React.ReactNode;
}> = ({ left, right }) => (
    <div
        style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'stretch',
            borderRadius: 8,
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 0,
            userSelect: 'none',
            overflow: 'hidden', // Ensures button is clipped by border radius
            minHeight: 56,
        }}
        className='card'
    >
        <div style={{ flex: 1, minWidth: 200 }}>{left}</div>
        <div>{right}</div>
    </div>
);

export default ItemRow;