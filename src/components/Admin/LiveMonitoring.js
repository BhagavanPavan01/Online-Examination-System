import React, { useState, useEffect } from 'react';
import { useWebcam } from '../../context/WebcamContext';

const LiveMonitoring = () => {
  const { activeExams, addWarning, endExamMonitoring, getStudentSnapshot, refreshData } = useWebcam();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentSnapshot, setCurrentSnapshot] = useState(null);

  // Update snapshot when selected student changes
  useEffect(() => {
    if (selectedStudent) {
      const snapshot = getStudentSnapshot(selectedStudent);
      setCurrentSnapshot(snapshot);
      
      // Refresh snapshot every 3 seconds
      const interval = setInterval(() => {
        const newSnapshot = getStudentSnapshot(selectedStudent);
        setCurrentSnapshot(newSnapshot);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [selectedStudent, getStudentSnapshot]);

  const handleSendWarning = (studentEmail) => {
    addWarning(studentEmail);
    alert(`Warning sent to student ${activeExams.find(e => e.studentEmail === studentEmail)?.studentName}`);
  };

  const handleForceSubmit = (studentEmail, studentName) => {
    if (window.confirm(`Force submit exam for ${studentName}? This will end their exam immediately.`)) {
      endExamMonitoring(studentEmail);
      alert(`Exam force submitted for ${studentName}`);
      setSelectedStudent(null);
    }
  };

  const getExamDuration = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getStatusColor = (warnings) => {
    if (warnings === 0) return 'success';
    if (warnings === 1) return 'warning';
    return 'danger';
  };

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col">
          <h2>📹 Live Exam Monitoring</h2>
          <p className="text-muted">Real-time monitoring of active exams</p>
          <button className="btn btn-outline-primary btn-sm" onClick={refreshData}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="row">
        {/* Active Exams List */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header d-flex justify-between align-items-center">
              <h5>Active Exams ({activeExams.length})</h5>
            </div>
            <div className="card-body p-0">
              {activeExams.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <h5>No Active Exams</h5>
                  <p>No students are currently taking exams.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {activeExams.map((exam) => (
                    <div
                      key={exam.studentEmail}
                      className={`list-group-item list-group-item-action ${
                        selectedStudent === exam.studentEmail ? 'active' : ''
                      }`}
                      onClick={() => setSelectedStudent(exam.studentEmail)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex w-100 justify-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{exam.studentName}</h6>
                          <small className="text-muted">Roll: {exam.rollNumber}</small>
                          <br />
                          <small>Branch: {exam.branch}</small>
                          <br />
                          <small>Duration: {getExamDuration(exam.startTime)}</small>
                          <br />
                          <small>Warnings: {exam.warnings}</small>
                        </div>
                        <span className={`badge badge-${getStatusColor(exam.warnings)}`}>
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
              <h5 className="mb-0">
                {selectedStudent ? 
                  `Monitoring: ${activeExams.find(e => e.studentEmail === selectedStudent)?.studentName}` : 
                  'Select a student to monitor'
                }
              </h5>
              {selectedStudent && (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleSendWarning(selectedStudent)}
                  >
                    ⚠️ Send Warning
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleForceSubmit(
                      selectedStudent, 
                      activeExams.find(e => e.studentEmail === selectedStudent)?.studentName
                    )}
                  >
                    ⏹️ Force Submit
                  </button>
                </div>
              )}
            </div>
            <div className="card-body">
              {selectedStudent ? (
                <div>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="alert alert-info">
                        <h6>Student Information</h6>
                        <p><strong>Name:</strong> {activeExams.find(e => e.studentEmail === selectedStudent)?.studentName}</p>
                        <p><strong>Email:</strong> {selectedStudent}</p>
                        <p><strong>Roll No:</strong> {activeExams.find(e => e.studentEmail === selectedStudent)?.rollNumber}</p>
                        <p><strong>Branch:</strong> {activeExams.find(e => e.studentEmail === selectedStudent)?.branch}</p>
                        <p><strong>Start Time:</strong> {new Date(activeExams.find(e => e.studentEmail === selectedStudent)?.startTime).toLocaleString()}</p>
                        <p><strong>Warnings:</strong> 
                          <span className={`badge badge-${getStatusColor(activeExams.find(e => e.studentEmail === selectedStudent)?.warnings)} ml-2`}>
                            {activeExams.find(e => e.studentEmail === selectedStudent)?.warnings}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="alert alert-light">
                        <h6>Exam Status</h6>
                        <p><strong>Duration:</strong> {getExamDuration(activeExams.find(e => e.studentEmail === selectedStudent)?.startTime)}</p>
                        <p><strong>Status:</strong> 
                          <span className="badge badge-success ml-2">Active</span>
                        </p>
                        <p><strong>Last Activity:</strong> {new Date(activeExams.find(e => e.studentEmail === selectedStudent)?.lastActivity).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Webcam Feed */}
                  <div className="text-center p-4 border rounded bg-light">
                    <h6>🎥 Live Webcam Monitoring</h6>
                    <p className="text-muted mb-3">
                      Last captured: {new Date().toLocaleTimeString()}
                    </p>
                    
                    {currentSnapshot ? (
                      <div className="webcam-feed">
                        <img 
                          src={currentSnapshot} 
                          alt="Webcam Feed" 
                          className="img-fluid rounded border"
                          style={{ maxHeight: '300px' }}
                        />
                        <div className="mt-2">
                          <small className="text-muted">
                            Live feed updates every 3 seconds
                          </small>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-dark text-white p-4 rounded">
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                          <div className="text-center">
                            <div className="spinner-border text-primary mb-2"></div>
                            <p>Waiting for webcam feed...</p>
                            <small>Student: {activeExams.find(e => e.studentEmail === selectedStudent)?.studentName}</small>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <h5>No Student Selected</h5>
                  <p>Select a student from the list to view live monitoring details.</p>
                </div>
              )}
            </div>
          </div>

          {/* Monitoring Statistics */}
          <div className="card mt-4">
            <div className="card-header">
              <h5>📊 Monitoring Statistics</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <h3 className="text-primary">{activeExams.length}</h3>
                  <p className="text-muted">Active Exams</p>
                </div>
                <div className="col-md-3">
                  <h3 className="text-warning">
                    {activeExams.reduce((sum, exam) => sum + exam.warnings, 0)}
                  </h3>
                  <p className="text-muted">Total Warnings</p>
                </div>
                <div className="col-md-3">
                  <h3 className="text-info">
                    {activeExams.filter(exam => exam.warnings > 0).length}
                  </h3>
                  <p className="text-muted">Students Warned</p>
                </div>
                <div className="col-md-3">
                  <h3 className="text-success">
                    {activeExams.filter(exam => exam.warnings === 0).length}
                  </h3>
                  <p className="text-muted">Clean Records</p>
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