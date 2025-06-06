import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style.css';

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
        credentials: 'include', // ⬅️ KLUCZOWE DLA SESJI
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        // nie zapisujemy już userId, bo sesja to robi za nas
        navigate('/select-branch');
      } else {
        setMessage(data.message || 'Błąd logowania');
      }
    } catch (err) {
      console.error('Błąd:', err);
      setMessage('Wystąpił błąd podczas logowania');
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



