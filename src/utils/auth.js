export const registerUser = (userData) => {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const userExists = users.find(user => user.email === userData.email);
  
  if (userExists) {
    return { success: false, message: 'User already exists' };
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