import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeClass = (st) => {
    switch (st) {
      case 'OPEN':
        return 'badge-open';
      case 'IN_PROGRESS':
        return 'badge-in_progress';
      case 'RESOLVED':
        return 'badge-resolved';
      case 'CLOSED':
        return 'badge-closed';
      default:
        return 'badge-role';
    }
  };

  const getLabel = (st) => {
    if (st === 'IN_PROGRESS') return 'In Progress';
    if (st === 'OPEN') return 'Open';
    if (st === 'RESOLVED') return 'Resolved';
    if (st === 'CLOSED') return 'Closed';
    return st || 'Unknown';
  };

  return (
    <span className={`badge ${getBadgeClass(status)}`}>
      {getLabel(status)}
    </span>
  );
};

export default StatusBadge;
