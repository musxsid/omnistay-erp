import React from 'react';

const StatusPill = ({ status }) => {
  const className = `status-badge ${status?.toLowerCase() || 'default'}`;
  return <span className={className}>{status}</span>;
};

export default StatusPill;