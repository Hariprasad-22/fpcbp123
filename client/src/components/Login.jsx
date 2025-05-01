// After successful login
const handleLogin = async (credentials) => {
  try {
    const response = await axios.post('/api/auth/login', credentials);
    if (response.data.token) {
      // Store token with Bearer prefix for easier use in axios interceptors
      localStorage.setItem('authToken', `Bearer ${response.data.token}`);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Set Authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Navigate to appropriate dashboard
      navigate(response.data.user.role === 'admin' ? '/admin' : '/dashboard');
    }
  } catch (error) {
    console.error('Login failed:', error);
    // Show error message
  }
};
