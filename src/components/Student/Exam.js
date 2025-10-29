import React, { useState, useEffect, useCallback, useRef } from 'react';
import Webcam from 'react-webcam';
import { getQuestions, saveResult } from '../../utils/storage';
import { useWebcam } from '../../context/WebcamContext';
import { useNavigate } from 'react-router-dom';

const Exam = ({ user }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [violations, setViolations] = useState(0);
  const webcamRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const navigate = useNavigate();
  const { addWarning, endExamMonitoring } = useWebcam();

  // Initialize monitoring data in localStorage - wrapped with useCallback
  const initializeMonitoringData = useCallback(() => {
    const monitoringData = JSON.parse(localStorage.getItem('webcamMonitoring')) || {};
    monitoringData[user.email] = {
      studentEmail: user.email,
      studentName: user.name,
      rollNumber: user.rollNumber || 'N/A',
      branch: user.branch || 'N/A',
      lastSnapshot: null,
      lastActivity: new Date().toISOString(),
      snapshots: [],
      violations: 0,
      isActive: true,
      startTime: new Date().toISOString()
    };
    localStorage.setItem('webcamMonitoring', JSON.stringify(monitoringData));
  }, [user.email, user.name, user.rollNumber, user.branch]);

  // Cleanup function - wrapped with useCallback
  const cleanupExam = useCallback(() => {
    localStorage.removeItem(`exam_in_progress_${user.email}`);
    localStorage.removeItem(`exam_progress_${user.email}`);
    localStorage.removeItem(`exam_time_${user.email}`);
    
    // Clear webcam interval
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }
    
    // Stop webcam
    if (webcamRef.current && webcamRef.current.stream) {
      webcamRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    // End monitoring
    endExamMonitoring(user.email);
  }, [user.email, endExamMonitoring]);

  // Capture webcam snapshot and save to monitoring system - wrapped with useCallback
  const captureWebcamSnapshot = useCallback(() => {
    if (webcamRef.current && !isSubmitted) {
      try {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          saveWebcamSnapshot(imageSrc);
        }
      } catch (error) {
        console.error('Error capturing webcam snapshot:', error);
      }
    }
  }, [isSubmitted]);

  // Save webcam snapshot to monitoring system
  const saveWebcamSnapshot = useCallback((imageData) => {
    const monitoringData = JSON.parse(localStorage.getItem('webcamMonitoring')) || {};
    
    if (!monitoringData[user.email]) {
      monitoringData[user.email] = {
        studentEmail: user.email,
        studentName: user.name,
        rollNumber: user.rollNumber || 'N/A',
        branch: user.branch || 'N/A',
        lastSnapshot: imageData,
        lastActivity: new Date().toISOString(),
        snapshots: [],
        violations: 0,
        isActive: true,
        startTime: new Date().toISOString()
      };
    }

    monitoringData[user.email].lastSnapshot = imageData;
    monitoringData[user.email].lastActivity = new Date().toISOString();
    
    // Add to snapshots array (keep only last 20 to save space)
    monitoringData[user.email].snapshots.push({
      imageData,
      timestamp: new Date().toISOString(),
      type: 'regular'
    });

    if (monitoringData[user.email].snapshots.length > 20) {
      monitoringData[user.email].snapshots = monitoringData[user.email].snapshots.slice(-20);
    }

    localStorage.setItem('webcamMonitoring', JSON.stringify(monitoringData));
  }, [user.email, user.name, user.rollNumber, user.branch]);

  // Handle full screen change
  const handleFullScreenChange = useCallback(() => {
    // Removed unused fullScreen state
    console.log('Full screen changed:', !!document.fullscreenElement);
  }, []);

  // Handle submit function - wrapped with useCallback
  const handleSubmit = useCallback(() => {
    if (isSubmitted) return;

    let obtainedMarks = 0;
    let totalMarks = 0;

    questions.forEach((question, index) => {
      totalMarks += question.marks;
      if (answers[index] === question.correctAnswer) {
        obtainedMarks += question.marks;
      }
    });

    const score = Math.round((obtainedMarks / totalMarks) * 100);

    const result = {
      studentName: user.name,
      studentEmail: user.email,
      rollNumber: user.rollNumber,
      branch: user.branch,
      score: score,
      totalMarks: totalMarks,
      obtainedMarks: obtainedMarks,
      answers: answers,
      questions: questions,
      submittedAt: new Date().toISOString(),
      duration: 1800 - timeLeft, // Time taken in seconds
      violations: violations
    };

    saveResult(result);
    setIsSubmitted(true);

    // Clean up
    cleanupExam();
    
    setTimeout(() => {
      navigate('/result');
    }, 3000);
  }, [isSubmitted, questions, answers, user, timeLeft, violations, navigate, cleanupExam]);

  // Load exam progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`exam_progress_${user.email}`);
    const savedTime = localStorage.getItem(`exam_time_${user.email}`);
    
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setAnswers(progress.answers || {});
      setCurrentQuestion(progress.currentQuestion || 0);
    }
    
    if (savedTime) {
      setTimeLeft(parseInt(savedTime));
    }

    const loadedQuestions = getQuestions();
    setQuestions(loadedQuestions);
    
    // Mark exam as in progress
    localStorage.setItem(`exam_in_progress_${user.email}`, 'true');
    
    // Initialize monitoring data
    initializeMonitoringData();
  }, [user.email, initializeMonitoringData]);

  // Save progress to localStorage
  useEffect(() => {
    if (questions.length > 0) {
      const progress = {
        answers,
        currentQuestion,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`exam_progress_${user.email}`, JSON.stringify(progress));
    }
  }, [answers, currentQuestion, questions.length, user.email]);

  // Save time to localStorage
  useEffect(() => {
    localStorage.setItem(`exam_time_${user.email}`, timeLeft.toString());
  }, [timeLeft, user.email]);

  // Update last activity timestamp periodically
  useEffect(() => {
    const activityInterval = setInterval(() => {
      const monitoringData = JSON.parse(localStorage.getItem('webcamMonitoring')) || {};
      if (monitoringData[user.email]) {
        monitoringData[user.email].lastActivity = new Date().toISOString();
        localStorage.setItem('webcamMonitoring', JSON.stringify(monitoringData));
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(activityInterval);
  }, [user.email]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted, handleSubmit]);

  // Webcam setup and snapshot capture
  useEffect(() => {
    const enableWebcamAndMonitoring = async () => {
      try {
        // Check if webcam is available
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          console.warn('No webcam found');
          return;
        }

        setWebcamEnabled(true);
        
        // Start capturing snapshots every 5 seconds
        captureIntervalRef.current = setInterval(() => {
          captureWebcamSnapshot();
        }, 5000);

      } catch (error) {
        console.error('Error accessing webcam:', error);
        alert('Webcam access is required for exam monitoring. Please enable camera permissions and refresh the page.');
      }
    };

    if (questions.length > 0 && !isSubmitted) {
      enableWebcamAndMonitoring();
    }

    // Full screen detection
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, [questions.length, isSubmitted, captureWebcamSnapshot, handleFullScreenChange]);

  // Detect tab switching and visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        // Record violation
        const monitoringData = JSON.parse(localStorage.getItem('webcamMonitoring')) || {};
        if (monitoringData[user.email]) {
          monitoringData[user.email].violations += 1;
          monitoringData[user.email].snapshots.push({
            timestamp: new Date().toISOString(),
            type: 'violation',
            violationType: 'tab_switch'
          });
          localStorage.setItem('webcamMonitoring', JSON.stringify(monitoringData));
        }

        setViolations(prev => prev + 1);
        addWarning(user.email);
        
        alert('⚠️ Warning: Switching tabs/windows during exam is not allowed! This incident has been recorded. Continued violations may result in exam termination.');
      }
    };

    const handleBlur = () => {
      if (!isSubmitted) {
        // Record window blur violation
        const monitoringData = JSON.parse(localStorage.getItem('webcamMonitoring')) || {};
        if (monitoringData[user.email]) {
          monitoringData[user.email].violations += 1;
          monitoringData[user.email].snapshots.push({
            timestamp: new Date().toISOString(),
            type: 'violation',
            violationType: 'window_blur'
          });
          localStorage.setItem('webcamMonitoring', JSON.stringify(monitoringData));
        }

        setViolations(prev => prev + 1);
        addWarning(user.email);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isSubmitted, user.email, addWarning]);

  // Auto-submit if too many violations
  useEffect(() => {
    if (violations >= 3 && !isSubmitted) {
      alert('❌ Exam terminated due to multiple violations. Your exam has been automatically submitted.');
      handleSubmit();
    }
  }, [violations, isSubmitted, handleSubmit]);

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setAnswers({
      ...answers,
      [questionIndex]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (questions.length === 0) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-warning">
          <h4>No Questions Available</h4>
          <p>The admin hasn't added any questions yet. Please check back later.</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-success text-center">
          <h4>Exam Submitted Successfully!</h4>
          <p>Your answers have been saved. Redirecting to results...</p>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="container-fluid p-4">
      {/* Webcam Preview */}
      {webcamEnabled && (
        <div className="row mb-3">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-between align-items-center">
                <h6>🎥 Exam Monitoring Active</h6>
                <div>
                  <small className="text-muted">Live monitoring by administrators</small>
                  {violations > 0 && (
                    <span className="badge badge-warning ml-2">
                      Violations: {violations}
                    </span>
                  )}
                </div>
              </div>
              <div className="card-body p-2">
                <div className="d-flex justify-content-center">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    width={200}
                    height={150}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      width: 200,
                      height: 150,
                      facingMode: "user"
                    }}
                    onUserMedia={() => console.log('Webcam active')}
                    onUserMediaError={(error) => console.error('Webcam error:', error)}
                  />
                </div>
                <div className="text-center mt-2">
                  <small className="text-muted">
                    Webcam snapshots are captured every 5 seconds for monitoring
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header d-flex justify-between align-items-center">
          <h4>Online Examination</h4>
          <div className="text-right">
            <div className="fw-bold text-danger h5">
              ⏰ Time Left: {formatTime(timeLeft)}
            </div>
            <div>
              Student: {user.name} ({user.rollNumber}) | Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Progress Bar */}
          <div className="progress mb-3">
            <div 
              className="progress-bar" 
              style={{ width: `${progress}%` }}
            >
              {Math.round(progress)}%
            </div>
          </div>

          {/* Question Card */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="mb-3">
                Q{currentQuestion + 1}: {question.question}
                <span className="badge badge-secondary ml-2">
                  {question.marks} mark{question.marks > 1 ? 's' : ''}
                </span>
              </h5>
              
              <div>
                {question.options.map((option, optionIndex) => (
                  <div 
                    key={optionIndex} 
                    className={`mb-2 p-2 border rounded ${
                      answers[currentQuestion] === optionIndex 
                        ? 'option-selected bg-primary text-white' 
                        : 'bg-light'
                    }`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleAnswerSelect(currentQuestion, optionIndex)}
                  >
                    <label className="form-check-label w-100" style={{ cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        checked={answers[currentQuestion] === optionIndex}
                        onChange={() => handleAnswerSelect(currentQuestion, optionIndex)}
                        className="form-check-input mr-2"
                      />
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="d-flex justify-between">
            <button
              className="btn btn-outline-primary"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              ← Previous
            </button>
            
            {currentQuestion === questions.length - 1 ? (
              <button className="btn btn-success" onClick={handleSubmit}>
                ✅ Submit Exam
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleNext}>
                Next →
              </button>
            )}
          </div>

          {/* Question Navigation Grid */}
          <div className="mt-4">
            <h6>Question Navigation:</h6>
            <div className="d-flex flex-wrap gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  className={`btn btn-sm ${
                    answers[index] !== undefined ? 'btn-success' : 'btn-outline-secondary'
                  } ${currentQuestion === index ? 'border border-primary' : ''}`}
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exam Warning */}
      <div className="alert alert-warning mt-3">
        <strong>⚠️ Important:</strong> This exam is being monitored. 
        <ul className="mb-0 mt-1">
          <li>Do not switch tabs or windows - violations will be recorded</li>
          <li>Webcam must remain active throughout the exam</li>
          <li>3 violations will result in automatic exam termination</li>
          <li>Admin can view live webcam feed and send warnings</li>
        </ul>
      </div>
    </div>
  );
};

export default Exam;