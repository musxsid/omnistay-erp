import React from 'react';

const MetricCard = ({ title, value, description, trend }) => (
  <div className="azia-card">
    <div className="card-title">{title}</div>
    <h3 style={{ fontSize: '24px', margin: '10px 0' }}>{value}</h3>
    <p style={{ fontSize: '12px', color: '#64748b' }}>{description}</p>
    {trend && <div style={{ fontSize: '12px', marginTop: '10px' }}>{trend}</div>}
  </div>
);

export default MetricCard;