import React from 'react';
import '../../styles/skeleton.css';

interface SkeletonLineProps {
  width?: string;
  height?: string;
  className?: string;
}

export const SkeletonLine: React.FC<SkeletonLineProps> = ({
  width = '100%',
  height = '1rem',
  className = ''
}) => {
  return (
    <span
      className={`skeleton-box ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
  return (
    <div
      className={`card shadow-sm border-0 p-4 h-100 ${className}`}
      aria-busy="true"
      aria-hidden="true"
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <SkeletonLine width="60%" height="1.2rem" />
        <SkeletonLine width="30px" height="30px" className="rounded-circle" />
      </div>
      <SkeletonLine width="80%" height="2rem" className="mb-2" />
      <SkeletonLine width="40%" height="0.9rem" />
    </div>
  );
};

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  cols = 4,
  className = ''
}) => {
  return (
    <div className={`card shadow-sm border-0 ${className}`} aria-busy="true" aria-hidden="true">
      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead className="table-light">
            <tr>
              {Array.from({ length: cols }).map((_, c) => (
                <th key={c}>
                  <SkeletonLine width="70%" height="1rem" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c}>
                    <SkeletonLine
                      width={c === 0 ? '50%' : c === cols - 1 ? '30%' : '80%'}
                      height="1rem"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface SkeletonListProps {
  count?: number;
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 4,
  className = ''
}) => {
  return (
    <div className={`d-flex flex-column gap-3 ${className}`} aria-busy="true" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3 border rounded bg-white shadow-sm d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3 w-75">
            <SkeletonLine width="40px" height="40px" className="rounded-circle flex-shrink-0" />
            <div className="w-100">
              <SkeletonLine width="60%" height="1rem" className="mb-1" />
              <SkeletonLine width="40%" height="0.8rem" />
            </div>
          </div>
          <SkeletonLine width="20%" height="1.2rem" />
        </div>
      ))}
    </div>
  );
};

interface SkeletonChartProps {
  height?: string;
  className?: string;
}

export const SkeletonChart: React.FC<SkeletonChartProps> = ({
  height = '300px',
  className = ''
}) => {
  return (
    <div
      className={`card shadow-sm border-0 p-4 d-flex align-items-center justify-content-center ${className}`}
      style={{ width: '100%', height }}
      aria-busy="true"
      aria-hidden="true"
    >
      <div className="text-center w-100 h-100 d-flex flex-column justify-content-between">
        <SkeletonLine width="40%" height="1.2rem" className="align-self-start mb-3" />
        <div className="d-flex align-items-end justify-content-around h-75 gap-2 px-3">
          <SkeletonLine width="12%" height="40%" />
          <SkeletonLine width="12%" height="70%" />
          <SkeletonLine width="12%" height="55%" />
          <SkeletonLine width="12%" height="90%" />
          <SkeletonLine width="12%" height="35%" />
          <SkeletonLine width="12%" height="75%" />
        </div>
        <SkeletonLine width="60%" height="0.8rem" className="align-self-center mt-3" />
      </div>
    </div>
  );
};
