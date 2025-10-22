import React, { useState, useEffect } from 'react';
import { getQuestions } from '../../utils/storage'; // Removed saveQuestion import

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = () => {
    setQuestions(getQuestions());
  };

  const handleEdit = (question) => {
    setEditingQuestion({ ...question });
  };

  const handleSave = () => {
    if (!editingQuestion.question.trim()) {
      alert('Please enter a question');
      return;
    }

    const updatedQuestions = questions.map(q => 
      q.id === editingQuestion.id ? editingQuestion : q
    );
    
    localStorage.setItem('questions', JSON.stringify(updatedQuestions));
    setEditingQuestion(null);
    loadQuestions();
    alert('Question updated successfully!');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = questions.filter(q => q.id !== id);
      localStorage.setItem('questions', JSON.stringify(updatedQuestions));
      loadQuestions();
      alert('Question deleted successfully!');
    }
  };

  const handleCancel = () => {
    setEditingQuestion(null);
  };

  const filteredQuestions = questions.filter(q =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col">
          <h2>Manage Questions</h2>
          <p className="text-muted">Edit or delete existing questions</p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-6 text-right">
          <span className="text-muted">
            Showing {filteredQuestions.length} of {questions.length} questions
          </span>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {filteredQuestions.map((question, index) => (
            <div key={question.id} className="card mb-3">
              <div className="card-body">
                {editingQuestion && editingQuestion.id === question.id ? (
                  <div>
                    <div className="form-group">
                      <label>Question</label>
                      <textarea
                        className="form-control"
                        value={editingQuestion.question}
                        onChange={(e) => setEditingQuestion({
                          ...editingQuestion,
                          question: e.target.value
                        })}
                        rows="3"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Options</label>
                      {editingQuestion.options.map((option, optIndex) => (
                        <div key={optIndex} className="input-group mb-2">
                          <div className="input-group-prepend">
                            <div className="input-group-text">
                              <input
                                type="radio"
                                checked={editingQuestion.correctAnswer === optIndex}
                                onChange={() => setEditingQuestion({
                                  ...editingQuestion,
                                  correctAnswer: optIndex
                                })}
                              />
                            </div>
                          </div>
                          <input
                            type="text"
                            className="form-control"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...editingQuestion.options];
                              newOptions[optIndex] = e.target.value;
                              setEditingQuestion({
                                ...editingQuestion,
                                options: newOptions
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="form-group">
                      <label>Marks</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editingQuestion.marks}
                        onChange={(e) => setEditingQuestion({
                          ...editingQuestion,
                          marks: parseInt(e.target.value)
                        })}
                        min="1"
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button className="btn btn-success" onClick={handleSave}>
                        Save Changes
                      </button>
                      <button className="btn btn-secondary" onClick={handleCancel}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="d-flex justify-between align-items-start mb-3">
                      <h5>Q{index + 1}: {question.question}</h5>
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(question)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(question.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <ul className="mb-2">
                      {question.options.map((opt, optIndex) => (
                        <li key={optIndex} className={optIndex === question.correctAnswer ? 'text-success fw-bold' : ''}>
                          {opt} {optIndex === question.correctAnswer && '✓'}
                        </li>
                      ))}
                    </ul>
                    
                    <div className="d-flex justify-between align-items-center">
                      <small className="text-muted">Marks: {question.marks}</small>
                      <small className="text-muted">
                        ID: {question.id}
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredQuestions.length === 0 && (
            <div className="text-center text-muted py-5">
              <h5>No questions found</h5>
              <p>
                {searchTerm ? 'Try a different search term' : 'Add some questions to get started'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageQuestions;