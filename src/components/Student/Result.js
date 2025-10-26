import React, { useState, useEffect } from 'react';
import { getStudentResults } from '../../utils/storage';
import PieChart from '../Common/PieChart';


const Result = ({ user }) => {
  const [results, setResults] = useState([]);
  const [latestResult, setLatestResult] = useState(null);

  useEffect(() => {
    const studentResults = getStudentResults(user.email);
    setResults(studentResults);
    if (studentResults.length > 0) {
      setLatestResult(studentResults[studentResults.length - 1]);
    }
  }, [user.email]);

  if (results.length === 0) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-info">
          <h4>No Results Found</h4>
          <p>You haven't taken any exams yet. <a href="/exam">Take your first exam now!</a></p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col">
          <h2>Exam Results</h2>
          <p className="text-muted">Your performance history</p>
        </div>
      </div>

      {latestResult && (
        <div className="row mb-4">
          <div className="col-md-6">
            <div className={`card border-${latestResult.score >= 50 ? 'success' : 'danger'}`}>
              <div className={`card-header bg-${latestResult.score >= 50 ? 'success' : 'danger'} text-white`}>
                <h5 className="mb-0">Latest Exam Result</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col">
                    <p><strong>Student:</strong> {latestResult.studentName}</p>
                    <p><strong>Score:</strong> 
                      <span className={`badge ${latestResult.score >= 50 ? 'badge-success' : 'badge-danger'} ml-2`}>
                        {latestResult.score}%
                      </span>
                    </p>
                    <p><strong>Marks Obtained:</strong> {latestResult.obtainedMarks} / {latestResult.totalMarks}</p>
                    <p><strong>Date:</strong> {new Date(latestResult.submittedAt).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> 
                      <span className={`badge ${latestResult.score >= 50 ? 'badge-success' : 'badge-warning'} ml-2`}>
                        {latestResult.score >= 50 ? 'Pass' : 'Fail'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Performance Meter</h5>
              </div>
              <div className="card-body text-center">
                <PieChart score={latestResult.score} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col">
          <div className="card">
            <div className="card-header">
              <h5>All Exam Results</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Total Marks</th>
                      <th>Obtained Marks</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={result.id}>
                        <td>{index + 1}</td>
                        <td>{new Date(result.submittedAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${result.score >= 50 ? 'badge-success' : 'badge-danger'}`}>
                            {result.score}%
                          </span>
                        </td>
                        <td>{result.score}%</td>
                        <td>{result.totalMarks}</td>
                        <td>{result.obtainedMarks}</td>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;