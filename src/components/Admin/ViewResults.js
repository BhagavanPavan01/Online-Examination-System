import React from 'react';
import { getResults } from '../../utils/storage';

const ViewResults = () => {
  const results = getResults();

  const calculateStatistics = () => {
    const total = results.length;
    const passed = results.filter(r => r.score >= 50).length;
    const failed = total - passed;
    const averageScore = total > 0 ? results.reduce((sum, r) => sum + r.score, 0) / total : 0;
    
    return {
      total,
      passed,
      failed,
      averageScore: Math.round(averageScore),
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0
    };
  };

  const stats = calculateStatistics();

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col">
          <h2>Exam Results</h2>
          <p className="text-muted">View all student exam results</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total Exams</h5>
              <h2 className="text-primary">{stats.total}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Passed</h5>
              <h2 className="text-success">{stats.passed}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Failed</h5>
              <h2 className="text-danger">{stats.failed}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Pass Rate</h5>
              <h2 className="text-warning">{stats.passRate}%</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>All Student Results</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Total Marks</th>
                  <th>Obtained Marks</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={result.id}>
                    <td>{index + 1}</td>
                    <td>{result.studentName}</td>
                    <td>{result.studentEmail}</td>
                    <td>
                      <span className={`badge ${result.score >= 50 ? 'badge-success' : 'badge-danger'}`}>
                        {result.score}%
                      </span>
                    </td>
                    <td>{result.score}%</td>
                    <td>{result.totalMarks}</td>
                    <td>{result.obtainedMarks}</td>
                    <td>{new Date(result.submittedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${result.score >= 50 ? 'badge-success' : 'badge-warning'}`}>
                        {result.score >= 50 ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {results.length === 0 && (
            <div className="text-center text-muted py-4">
              <h5>No results found</h5>
              <p>Students haven't taken any exams yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewResults;