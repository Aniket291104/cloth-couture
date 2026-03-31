import axios from 'axios';

(async () => {
  try {
    const res = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@clothcouture.com',
      password: 'password123',
    });
    console.log('Login successful:', res.data);
  } catch (error) {
    console.error('Error during login:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
})();
