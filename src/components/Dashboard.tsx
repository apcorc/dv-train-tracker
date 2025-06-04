import React from 'react';
import { LocomotiveLoadRating } from '../types/Locomotive';

// Components for each concretion
const Dashboard: React.FC<{ length: number; weight: number; load: LocomotiveLoadRating; }> = ({
    length, weight, load,
}) => (
    <div
        style={{
            display: 'flex',
            gap: 24,
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            background: '#f5f7fa',
            borderRadius: 12,
            padding: '24px 16px',
            marginBottom: 32,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
    >
        <div style={{ minWidth: 120, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#888' }}>Total Weight</div>
            <div style={{ fontSize: 28, fontWeight: 600 }}>{weight} t</div>
        </div>
        <div style={{ minWidth: 120, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#888' }}>Total Length</div>
            <div style={{ fontSize: 28, fontWeight: 600 }}>{length} m</div>
        </div>
        <div style={{ minWidth: 180, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#888' }}>Load Rating (2% Dry)</div>
            <div style={{ fontSize: 28, fontWeight: 600 }}>{load.grade_2_dry} t</div>
        </div>
    </div>
);

export default Dashboard;