import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Views/Register'
import Login from './Views//Login';
import Books from './Views/Books';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/books" element={<Books />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
