// Create /components/Admin/Results.js
import React, { useState, useEffect } from 'react';
import { getResults, getAllStudentsWithResults } from '../../../utils/storage';

const AdminResults = () => {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortResults();
  }, [results, searchTerm, filterBranch, sortBy, sortOrder]);

  const loadData = () => {
    const allResults = getResults();
    const allStudents = getAllStudentsWithResults();
    
    setResults(allResults);
    setStudents(allStudents);
  };

  const filterAndSortResults = () => {
    let filtered = results;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(result => 
        result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by branch
    if (filterBranch !== 'all') {
      filtered = filtered.filter(result => result.branch === filterBranch);
    }

    // Sort results
    filtered = [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.studentName;
          bValue = b.studentName;
          break;
        case 'rollNumber':
          aValue = a.rollNumber || '';
          bValue = b.rollNumber || '';
          break;
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        case 'date':
        default:
          aValue = new Date(a.submittedAt);
          bValue = new Date(b.submittedAt);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredResults(filtered);
  };

  const getBranches = () => {
    const branches = [...new Set(results.map(result => result.branch).filter(Boolean))];
    return branches.sort();
  };

  const deleteResult = (resultId) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      const updatedResults = results.filter(result => result.id !== resultId);
      localStorage.setItem('results', JSON.stringify(updatedResults));
      loadData();
      alert('Result deleted successfully!');
    }
  };

  const exportResults = () => {
    const exportData = filteredResults.map(result => ({
      'Student Name': result.studentName,
      'Roll Number': result.rollNumber || 'N/A',
      'Branch': result.branch || 'N/A',
      'Email': result.studentEmail,
      'Score': `${result.score}%`,
      'Correct Answers': result.correctAnswers,
      'Total Questions': result.totalQuestions,
      'Time Spent': result.timeSpent ? `${Math.floor(result.timeSpent / 60)}m ${result.timeSpent % 60}s` : 'N/A',
      'Date': new Date(result.submittedAt).toLocaleString()
    }));

    const csvHeaders = Object.keys(exportData[0] || {}).join(',');
    const csvRows = exportData.map(row => 
      Object.values(row).map(value => `"${value}"`).join(',')
    ).join('\n');
    
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exam-results-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col">
          <h2>Exam Results Management</h2>
          <p className="text-muted">View and manage all exam results with roll numbers</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5>Total Results</h5>
              <h3 className="text-primary">{results.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5>Students with Results</h5>
              <h3 className="text-success">
                {[...new Set(results.map(r => r.studentEmail))].length}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5>Average Score</h5>
              <h3 className="text-info">
                {results.length > 0 
                  ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length) 
                  : 0}%
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5>Pass Rate</h5>
              <h3 className="text-warning">
                {results.length > 0 
                  ? Math.round((results.filter(r => r.score >= 50).length / results.length) * 100) 
                  : 0}%
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, roll number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <select
            className="form-control"
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
          >
            <option value="all">All Branches</option>
            {getBranches().map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <select
            className="form-control"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="rollNumber">Sort by Roll No.</option>
            <option value="score">Sort by Score</option>
          </select>
        </div>
        <div className="col-md-2">
          <select
            className="form-control"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
        <div className="col-md-2">
          <div className="btn-group w-100">
            <button className="btn btn-outline-secondary" onClick={loadData}>
              Refresh
            </button>
            <button className="btn btn-primary" onClick={exportResults}>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Branch</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Correct Answers</th>
                  <th>Time Spent</th>
                  <th>Date & Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map(result => (
                  <tr key={result.id}>
                    <td>{result.studentName}</td>
                    <td>
                      {result.rollNumber ? (
                        <code>{result.rollNumber}</code>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    <td>{result.branch || 'N/A'}</td>
                    <td>{result.studentEmail}</td>
                    <td>
                      <span className={`badge ${result.score >= 50 ? 'badge-success' : 'badge-danger'}`}>
                        {result.score}%
                      </span>
                    </td>
                    <td>
                      {result.correctAnswers}/{result.totalQuestions}
                    </td>
                    <td>
                      {result.timeSpent 
                        ? `${Math.floor(result.timeSpent / 60)}m ${result.timeSpent % 60}s`
                        : 'N/A'
                      }
                    </td>
                    <td>
                      {new Date(result.submittedAt).toLocaleString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteResult(result.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredResults.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No results found</p>
            </div>
          )}
        </div>
      </div>

      {/* Students Summary */}
      <div className="card mt-4">
        <div className="card-header">
          <h5>Students Performance Summary</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Branch</th>
                  <th>Total Exams</th>
                  <th>Average Score</th>
                  <th>Last Score</th>
                  <th>Last Exam Date</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 10).map(student => (
                  <tr key={student.email}>
                    <td>{student.name}</td>
                    <td>
                      {student.rollNumber ? (
                        <code>{student.rollNumber}</code>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    <td>{student.branch || 'N/A'}</td>
                    <td>{student.totalExams}</td>
                    <td>
                      <span className={`badge ${student.averageScore >= 50 ? 'badge-success' : 'badge-danger'}`}>
                        {student.averageScore}%
                      </span>
                    </td>
                    <td>
                      {student.lastScore !== null ? (
                        <span className={`badge ${student.lastScore >= 50 ? 'badge-success' : 'badge-danger'}`}>
                          {student.lastScore}%
                        </span>
                      ) : (
                        <span className="text-muted">No exams</span>
                      )}
                    </td>
                    <td>
                      {student.lastExamDate 
                        ? new Date(student.lastExamDate).toLocaleDateString()
                        : 'N/A'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {students.length === 0 && (
            <div className="text-center py-3">
              <p className="text-muted">No students found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminResults;