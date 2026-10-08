import React from 'react';

const MetricCard = ({ title, value, icon, color = 'blue' }) => {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${color}`}>
        {icon}
      </div>
      <div className="metric-info">
        <h4>{title}</h4>
        <div className="metric-value">{value}</div>
      </div>
    </div>
  );
};

export default MetricCard;
