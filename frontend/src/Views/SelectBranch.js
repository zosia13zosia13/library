import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SelectBranch() {
  const [branches, setBranches] = useState([]);
  const [selected, setSelected] = useState('');
  const navigate = useNavigate();

  // 🔹 Pobierz listę filii z backendu po załadowaniu komponentu
  useEffect(() => {
    fetch('http://localhost:3001/branches')
      .then(res => res.json())
      .then(data => setBranches(data));
  }, []);

  // 🔹 Po zatwierdzeniu zapisz do localStorage i przejdź do widoku książek
// plik: SelectBranch.js
const handleSubmit = (e) => {
  e.preventDefault();
  if (selected) {
    const selectedBranch = branches.find(branch => branch.id === parseInt(selected));
    localStorage.setItem("selectedBranch", JSON.stringify(selectedBranch)); // ZAPISZ filię
    navigate(`/branches/${selected}`);
  }
};

  return (
    <div className="container">
      <h1>Wybierz filię</h1>
      <form onSubmit={handleSubmit}>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          required
        >
          <option value="">-- Wybierz filię --</option>
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        <button type="submit" disabled={!selected}>Przejdź do książek</button>
      </form>
    </div>
  );
}

export default SelectBranch;

