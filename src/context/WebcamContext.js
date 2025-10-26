import React, { createContext, useContext, useState, useEffect } from 'react';

const WebcamContext = createContext();

export const useWebcam = () => {
  const context = useContext(WebcamContext);
  if (!context) {
    throw new Error('useWebcam must be used within a WebcamProvider');
  }
  return context;
};

export const WebcamProvider = ({ children }) => {
  const [activeExams, setActiveExams] = useState([]);
  const [webcamData, setWebcamData] = useState({});

  // Load active exams from localStorage
  const loadActiveExams = () => {
    try {
      const monitoringData = JSON.parse(localStorage.getItem('webcamMonitoring')) || {};
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const results = JSON.parse(localStorage.getItem('results')) || [];

      // Convert monitoring data to active exams format
      const exams = Object.values(monitoringData)
        .filter(student => {
          const hasOngoingExam = localStorage.getItem(`exam_in_progress_${student.studentEmail}`);
          const hasCompletedExam = results.some(result => result.studentEmail === student.studentEmail);
          return hasOngoingExam && !hasCompletedExam;
        })
        .map(student => {
          const user = users.find(u => u.email === student.studentEmail);
          return {
            studentId: student.studentEmail,
            studentName: user?.name || 'Unknown Student',
            studentEmail: student.studentEmail,
            rollNumber: user?.rollNumber || 'N/A',
            branch: user?.branch || 'N/A',
            startTime: student.lastActivity || new Date().toISOString(),
            warnings: student.violations || 0,
            lastSnapshot: student.lastSnapshot,
            isActive: student.isActive !== false
          };
        });

      setActiveExams(exams);
      setWebcamData(monitoringData);
    } catch (error) {
      console.error('Error loading active exams:', error);
    }
  };

  // Refresh data every 5 seconds
  useEffect(() => {
    loadActiveExams();
    const interval = setInterval(loadActiveExams, 5000);
    return () => clearInterval(interval);
  }, []);

  const addWarning = (studentEmail) => {
    const monitoringData = JSON.parse(localStorage.getItem('webcamMonitoring')) || {};
    
    if (monitoringData[studentEmail]) {
      monitoringData[studentEmail].violations = (monitoringData[studentEmail].violations || 0) + 1;
      monitoringData[studentEmail].lastActivity = new Date().toISOString();
      
      // Add warning snapshot
      monitoringData[studentEmail].snapshots = monitoringData[studentEmail].snapshots || [];
      monitoringData[studentEmail].snapshots.push({
        timestamp: new Date().toISOString(),
        type: 'warning',
        violationType: 'manual_warning'
      });
      
      localStorage.setItem('webcamMonitoring', JSON.stringify(monitoringData));
      loadActiveExams(); // Refresh data
    }
  };

  const endExamMonitoring = (studentEmail) => {
    const monitoringData = JSON.parse(localStorage.getItem('webcamMonitoring')) || {};
    delete monitoringData[studentEmail];
    localStorage.setItem('webcamMonitoring', JSON.stringify(monitoringData));
    
    // Clear exam progress
    localStorage.removeItem(`exam_in_progress_${studentEmail}`);
    localStorage.removeItem(`webcam_interval_${studentEmail}`);
    
    loadActiveExams(); // Refresh data
  };

  const getStudentSnapshot = (studentEmail) => {
    return webcamData[studentEmail]?.lastSnapshot || null;
  };

  const value = {
    activeExams,
    webcamData,
    addWarning,
    endExamMonitoring,
    getStudentSnapshot,
    refreshData: loadActiveExams
  };

  return (
    <WebcamContext.Provider value={value}>
      {children}
    </WebcamContext.Provider>
  );
};