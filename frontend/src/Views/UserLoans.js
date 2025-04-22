import React, { useEffect, useState } from 'react';
import '../style.css';

function UserLoans({ userId }) {
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3001/users/${userId}/loans`)
      .then(res => res.json())
      .then(data => setLoans(data));
  }, [userId]);

  console.log('userid', userId)

  return (
    <div className="container">
      <h1>Moje wypożyczenia</h1>
      {loans.length === 0 ? (
        <p>Brak aktywnych wypożyczeń.</p>
      ) : (
        <ul className="loans-list">
          {loans.map((loan) => (
            <li key={loan.id} className="loan-item">
              <strong>{loan.title}</strong> <br />
              Termin oddania: <span>{new Date(loan.dueDate).toLocaleDateString()}</span> <br />
              Filia: <span>{loan.branchName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserLoans;