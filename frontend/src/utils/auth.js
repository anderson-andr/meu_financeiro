export const saveToken = (token) => {
  sessionStorage.setItem('token', token);
  localStorage.setItem('token', token);
};

export const getToken = () => {
  return sessionStorage.getItem('token') || localStorage.getItem('token');
};

export const removeToken = () => {
  sessionStorage.removeItem('token');
  localStorage.removeItem('token');
};
