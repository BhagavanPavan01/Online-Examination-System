export const getQuestions = () => {
  return JSON.parse(localStorage.getItem('questions')) || [];
};

export const saveQuestion = (question) => {
  const questions = getQuestions();
  questions.push({
    ...question,
    id: Date.now().toString()
  });
  localStorage.setItem('questions', JSON.stringify(questions));
};

export const getResults = () => {
  return JSON.parse(localStorage.getItem('results')) || [];
};

export const saveResult = (result) => {
  const results = getResults();
  results.push({
    ...result,
    id: Date.now().toString(),
    submittedAt: new Date().toISOString()
  });
  localStorage.setItem('results', JSON.stringify(results));
};

export const getStudentResults = (studentEmail) => {
  const results = getResults();
  return results.filter(result => result.studentEmail === studentEmail);
};

// Add to storage.js
export const updateQuestion = (questionId, updatedQuestion) => {
  const questions = getQuestions();
  const updatedQuestions = questions.map(q => 
    q.id === questionId ? { ...updatedQuestion, id: questionId } : q
  );
  localStorage.setItem('questions', JSON.stringify(updatedQuestions));
};

export const deleteQuestion = (questionId) => {
  const questions = getQuestions();
  const updatedQuestions = questions.filter(q => q.id !== questionId);
  localStorage.setItem('questions', JSON.stringify(updatedQuestions));
};