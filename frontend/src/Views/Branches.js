import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Branches() {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/branches')
      .then(res => res.json())
      .then(data => setBranches(data));
  }, []);

  return (
    <div className="container">
      <h1>Wybierz filię</h1>
      <ul>
        {branches.map(branch => (
          <li key={branch.id}>
            <Link to={`/branches/${branch.id}`}>{branch.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Branches;
