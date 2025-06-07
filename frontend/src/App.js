import React, { createContext, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Register from "./Views/Register";
import Login from "./Views/Login";
import Books from "./Views/Books";
import Branches from "./Views/Branches";
import BranchBooks from "./Views/BranchBooks";
import BookDetails from "./Views/BookDetails";
import SelectBranch from "./Views/SelectBranch";
import UserLoans from "./Views/UserLoans";
import Layout from "./Views/Layout";
import BookReservations from "./Views/BookReservations";
import UserProfile from './Views/UserProfile';
import RoomReservations from "./Views/RoomReservations";
import Info from './Views/Info';
import EventList from './Views/EventList';


export const UserContext = createContext(null);


function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    fetch('http://localhost:3001/me', {
      credentials: 'include'
    })
      .then(res => {
        console.log('STATUS', res.status);
        return res.ok ? res.json() : null;
      })
      .then(data => {
        console.log('ME response:', data);
        if (data) setIsLoggedIn(true);
        localStorage.setItem('userId', data.userId)
        setUserId(data.userId)
      })
      .catch(err => {
        console.error('ME error:', err);
        setIsLoggedIn(false);
      });
  }, []); 

  return (
    <UserContext.Provider value={userId}>
      {isLoggedIn && <Layout />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/books" element={<Books />} />
        <Route path="/branches" element={<Branches />} />
        <Route path="/branches/:id" element={<BranchBooks />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path="/select-branch" element={<SelectBranch />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/info" element={<Info />} />
        <Route
          path="/my-loans"
          element={<UserLoans userId={localStorage.getItem("userId")} />}
        />
        <Route
          path="/my-reservations"
          element={<BookReservations userId={localStorage.getItem("userId")} />}
        />
        <Route path="/account" element={<UserProfile />} />
        <Route path="/room-reservations" element={<RoomReservations />}/>
        
        
      </Routes>
      </UserContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;

