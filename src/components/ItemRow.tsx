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
            background: '#fff',
            borderRadius: 8,
            marginBottom: 16,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            flexWrap: 'wrap',
            gap: 16,
        }}
    >
        <div style={{ flex: 1, minWidth: 200 }}>{left}</div>
        <div style={{ display: 'flex', gap: 8 }}>{right}</div>
    </div>
);

export default ItemRow;