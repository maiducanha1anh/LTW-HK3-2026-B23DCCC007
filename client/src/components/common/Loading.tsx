import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Đang tải...</span>
      </div>
    </div>
  );
};

export default Loading;
