import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuestions, getStudentResults } from '../../utils/storage';


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
    <div className="student-container">
      {/* Welcome Header Section */}
      <div className="welcome-header">
        <div className="welcome-content">
          <div className="user-profile-display">
            <div className="profile-avatar-large">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="user-details">
              <h1>Welcome back, {user.name}! 👋</h1>
              <div className="user-meta">
                <span className="roll-number-badge">{user.rollNumber}</span>
                <span className="branch-tag">{user.branch}</span>
                <span className="role-badge">{user.role}</span>
              </div>
              <p className="welcome-subtitle">
                Ready to ace your next exam? Check your performance and start new tests.
              </p>
            </div>
          </div>
        </div>
      </div>

      {hasOngoingExam && (
        <div className="ongoing-exam-alert">
          <div className="alert-content">
            <span className="alert-icon">⏰</span>
            <div>
              <h4>Exam in Progress</h4>
              <p>You have an ongoing exam. You can resume it anytime.</p>
            </div>
          </div>
          <button className="resume-btn" onClick={handleStartExam}>
            Resume Exam
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-section">
        <h2 className="section-title">Your Performance Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total-questions">📚</div>
            <div className="stat-info">
              <h3>Total Questions</h3>
              <p>{stats.totalQuestions}</p>
              <span>Available in database</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon exams-taken">📝</div>
            <div className="stat-info">
              <h3>Exams Taken</h3>
              <p>{stats.examsTaken}</p>
              <span>Completed exams</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon average-score">📈</div>
            <div className="stat-info">
              <h3>Average Score</h3>
              <p>{stats.averageScore}%</p>
              <span>Your performance</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon last-score">⭐</div>
            <div className="stat-info">
              <h3>Last Score</h3>
              <p className={stats.lastScore >= 50 ? 'score-pass' : 'score-fail'}>
                {stats.lastScore}%
              </p>
              <span>Most recent attempt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="action-section">
        <div className="action-grid">
          <div className="action-card">
            <div className="action-header">
              <h3>Exam Actions</h3>
              <p>Start new tests or view your results</p>
            </div>
            <div className="action-buttons">
              <button
                className="action-btn primary"
                onClick={handleStartExam}
              >
                <span className="btn-icon">🚀</span>
                <span className="btn-text">
                  {hasOngoingExam ? 'Resume Exam' : 'Start New Exam'}
                </span>
              </button>

              <button
                className="action-btn secondary"
                onClick={handleViewResults}
              >
                <span className="btn-icon">📊</span>
                <span className="btn-text">View My Results</span>
              </button>
            </div>

            {hasOngoingExam && (
              <div className="exam-info">
                <h4>📋 Ongoing Exam Details</h4>
                <ul>
                  <li> You can resume from where you left</li>
                  <li> Timer will continue automatically</li>
                  <li> Your answers are saved in real-time</li>
                </ul>
              </div>
            )}
          </div>

          <div className="performance-card">
            <div className="performance-header">
              <h3>Latest Performance</h3>
              <p>Your most recent exam results</p>
            </div>
            <div className="performance-content">
              {hasTakenExam ? (
                <div className="speedometer-container">
                  {/* <PieChart score={stats.lastScore} /> */}
                  <div className="performance-stats">
                    <div className="performance-stat">
                      <span className="stat-label">Best Score:</span>
                      <span className="stat-value">
                        {Math.max(...getStudentResults(user.email).map(r => r.score))}%
                      </span>
                    </div>
                    <div className="performance-stat">
                      <span className="stat-label">Total Attempts:</span>
                      <span className="stat-value">{stats.examsTaken}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-exam-state">
                  <div className="no-exam-icon">🎯</div>
                  <h4>No Exam Taken Yet</h4>
                  <p>Start your first exam to see your performance metrics!</p>
                  <button
                    className="action-btn primary"
                    onClick={handleStartExam}
                  >
                    Start First Exam
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Section */}
      <div className="info-section">
        <div className="info-card">
          <div className="info-header">
            <h3>📋 Exam Guidelines</h3>
          </div>
          <div className="info-content">
            <div className="guideline-list">
              <div className="guideline-item">
                <span className="guideline-icon">⏱️</span>
                <div>
                  <h4>Time Management</h4>
                  <p>Each exam has a 30-minute time limit. Manage your time wisely.</p>
                </div>
              </div>

              <div className="guideline-item">
                <span className="guideline-icon">📹</span>
                <div>
                  <h4>Webcam Monitoring</h4>
                  <p>Exams are monitored via webcam for integrity purposes.</p>
                </div>
              </div>

              <div className="guideline-item">
                <span className="guideline-icon">🚫</span>
                <div>
                  <h4>No Tab Switching</h4>
                  <p>Avoid switching tabs/windows during the exam.</p>
                </div>
              </div>

              <div className="guideline-item">
                <span className="guideline-icon">💾</span>
                <div>
                  <h4>Auto-save</h4>
                  <p>Your progress is saved automatically every minute.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;