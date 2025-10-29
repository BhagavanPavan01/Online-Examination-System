import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

  // Load active exams from localStorage - wrapped with useCallback
  const loadActiveExams = useCallback(() => {
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
            isActive: student.isActive !== false,
            snapshots: student.snapshots || []
          };
        });

      setActiveExams(exams);
      setWebcamData(monitoringData);
    } catch (error) {
      console.error('Error loading active exams:', error);
    }
  }, []);

  // Refresh data every 5 seconds
  useEffect(() => {
    loadActiveExams();
    const interval = setInterval(loadActiveExams, 5000);
    return () => clearInterval(interval);
  }, [loadActiveExams]); // Added dependency

  const addWarning = useCallback((studentEmail) => {
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

      // Keep only last 50 snapshots to prevent memory issues
      if (monitoringData[studentEmail].snapshots.length > 50) {
        monitoringData[studentEmail].snapshots = monitoringData[studentEmail].snapshots.slice(-50);
      }
      
      localStorage.setItem('webcamMonitoring', JSON.stringify(monitoringData));
      loadActiveExams(); // Refresh data
    }
  }, [loadActiveExams]);

  const endExamMonitoring = useCallback((studentEmail) => {
    const monitoringData = JSON.parse(localStorage.getItem('webcamMonitoring')) || {};
    
    if (monitoringData[studentEmail]) {
      // Mark as inactive instead of deleting immediately
      monitoringData[studentEmail].isActive = false;
      monitoringData[studentEmail].endTime = new Date().toISOString();
      localStorage.setItem('webcamMonitoring', JSON.stringify(monitoringData));
    }
    
    // Clear exam progress
    localStorage.removeItem(`exam_in_progress_${studentEmail}`);
    localStorage.removeItem(`exam_progress_${studentEmail}`);
    localStorage.removeItem(`exam_time_${studentEmail}`);
    localStorage.removeItem(`webcam_interval_${studentEmail}`);
    
    // Remove from active exams after a delay to allow cleanup
    setTimeout(() => {
      const updatedMonitoringData = JSON.parse(localStorage.getItem('webcamMonitoring')) || {};
      if (updatedMonitoringData[studentEmail] && !updatedMonitoringData[studentEmail].isActive) {
        delete updatedMonitoringData[studentEmail];
        localStorage.setItem('webcamMonitoring', JSON.stringify(updatedMonitoringData));
      }
      loadActiveExams();
    }, 5000);
  }, [loadActiveExams]);

  const getStudentSnapshot = useCallback((studentEmail) => {
    return webcamData[studentEmail]?.lastSnapshot || null;
  }, [webcamData]);

  const getStudentMonitoringData = useCallback((studentEmail) => {
    return webcamData[studentEmail] || null;
  }, [webcamData]);

  const clearOldMonitoringData = useCallback(() => {
    try {
      const monitoringData = JSON.parse(localStorage.getItem('webcamMonitoring')) || {};
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      Object.keys(monitoringData).forEach(email => {
        const studentData = monitoringData[email];
        const lastActivity = studentData.lastActivity;
        
        // Remove data older than 24 hours
        if (lastActivity && lastActivity < twentyFourHoursAgo) {
          delete monitoringData[email];
        }
      });
      
      localStorage.setItem('webcamMonitoring', JSON.stringify(monitoringData));
      loadActiveExams();
    } catch (error) {
      console.error('Error clearing old monitoring data:', error);
    }
  }, [loadActiveExams]);

  // Clean up old data every hour
  useEffect(() => {
    clearOldMonitoringData();
    const cleanupInterval = setInterval(clearOldMonitoringData, 60 * 60 * 1000); // 1 hour
    return () => clearInterval(cleanupInterval);
  }, [clearOldMonitoringData]);

  const value = {
    activeExams,
    webcamData,
    addWarning,
    endExamMonitoring,
    getStudentSnapshot,
    getStudentMonitoringData,
    refreshData: loadActiveExams,
    clearOldMonitoringData
  };

  return (
    <WebcamContext.Provider value={value}>
      {children}
    </WebcamContext.Provider>
  );
};