import React from 'react';
import { LocomotiveLoadRating } from '../types/Locomotive';

const getLoadColor = (weight: number, load: number) => {
    if (load === 0) return '#888';
    const ratio = weight / load;
    if (ratio < 0.75) return '#27ae60'; // green
    if (ratio < 0.85) return '#f1c40f'; // yellow
    if (ratio < 1) return '#e67e22';   // orange
    return '#c0392b';                  // red
};

const Dashboard: React.FC<{ length: number; weight: number; load: LocomotiveLoadRating; }> = ({
    length, weight, load,
}) => {
    const color = getLoadColor(weight, load.grade_2_dry);

    return (
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
                <div style={{ fontSize: 28, fontWeight: 600 }}>{weight}t</div>
            </div>
            <div style={{ minWidth: 120, textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#888' }}>Total Length</div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>{length}m</div>
            </div>
            <div style={{ minWidth: 180, textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#888' }}>Load Rating</div>
                <div style={{ fontSize: 32, fontWeight: 700, color }}>
                    {load.grade_2_dry}t
                </div>
                <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
                    <span>☀ 0%: {load.grade_0_dry}t</span>
                    {' | '}
                    <span>⛆ 2%: {load.grade_2_wet}t</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;