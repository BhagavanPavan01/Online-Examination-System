import React, { useState, useEffect } from 'react';
import { getResults } from '../../utils/storage';
import { getBranches } from '../../utils/auth';
import jsPDF from 'jspdf';

const ViewResults = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [results, selectedBranch, searchTerm]);

  const loadResults = () => {
    const allResults = getResults();
    setResults(allResults);
  };

  const filterResults = () => {
    let filtered = results;
    
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(result => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === result.studentEmail);
        return user && user.branch === selectedBranch;
      });
    }
    
    if (searchTerm) {
      filtered = filtered.filter(result => 
        result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (result.rollNumber && result.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredResults(filtered);
  };

  const calculateStatistics = () => {
    const total = filteredResults.length;
    const passed = filteredResults.filter(r => r.score >= 50).length;
    const failed = total - passed;
    const averageScore = total > 0 ? filteredResults.reduce((sum, r) => sum + r.score, 0) / total : 0;
    
    return {
      total,
      passed,
      failed,
      averageScore: Math.round(averageScore),
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0
    };
  };

  const exportToPDF = (branch = 'all') => {
    const doc = new jsPDF();
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 14;
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Exam Results Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Branch filter info
    if (branch !== 'all') {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Branch: ${branch}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
    }
    
    // Date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Statistics
    const stats = calculateStatistics();
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    const statsText = `Total Exams: ${stats.total} | Passed: ${stats.passed} | Failed: ${stats.failed} | Pass Rate: ${stats.passRate}% | Avg Score: ${stats.averageScore}%`;
    doc.text(statsText, margin, yPosition);
    yPosition += 15;
    
    // Check if we have results
    if (filteredResults.length === 0) {
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text('No results to display', pageWidth / 2, yPosition, { align: 'center' });
      doc.save(`exam_results${branch !== 'all' ? `_${branch}` : ''}_${new Date().toISOString().split('T')[0]}.pdf`);
      return;
    }
    
    // Table Headers
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(102, 126, 234);
    const headerHeight = 8;
    const colWidths = [10, 40, 50, 20, 25, 20, 25];
    let xPosition = margin;
    
    // Draw header background
    doc.rect(margin, yPosition, pageWidth - (2 * margin), headerHeight, 'F');
    
    // Header texts
    doc.text('#', xPosition + 5, yPosition + 6);
    xPosition += colWidths[0];
    doc.text('Student Name', xPosition + 2, yPosition + 6);
    xPosition += colWidths[1];
    doc.text('Email', xPosition + 2, yPosition + 6);
    xPosition += colWidths[2];
    doc.text('Score', xPosition + 2, yPosition + 6);
    xPosition += colWidths[3];
    doc.text('Marks', xPosition + 2, yPosition + 6);
    xPosition += colWidths[4];
    doc.text('Status', xPosition + 2, yPosition + 6);
    xPosition += colWidths[5];
    doc.text('Date', xPosition + 2, yPosition + 6);
    
    yPosition += headerHeight + 2;
    
    // Table Rows
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    
    filteredResults.forEach((result, index) => {
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
        
        // Redraw headers on new page
        doc.setFillColor(102, 126, 234);
        doc.rect(margin, yPosition, pageWidth - (2 * margin), headerHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        
        xPosition = margin;
        doc.text('#', xPosition + 5, yPosition + 6);
        xPosition += colWidths[0];
        doc.text('Student Name', xPosition + 2, yPosition + 6);
        xPosition += colWidths[1];
        doc.text('Email', xPosition + 2, yPosition + 6);
        xPosition += colWidths[2];
        doc.text('Score', xPosition + 2, yPosition + 6);
        xPosition += colWidths[3];
        doc.text('Marks', xPosition + 2, yPosition + 6);
        xPosition += colWidths[4];
        doc.text('Status', xPosition + 2, yPosition + 6);
        xPosition += colWidths[5];
        doc.text('Date', xPosition + 2, yPosition + 6);
        
        yPosition += headerHeight + 2;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
      }
      
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.email === result.studentEmail);
      
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, yPosition, pageWidth - (2 * margin), 8, 'F');
      }
      
      // Reset x position for this row
      xPosition = margin;
      
      // Row data
      doc.text((index + 1).toString(), xPosition + 5, yPosition + 6);
      xPosition += colWidths[0];
      
      doc.text(result.studentName.substring(0, 18), xPosition + 2, yPosition + 6);
      xPosition += colWidths[1];
      
      doc.text(result.studentEmail.substring(0, 22), xPosition + 2, yPosition + 6);
      xPosition += colWidths[2];
      
      doc.text(`${result.score}%`, xPosition + 2, yPosition + 6);
      xPosition += colWidths[3];
      
      doc.text(`${result.obtainedMarks}/${result.totalMarks}`, xPosition + 2, yPosition + 6);
      xPosition += colWidths[4];
      
      // Status with color
      if (result.score >= 50) {
        doc.setTextColor(0, 128, 0);
      } else {
        doc.setTextColor(255, 0, 0);
      }
      doc.text(result.score >= 50 ? 'Pass' : 'Fail', xPosition + 2, yPosition + 6);
      doc.setTextColor(0, 0, 0);
      xPosition += colWidths[5];
      
      doc.text(new Date(result.submittedAt).toLocaleDateString(), xPosition + 2, yPosition + 6);
      
      yPosition += 10;
    });
    
    // Add summary at the end
    yPosition += 10;
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Summary:', margin, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.text(`• Total Students: ${stats.total}`, margin + 5, yPosition);
    yPosition += 6;
    doc.text(`• Passed: ${stats.passed}`, margin + 5, yPosition);
    yPosition += 6;
    doc.text(`• Failed: ${stats.failed}`, margin + 5, yPosition);
    yPosition += 6;
    doc.text(`• Pass Rate: ${stats.passRate}%`, margin + 5, yPosition);
    yPosition += 6;
    doc.text(`• Average Score: ${stats.averageScore}%`, margin + 5, yPosition);
    
    // Save PDF
    const branchSuffix = branch !== 'all' ? `_${branch}` : '';
    doc.save(`exam_results${branchSuffix}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const branches = getBranches();

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Exam Results</h1>
        <p>View and analyze student performance</p>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filter-row">
          <div className="filter-group">
            <label>Filter by Branch:</label>
            <select 
              value={selectedBranch} 
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Branches</option>
              {branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search by name, email, or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <button 
              className="btn-primary"
              onClick={() => exportToPDF(selectedBranch)}
              disabled={filteredResults.length === 0}
            >
              📄 Export PDF
            </button>
            <button 
              className="btn-secondary"
              onClick={loadResults}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Results Table - Statistics section removed */}
      <div className="data-card">
        <div className="card-header">
          <h3>Student Results ({filteredResults.length})</h3>
          <div className="header-actions">
            <span className="results-info">
              Showing {filteredResults.length} of {results.length} results
              {selectedBranch !== 'all' && ` for ${selectedBranch} branch`}
            </span>
          </div>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Roll No.</th>
                  <th>Branch</th>
                  <th>Score</th>
                  <th>Marks</th>
                  <th>Duration</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result, index) => {
                  const users = JSON.parse(localStorage.getItem('users')) || [];
                  const user = users.find(u => u.email === result.studentEmail);
                  const duration = result.duration ? `${Math.floor(result.duration / 60)}:${(result.duration % 60).toString().padStart(2, '0')}` : 'N/A';
                  
                  return (
                    <tr key={result.id} className={index % 2 === 0 ? 'even' : 'odd'}>
                      <td>{index + 1}</td>
                      <td className="student-name">
                        <div className="student-avatar">
                          {result.studentName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        {result.studentName}
                      </td>
                      <td>
                        <span className="roll-number">
                          {user?.rollNumber || result.rollNumber || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`branch-tag ${user?.branch?.toLowerCase()}`}>
                          {user?.branch || result.branch || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className="score-display">
                          <div className={`score-circle ${result.score >= 50 ? 'score-pass' : 'score-fail'}`}>
                            {result.score}%
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="marks">
                          {result.obtainedMarks}/{result.totalMarks}
                        </span>
                      </td>
                      <td>
                        <span className="duration">
                          {duration}
                        </span>
                      </td>
                      <td>
                        <span className="date">
                          {new Date(result.submittedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${result.score >= 50 ? 'status-passed' : 'status-failed'}`}>
                          {result.score >= 50 ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredResults.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h4>No results found</h4>
              <p>No exam results match your current filters.</p>
              <button 
                className="btn-primary"
                onClick={() => {
                  setSelectedBranch('all');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewResults;