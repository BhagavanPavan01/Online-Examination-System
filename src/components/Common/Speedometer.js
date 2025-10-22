import React from 'react';

const Speedometer = ({ score }) => {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const rotation = (normalizedScore / 100) * 180 - 90; // -90° to 90°
  
  const getNeedleColor = () => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    if (score >= 40) return '#fd7e14';
    return '#dc3545';
  };

  return (
    <div className="text-center">
      <div className="speedometer-container">
        {/* Speedometer base */}
        <div className="speedometer-base" />
        
        {/* Needle */}
        <div
          className="speedometer-needle"
          style={{
            backgroundColor: getNeedleColor(),
            transform: `rotate(${rotation}deg)`
          }}
        />
        
        {/* Center circle */}
        <div className="speedometer-center" />
      </div>
      
      <div className="mt-3">
        <h3 style={{ color: getNeedleColor() }}>{score}%</h3>
        <p className="text-muted">
          {score >= 80 ? 'Excellent!' : 
           score >= 60 ? 'Good!' : 
           score >= 40 ? 'Average' : 'Needs Improvement'}
        </p>
      </div>
      
      <div className="d-flex justify-between mt-2">
        <small className="text-danger">0%</small>
        <small className="text-warning">50%</small>
        <small className="text-success">100%</small>
      </div>
    </div>
  );
};

export default Speedometer;