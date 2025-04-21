import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style.css';
import { useNavigate } from 'react-router-dom';


function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        navigate('/books');
      }      

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      console.error('Błąd:', err);
      setMessage('Wystąpił błąd');
    }
  };

  return (
    <div className="container">
      <h1>Logowanie</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        /><br />
        <input
          type="password"
          name="password"
          placeholder="Hasło"
          value={formData.password}
          onChange={handleChange}
          required
        /><br />
        <button type="submit">Zaloguj się</button>
      </form>
      {message && <p>{message}</p>}
      <p>Nie masz konta? <Link to="/register">Zarejestruj się</Link></p>
    </div>
  );
}

export default Login;

