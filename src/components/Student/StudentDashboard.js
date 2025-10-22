import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuestions, getStudentResults } from '../../utils/storage';
import Speedometer from '../Common/Speedometer';

const StudentDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    examsTaken: 0,
    averageScore: 0,
    lastScore: 0
  });
  const [hasOngoingExam, setHasOngoingExam] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const questions = getQuestions();
    const results = getStudentResults(user.email);
    const lastResult = results[results.length - 1];

    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const averageScore = results.length > 0 ? totalScore / results.length : 0;

    // Check if there's an ongoing exam
    const ongoingExam = localStorage.getItem(`exam_in_progress_${user.email}`);
    setHasOngoingExam(!!ongoingExam);

    setStats({
      totalQuestions: questions.length,
      examsTaken: results.length,
      averageScore: Math.round(averageScore),
      lastScore: lastResult ? lastResult.score : 0
    });
  }, [user.email]);

  const handleStartExam = () => {
    const questions = getQuestions();
    if (questions.length === 0) {
      alert('No questions available. Please contact administrator.');
      return;
    }

    // Check if exam already in progress
    const ongoingExam = localStorage.getItem(`exam_in_progress_${user.email}`);
    if (ongoingExam) {
      const confirmResume = window.confirm(
        'You have an ongoing exam. Would you like to resume it?'
      );
      if (confirmResume) {
        navigate('/exam');
      }
    } else {
      navigate('/exam');
    }
  };

  const handleViewResults = () => {
    const results = getStudentResults(user.email);
    if (results.length === 0) {
      alert('You haven\'t taken any exams yet.');
      return;
    }
    navigate('/result');
  };

  const hasTakenExam = stats.examsTaken > 0;

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col">
          <h2>Welcome, {user.name}!</h2>
          <p className="text-muted">Student Dashboard - {user.email}</p>
        </div>
      </div>

      {hasOngoingExam && (
        <div className="row mb-4">
          <div className="col">
            <div className="alert alert-warning">
              <h5>📝 Exam in Progress</h5>
              <p>You have an ongoing exam. You can resume it by clicking "Take Exam".</p>
            </div>
          </div>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total Questions</h5>
              <h2 className="text-primary">{stats.totalQuestions}</h2>
              <small className="text-muted">Available in database</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Exams Taken</h5>
              <h2 className="text-success">{stats.examsTaken}</h2>
              <small className="text-muted">Completed exams</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Average Score</h5>
              <h2 className="text-info">{stats.averageScore}%</h2>
              <small className="text-muted">Your average performance</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Last Score</h5>
              <h2 className={stats.lastScore >= 50 ? 'text-success' : 'text-danger'}>
                {stats.lastScore}%
              </h2>
              <small className="text-muted">Most recent attempt</small>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Exam Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={handleStartExam}
                >
                  {hasOngoingExam ? 'Resume Exam' : 'Start New Exam'}
                </button>
                <button 
                  className="btn btn-success btn-lg"
                  onClick={handleViewResults}
                >
                  View My Results
                </button>
              </div>
              
              {hasOngoingExam && (
                <div className="mt-3 p-3 bg-light rounded">
                  <h6>Exam Instructions:</h6>
                  <ul className="small mb-0">
                    <li>You can resume your ongoing exam</li>
                    <li>Timer will continue from where you left</li>
                    <li>Your answers are saved automatically</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Latest Performance</h5>
            </div>
            <div className="card-body text-center">
              {hasTakenExam ? (
                <Speedometer score={stats.lastScore} />
              ) : (
                <div className="alert alert-info">
                  <h5>No Exam Taken Yet</h5>
                  <p>Start your first exam to see your performance metrics!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exam Rules Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5>📋 Exam Rules & Guidelines</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Before Starting:</h6>
                  <ul>
                    <li>Ensure stable internet connection</li>
                    <li>Use a desktop/laptop with webcam</li>
                    <li>Close all other applications</li>
                    <li>Find a quiet, well-lit environment</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>During Exam:</h6>
                  <ul>
                    <li>Webcam monitoring is active</li>
                    <li>No switching between tabs/windows</li>
                    <li>No external help allowed</li>
                    <li>Auto-submit when time ends</li>
                  </ul>
                </div>
              </div>
              <div className="alert alert-warning mt-3">
                <strong>Note:</strong> Your exam session is monitored live by administrators for integrity purposes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;