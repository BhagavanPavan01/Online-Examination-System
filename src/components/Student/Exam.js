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
  const [fullScreen, setFullScreen] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const { startExamMonitoring, endExamMonitoring, addWarning } = useWebcam();

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
  }, [user.email]);

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
      score: score,
      totalMarks: totalMarks,
      obtainedMarks: obtainedMarks,
      answers: answers,
      questions: questions,
      submittedAt: new Date().toISOString(),
      duration: 1800 - timeLeft // Time taken in seconds
    };

    saveResult(result);
    setIsSubmitted(true);

    // Clean up
    localStorage.removeItem(`exam_in_progress_${user.email}`);
    localStorage.removeItem(`exam_progress_${user.email}`);
    localStorage.removeItem(`exam_time_${user.email}`);
    
    // End monitoring
    endExamMonitoring(user.email);

    setTimeout(() => {
      navigate('/result');
    }, 3000);
  }, [isSubmitted, questions, answers, user, timeLeft, navigate, endExamMonitoring]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted, handleSubmit]);

  // Webcam and monitoring setup
  useEffect(() => {
    const enableWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false 
        });
        setWebcamEnabled(true);
        
        // Start monitoring
        startExamMonitoring(user.email, user.name, stream);
      } catch (error) {
        console.error('Error accessing webcam:', error);
        alert('Webcam access is required for exam monitoring. Please enable camera permissions.');
      }
    };

    if (questions.length > 0) {
      enableWebcam();
    }

    // Full screen detection
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [questions.length, user, startExamMonitoring]);

  const handleFullScreenChange = () => {
    setFullScreen(!!document.fullscreenElement);
  };

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

  // Detect tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        addWarning(user.email);
        alert('Warning: Switching tabs during exam is not allowed! This incident has been recorded.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSubmitted, user.email, addWarning]);

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
                <small className="text-muted">Live monitoring by administrators</small>
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
                  />
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
              Student: {user.name} | Question {currentQuestion + 1} of {questions.length}
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
                      answers[currentQuestion] === optionIndex ? 'option-selected' : ''
                    }`}
                  >
                    <label className="form-check-label w-100">
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
        <strong>⚠️ Important:</strong> This exam is being monitored. Do not switch tabs or windows, 
        as this may result in warnings and could invalidate your exam.
      </div>
    </div>
  );
};

export default Exam;