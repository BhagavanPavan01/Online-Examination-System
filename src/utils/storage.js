// Update your storage.js file
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
  const currentUser = JSON.parse(localStorage.getItem('currentUser')); // Get current user
  
  const resultWithUserInfo = {
    ...result,
    id: Date.now().toString(),
    submittedAt: new Date().toISOString(),
    // Add user information including roll number and branch
    studentName: currentUser?.name || 'Unknown',
    studentEmail: currentUser?.email || 'unknown@example.com',
    rollNumber: currentUser?.rollNumber || null, // Add roll number
    branch: currentUser?.branch || null // Add branch
  };
  
  results.push(resultWithUserInfo);
  localStorage.setItem('results', JSON.stringify(results));
  return resultWithUserInfo;
};

export const getStudentResults = (studentEmail) => {
  const results = getResults();
  return results.filter(result => result.studentEmail === studentEmail);
};

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

// Add new function to get results by roll number
export const getResultsByRollNumber = (rollNumber) => {
  const results = getResults();
  return results.filter(result => result.rollNumber === rollNumber);
};

// Add function to get all students with their results
export const getAllStudentsWithResults = () => {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const results = getResults();
  
  const students = users.filter(user => user.role === 'student');
  
  return students.map(student => {
    const studentResults = results.filter(result => result.studentEmail === student.email);
    const lastResult = studentResults[studentResults.length - 1];
    const averageScore = studentResults.length > 0 
      ? studentResults.reduce((sum, result) => sum + result.score, 0) / studentResults.length 
      : 0;
    
    return {
      ...student,
      totalExams: studentResults.length,
      averageScore: Math.round(averageScore),
      lastScore: lastResult ? lastResult.score : null,
      lastExamDate: lastResult ? lastResult.submittedAt : null
    };
  });
};