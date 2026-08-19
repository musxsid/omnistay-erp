import React from 'react';

const MetricCard = ({ code = '01', title, value, trend, trendType = 'up' }) => (
  <div className="stat-card-widget">
    <div className="stat-icon-wrapper">
      {code}
    </div>
    <div className="stat-label">{title}</div>
    <div className="stat-value">{value}</div>
    {trend && (
      <div className={`stat-trend ${trendType}`}>
        {trend}
      </div>
    )}
  </div>
);

export default MetricCard;