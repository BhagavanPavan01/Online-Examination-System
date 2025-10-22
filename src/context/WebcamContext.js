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
  const [webcamStreams, setWebcamStreams] = useState({});

  const startExamMonitoring = (studentId, studentName, webcamStream) => {
    const examData = {
      studentId,
      studentName,
      startTime: new Date().toISOString(),
      status: 'in-progress',
      warnings: 0
    };

    setActiveExams(prev => {
      const filtered = prev.filter(exam => exam.studentId !== studentId);
      return [...filtered, examData];
    });

    setWebcamStreams(prev => ({
      ...prev,
      [studentId]: webcamStream
    }));

    // Store in localStorage for persistence
    const monitoringData = JSON.parse(localStorage.getItem('activeExams') || '{}');
    monitoringData[studentId] = examData;
    localStorage.setItem('activeExams', JSON.stringify(monitoringData));
  };

  const endExamMonitoring = (studentId) => {
    setActiveExams(prev => prev.filter(exam => exam.studentId !== studentId));
    
    setWebcamStreams(prev => {
      const newStreams = { ...prev };
      delete newStreams[studentId];
      return newStreams;
    });

    // Remove from localStorage
    const monitoringData = JSON.parse(localStorage.getItem('activeExams') || '{}');
    delete monitoringData[studentId];
    localStorage.setItem('activeExams', JSON.stringify(monitoringData));
  };

  const addWarning = (studentId) => {
    setActiveExams(prev => 
      prev.map(exam => 
        exam.studentId === studentId 
          ? { ...exam, warnings: exam.warnings + 1 }
          : exam
      )
    );
  };

  // Load active exams from localStorage on component mount
  useEffect(() => {
    const storedExams = JSON.parse(localStorage.getItem('activeExams') || '{}');
    const activeExamArray = Object.values(storedExams);
    setActiveExams(activeExamArray);
  }, []);

  const value = {
    activeExams,
    webcamStreams,
    startExamMonitoring,
    endExamMonitoring,
    addWarning
  };

  return (
    <WebcamContext.Provider value={value}>
      {children}
    </WebcamContext.Provider>
  );
};