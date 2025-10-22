import React, { useState, useEffect } from 'react';
import { useWebcam } from '../../context/WebcamContext';

const LiveMonitoring = () => {
  const { activeExams, addWarning, endExamMonitoring } = useWebcam();
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleSendWarning = (studentId) => {
    addWarning(studentId);
    alert(`Warning sent to student ${studentId}`);
  };

  const handleForceSubmit = (studentId, studentName) => {
    if (window.confirm(`Force submit exam for ${studentName}?`)) {
      endExamMonitoring(studentId);
      alert(`Exam force submitted for ${studentName}`);
    }
  };

  const getExamDuration = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000); // in seconds
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col">
          <h2>📹 Live Exam Monitoring</h2>
          <p className="text-muted">Monitor active exams in real-time</p>
        </div>
      </div>

      <div className="row">
        {/* Active Exams List */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Active Exams ({activeExams.length})</h5>
            </div>
            <div className="card-body">
              {activeExams.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <h5>No Active Exams</h5>
                  <p>No students are currently taking exams.</p>
                </div>
              ) : (
                <div className="list-group">
                  {activeExams.map((exam) => (
                    <div
                      key={exam.studentId}
                      className={`list-group-item list-group-item-action ${
                        selectedStudent === exam.studentId ? 'active' : ''
                      }`}
                      onClick={() => setSelectedStudent(exam.studentId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-between align-items-start">
                        <div>
                          <h6 className="mb-1">{exam.studentName}</h6>
                          <small>ID: {exam.studentId}</small>
                          <br />
                          <small>Duration: {getExamDuration(exam.startTime)}</small>
                          <br />
                          <small>Warnings: {exam.warnings}</small>
                        </div>
                        <span className={`badge ${
                          exam.warnings === 0 ? 'badge-success' : 
                          exam.warnings === 1 ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {exam.warnings} warn
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Monitoring Panel */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-between align-items-center">
              <h5>
                {selectedStudent ? 
                  `Monitoring: ${activeExams.find(e => e.studentId === selectedStudent)?.studentName}` : 
                  'Select a student to monitor'
                }
              </h5>
              {selectedStudent && (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleSendWarning(selectedStudent)}
                  >
                    Send Warning
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleForceSubmit(
                      selectedStudent, 
                      activeExams.find(e => e.studentId === selectedStudent)?.studentName
                    )}
                  >
                    Force Submit
                  </button>
                </div>
              )}
            </div>
            <div className="card-body">
              {selectedStudent ? (
                <div>
                  <div className="alert alert-info">
                    <h6>Student Information:</h6>
                    <p><strong>Name:</strong> {activeExams.find(e => e.studentId === selectedStudent)?.studentName}</p>
                    <p><strong>Email:</strong> {selectedStudent}</p>
                    <p><strong>Start Time:</strong> {new Date(activeExams.find(e => e.studentId === selectedStudent)?.startTime).toLocaleString()}</p>
                    <p><strong>Warnings:</strong> {activeExams.find(e => e.studentId === selectedStudent)?.warnings}</p>
                  </div>
                  
                  <div className="text-center p-4 border rounded bg-light">
                    <h6>🎥 Live Webcam Feed</h6>
                    <p className="text-muted">
                      Webcam monitoring is active for this student.
                      <br />
                      <small>Live video streaming would be implemented in production.</small>
                    </p>
                    <div className="bg-dark text-white p-3 rounded">
                      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                        <div className="text-center">
                          <div className="spinner-border text-primary mb-2"></div>
                          <p>Live Video Feed</p>
                          <small>Student: {activeExams.find(e => e.studentId === selectedStudent)?.studentName}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <h5>No Student Selected</h5>
                  <p>Select a student from the list to view monitoring details.</p>
                </div>
              )}
            </div>
          </div>

          {/* Monitoring Statistics */}
          <div className="card mt-4">
            <div className="card-header">
              <h5>Monitoring Statistics</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-4">
                  <h3 className="text-primary">{activeExams.length}</h3>
                  <p className="text-muted">Active Exams</p>
                </div>
                <div className="col-md-4">
                  <h3 className="text-warning">
                    {activeExams.reduce((sum, exam) => sum + exam.warnings, 0)}
                  </h3>
                  <p className="text-muted">Total Warnings</p>
                </div>
                <div className="col-md-4">
                  <h3 className="text-info">
                    {activeExams.filter(exam => exam.warnings > 0).length}
                  </h3>
                  <p className="text-muted">Students Warned</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoring;