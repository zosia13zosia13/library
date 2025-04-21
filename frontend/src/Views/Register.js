import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const text = await res.text();
      setMessage(text);
    } catch (err) {
      console.error('Błąd:', err);
      setMessage('Wystąpił błąd');
    }
  };

  return (
    <div className="container">
      <h1>Rejestracja</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Imię"
          value={formData.name}
          onChange={handleChange}
          required
        /><br />
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
        <button type="submit">Zarejestruj</button>
      </form>
      {message && <p>{message}</p>}
      <p>Masz już konto? <Link to="/login">Zaloguj się</Link></p>
    </div>
  );
}

export default Register;
