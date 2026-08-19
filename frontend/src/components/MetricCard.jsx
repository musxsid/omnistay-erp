import React from 'react';

const MetricCard = ({ code = '01', title, value, trend, trendType = 'up' }) => (
  <div className="stat-card-widget">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
      <div className="stat-icon-wrapper">
        {code}
      </div>
      {trend && (
        <div className={`stat-trend ${trendType}`}>
          {trendType === 'up' ? '↑ ' : '↓ '}{trend}
        </div>
      )}
    </div>
    
    <div className="stat-label">{title}</div>
    <div className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</div>
  </div>
);

export default MetricCard;