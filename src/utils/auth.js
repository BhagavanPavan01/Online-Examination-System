export const registerUser = (userData) => {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const userExists = users.find(user => user.email === userData.email);
  
  if (userExists) {
    return { success: false, message: 'User already exists with this email' };
  }
  
  // Check for duplicate roll number for students
  if (userData.role === 'student' && userData.rollNumber) {
    const rollNumberExists = users.find(user => 
      user.rollNumber && user.rollNumber.toUpperCase() === userData.rollNumber.toUpperCase()
    );
    if (rollNumberExists) {
      return { success: false, message: 'Roll number already exists' };
    }
  }
  
  users.push(userData);
  localStorage.setItem('users', JSON.stringify(users));
  return { success: true };
};

export const loginUser = (email, password) => {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true, user };
  }
  
  return { success: false, message: 'Invalid credentials' };
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('currentUser'));
};

export const isAdmin = (user) => {
  return user && user.role === 'admin';
};

export const getStudentsByBranch = (branch) => {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  return users.filter(user => user.role === 'student' && user.branch === branch);
};

export const getBranches = () => {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const branches = [...new Set(users.filter(u => u.role === 'student').map(u => u.branch))];
  return branches.filter(branch => branch);
};

export const validateRollNumberFormat = (rollNumber, branch) => {
  if (!rollNumber || !branch) return false;
  const expectedPrefix = branch.toUpperCase();
  return rollNumber.toUpperCase().startsWith(expectedPrefix);
};

export const generateRollNumber = (branch) => {
  const students = getStudentsByBranch(branch);
  const nextNumber = students.length + 1;
  return `${branch.toUpperCase()}${nextNumber.toString().padStart(3, '0')}`;
};