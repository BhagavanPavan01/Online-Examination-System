import React from 'react';
import './PieChart.css';

const PieChart = ({ results = [] }) => {
  // Calculate metrics from actual results data structure
  const totalAttempts = results.length;
  
  // Calculate passed attempts based on score (>= 50 is pass)
  const passedAttempts = results.filter(result => {
    // Handle both object structures: result.score or result.percentage
    const score = result.score || result.percentage || 0;
    return score >= 50;
  }).length;
  
  const failedAttempts = totalAttempts - passedAttempts;
  
  const passPercentage = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
  
  // Pie chart calculations
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const passStrokeLength = (passPercentage / 100) * circumference;
  const failStrokeLength = ((failedAttempts / totalAttempts) * circumference);
  
  const getPassColor = () => {
    if (passPercentage >= 80) return '#10b981';
    if (passPercentage >= 60) return '#f59e0b';
    if (passPercentage >= 40) return '#f97316';
    return '#ef4444';
  };

  const getPerformanceText = () => {
    if (totalAttempts === 0) return 'No Data';
    if (passPercentage >= 80) return 'Excellent';
    if (passPercentage >= 60) return 'Good';
    if (passPercentage >= 40) return 'Average';
    return 'Needs Work';
  };

  // Debug logging to see what data we're receiving
  console.log('PieChart received results:', results);
  console.log('Total attempts:', totalAttempts);
  console.log('Passed attempts:', passedAttempts);
  console.log('Pass percentage:', passPercentage);

  // If no results, show empty state
  if (totalAttempts === 0) {
    return (
      <div className="pie-chart-container-5x5">
        <div className="pie-chart-empty">
          <div className="empty-icon">📊</div>
          <div className="empty-text">No Exam Data</div>
          <div className="empty-subtext">Take exams to see performance</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pie-chart-container-5x5">
      <div className="pie-chart-wrapper">
        <svg 
          className="pie-chart-svg" 
          viewBox="0 0 80 80"
          width="80" 
          height="80"
        >
          {/* Background circle */}
          <circle
            className="pie-chart-bg"
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="8"
          />
          
          {/* Failed attempts segment */}
          {failedAttempts > 0 && (
            <circle
              className="pie-chart-segment"
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="#ef4444"
              strokeWidth="8"
              strokeDasharray={`${failStrokeLength} ${circumference}`}
              strokeDashoffset="0"
              transform="rotate(-90 40 40)"
            />
          )}
          
          {/* Passed attempts segment */}
          {passedAttempts > 0 && (
            <circle
              className="pie-chart-segment"
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke={getPassColor()}
              strokeWidth="8"
              strokeDasharray={`${passStrokeLength} ${circumference}`}
              strokeDashoffset={-failStrokeLength}
              transform="rotate(-90 40 40)"
            />
          )}
        </svg>
        
        {/* Center percentage */}
        <div className="pie-chart-center">
          <div 
            className="pie-chart-percentage"
            style={{ color: getPassColor() }}
          >
            {passPercentage}%
          </div>
          <div className="pie-chart-label">Pass Rate</div>
        </div>
      </div>
      
      {/* Compact Legend */}
      <div className="pie-chart-legend-compact">
        <div className="legend-row">
          <div className="legend-item-compact">
            <div 
              className="legend-color" 
              style={{backgroundColor: getPassColor()}}
            ></div>
            <span className="legend-text">Passed: {passedAttempts}</span>
          </div>
          <div className="legend-item-compact">
            <div 
              className="legend-color" 
              style={{backgroundColor: '#ef4444'}}
            ></div>
            <span className="legend-text">Failed: {failedAttempts}</span>
          </div>
        </div>
        
        <div className="legend-row">
          <div className="legend-item-compact">
            <div 
              className="legend-color" 
              style={{backgroundColor: '#667eea'}}
            ></div>
            <span className="legend-text">Total: {totalAttempts}</span>
          </div>
          <div className="performance-badge-compact">
            <span 
              className="badge-text"
              style={{
                backgroundColor: getPassColor(),
                color: 'white'
              }}
            >
              {getPerformanceText()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieChart;