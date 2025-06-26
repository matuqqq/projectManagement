import './App.css';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterView from "./views/registerView/registerView";
import LoginView from "./views/loginView/loginView";
import HomeView from "./views/homeView/homeView";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />
        <Route path="/home" element={<HomeView />} />
      </Routes>
    </Router>
  );
}

export default App;