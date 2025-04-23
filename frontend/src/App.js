import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Register from "./Views/Register";
import Login from "./Views//Login";
import Books from "./Views/Books";
import Branches from "./Views/Branches";
import BranchBooks from "./Views/BranchBooks";
import BookDetails from "./Views/BookDetails";
import SelectBranch from "./Views/SelectBranch";
import UserLoans from "./Views/UserLoans";
import Layout from "./Views/Layout";
import MyReservations from "./Views/MyReservations";

function App() {
  return (
    <Router>
      <div className="App">
        <Layout />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/books" element={<Books />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/branches/:id" element={<BranchBooks />} />
          <Route path="/books/:id" element={<BookDetails />} />
          <Route path="/select-branch" element={<SelectBranch />} />
          <Route
            path="/my-loans"
            element={<UserLoans userId={localStorage.getItem("userId")} />}
          />
          <Route
            path="/my-reservations"
            element={<MyReservations userId={localStorage.getItem("userId")} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
