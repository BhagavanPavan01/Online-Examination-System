import React, { useState } from 'react';
import { saveQuestion, getQuestions } from '../../utils/storage';
import { useNavigate } from 'react-router-dom';

const AddQuestion = () => {
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    marks: 1
  });
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions
    });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, '']
    });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      alert('Question must have at least 2 options');
      return;
    }
    
    const newOptions = formData.options.filter((_, i) => i !== index);
    let newCorrectAnswer = formData.correctAnswer;
    
    if (index === formData.correctAnswer) {
      newCorrectAnswer = 0;
    } else if (index < formData.correctAnswer) {
      newCorrectAnswer = formData.correctAnswer - 1;
    }
    
    setFormData({
      ...formData,
      options: newOptions,
      correctAnswer: newCorrectAnswer
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.question.trim()) {
      alert('Please enter a question');
      return;
    }
    
    const filledOptions = formData.options.filter(opt => opt.trim() !== '');
    if (filledOptions.length < 2) {
      alert('Please fill at least 2 options');
      return;
    }

    // Remove empty options
    const validOptions = formData.options.filter(opt => opt.trim() !== '');
    let validCorrectAnswer = formData.correctAnswer;
    
    // Adjust correct answer if options were removed
    if (formData.correctAnswer >= validOptions.length) {
      validCorrectAnswer = 0;
    }

    const questionToSave = {
      ...formData,
      options: validOptions,
      correctAnswer: validCorrectAnswer
    };

    saveQuestion(questionToSave);
    setSuccess('Question added successfully!');
    
    // Reset form but keep options structure
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1
    });

    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddMultiple = () => {
    navigate('/admin/add-bulk-questions');
  };

  return (
    <div className="container-fluid p-4">
      <div className="row justify-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-between align-items-center">
              <h3>Add New Question</h3>
              <button className="btn btn-outline-primary" onClick={handleAddMultiple}>
                Add Multiple Questions
              </button>
            </div>
            <div className="card-body">
              {success && <div className="alert alert-success">{success}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Question Text</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    placeholder="Enter your question here..."
                    required
                  />
                </div>

                <div className="form-group">
                  <div className="d-flex justify-between align-items-center mb-2">
                    <label>Options</label>
                    <button type="button" className="btn btn-sm btn-outline-success" onClick={addOption}>
                      + Add Option
                    </button>
                  </div>
                  {formData.options.map((option, index) => (
                    <div key={index} className="input-group mb-2">
                      <div className="input-group-prepend">
                        <div className="input-group-text">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={formData.correctAnswer === index}
                            onChange={() => setFormData({...formData, correctAnswer: index})}
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <div className="input-group-append">
                        <button 
                          type="button" 
                          className="btn btn-outline-danger"
                          onClick={() => removeOption(index)}
                          disabled={formData.options.length <= 2}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label>Marks</label>
                  <input
                    type="number"
                    className="form-control"
                    name="marks"
                    value={formData.marks}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    required
                  />
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">
                    Add Question
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Existing Questions Preview */}
          <div className="card mt-4">
            <div className="card-header d-flex justify-between align-items-center">
              <h4>Existing Questions ({getQuestions().length})</h4>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={() => navigate('/admin/questions')}
              >
                Manage Questions
              </button>
            </div>
            <div className="card-body">
              {getQuestions().slice(-5).reverse().map((q, index) => (
                <div key={q.id} className="border p-3 mb-3 rounded">
                  <h6>Q{getQuestions().length - index}: {q.question}</h6>
                  <ul className="mb-2">
                    {q.options.map((opt, optIndex) => (
                      <li key={optIndex} className={optIndex === q.correctAnswer ? 'text-success fw-bold' : ''}>
                        {opt} {optIndex === q.correctAnswer && '✓'}
                      </li>
                    ))}
                  </ul>
                  <div className="d-flex justify-between align-items-center">
                    <small className="text-muted">Marks: {q.marks}</small>
                    <small className="text-muted">
                      Added: {new Date(parseInt(q.id)).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))}
              {getQuestions().length === 0 && (
                <div className="text-center text-muted py-4">
                  <h5>No Questions Added Yet</h5>
                  <p>Start by adding your first question above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestion;