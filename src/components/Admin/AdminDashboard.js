import React, { useState, useEffect } from 'react';
import { getQuestions, getResults } from '../../utils/storage';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalResults: 0,
    totalStudents: 0,
    passRate: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const questions = getQuestions();
    const results = getResults();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const students = users.filter(user => user.role === 'student');

    const passedResults = results.filter(result => result.score >= 50);
    const passRate = results.length > 0 ? Math.round((passedResults.length / results.length) * 100) : 0;

    setStats({
      totalQuestions: questions.length,
      totalResults: results.length,
      totalStudents: students.length,
      passRate: passRate
    });
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
      localStorage.removeItem('questions');
      localStorage.removeItem('results');
      localStorage.removeItem('users');
      // Keep current admin user
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser && currentUser.role === 'admin') {
        const adminUser = {
          name: currentUser.name,
          email: currentUser.email,
          password: currentUser.password,
          role: 'admin'
        };
        localStorage.setItem('users', JSON.stringify([adminUser]));
      }
      loadStats();
      alert('All data cleared successfully!');
    }
  };

  const handleExportData = () => {
    const questions = getQuestions();
    const results = getResults();
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const exportData = {
      questions: questions,
      results: results,
      users: users,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exam-system-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);

        if (importData.questions) {
          localStorage.setItem('questions', JSON.stringify(importData.questions));
        }
        if (importData.results) {
          localStorage.setItem('results', JSON.stringify(importData.results));
        }
        if (importData.users) {
          localStorage.setItem('users', JSON.stringify(importData.users));
        }

        loadStats();
        alert('Data imported successfully!');
        event.target.value = ''; // Reset file input
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col">
          <h2>Admin Dashboard</h2>
          <p className="text-muted">Manage your online examination system</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total Questions</h5>
              <h2 className="text-primary">{stats.totalQuestions}</h2>
              <small className="text-muted">Questions in database</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Exam Results</h5>
              <h2 className="text-success">{stats.totalResults}</h2>
              <small className="text-muted">Total exams taken</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total Students</h5>
              <h2 className="text-info">{stats.totalStudents}</h2>
              <small className="text-muted">Registered students</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Pass Rate</h5>
              <h2 className="text-warning">{stats.passRate}%</h2>
              <small className="text-muted">Overall success rate</small>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/admin/add-question')}
                >
                  Add New Questions
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => navigate('/admin/questions')}
                >
                  Manage Questions
                </button>
                <button
                  className="btn btn-info"
                  onClick={() => navigate('/admin/results')}
                >
                  View All Results
                </button>
                <button
                  className="btn btn-warning"
                  onClick={() => navigate('/admin/users')}
                >
                  Manage Users
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => navigate('/admin/monitoring')}
                >
                  🎥 Live Monitoring
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>System Tools</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-primary"
                  onClick={handleExportData}
                >
                  Export All Data
                </button>
                <div>
                  <input
                    type="file"
                    id="importFile"
                    accept=".json"
                    onChange={handleImportData}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="importFile"
                    className="btn btn-outline-success w-100"
                  >
                    Import Data
                  </label>
                </div>
                <button
                  className="btn btn-outline-danger"
                  onClick={handleClearAllData}
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}

      <div className="col-md-6">
        <div className="card">
          <div className="card-header d-flex justify-between align-items-center">
            <h5>Recent Results</h5>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => navigate('/admin/results')}
            >
              View All
            </button>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll No.</th>
                    <th>Branch</th>
                    <th>Score</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {getResults().slice(-5).reverse().map(result => (
                    <tr key={result.id}>
                      <td>{result.studentName}</td>
                      <td>
                        <code>{result.rollNumber || 'N/A'}</code>
                      </td>
                      <td>{result.branch || 'N/A'}</td>
                      <td>
                        <span className={`badge ${result.score >= 50 ? 'badge-success' : 'badge-danger'}`}>
                          {result.score}%
                        </span>
                      </td>
                      <td>{new Date(result.submittedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {getResults().length === 0 && (
              <div className="text-center text-muted py-3">
                <p>No exam results yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;