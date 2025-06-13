import React from 'react';
import { LocomotiveLoadRating } from '../types/Locomotive';

const getLoadColor = (weight: number, load: number) => {
    if (load === 0) return '#888';
    const ratio = weight / load;
    if (ratio < 0.75) return '#27ae60'; // green
    if (ratio < 0.85) return '#f1c40f'; // yellow
    if (ratio < 1) return '#e67e22';    // orange
    return '#c0392b';                   // red
};

const Dashboard: React.FC<{ length: number; weight: number; load: LocomotiveLoadRating; }> = ({
    length, weight, load,
}) => {
    const color = getLoadColor(weight, load.grade_2_dry);

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'stretch',
                    marginBottom: 32,
                    maxWidth: '600px',
                    width: '100%',
                    gap: 12,
                }}
            >
                <div 
                    style={{ 
                        flex: 1,
                        minWidth: 0,
                        padding: '16px 8px',
                        textAlign: 'center',
                        boxShadow: '0 2px 12px rgba(5, 5, 5, 0.06)',
                        borderRadius: 12,
                        aspectRatio: '1',
                        gap: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    className='card'
                >
                    <div style={{ fontSize: 14, color: '#888' }}>Total Weight</div>
                    <div style={{ fontSize: 28, fontWeight: 600 }}>{weight}t</div>
                </div>
                <div 
                    style={{ 
                        flex: 1,
                        minWidth: 0,
                        padding: '16px 8px',
                        textAlign: 'center',
                        borderRadius: 12,
                        aspectRatio: '1',
                        gap: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    className='card'
                >
                    <div style={{ fontSize: 14, color: '#888' }}>Total Length</div>
                    <div style={{ fontSize: 28, fontWeight: 600 }}>{length}m</div>
                </div>
                <div 
                    style={{ 
                        flex: 1,
                        minWidth: 0,
                        padding: '16px 8px',
                        textAlign: 'center',
                        borderRadius: 12,
                        aspectRatio: '1',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 8,
                    }}
                    className='card'
                >
                    <div style={{ fontSize: 14, color: '#888' }}>Load Rating</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color }}>
                        {load.grade_2_dry}t
                        <div style={{ fontSize: 13, color: '#888' }}>
                            <span>☀ 2%</span>
                        </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4, display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'center', width: '50%' }}>
                            {load.grade_0_dry}t<br />☀ 0%
                        </div>
                        <div style={{ textAlign: 'center', width: '50%' }}>
                            {load.grade_2_wet}t<br />⛆ 2%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;