import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginView from "./views/registerView/registerView";
import RegisterView from "./views/loginView/loginView";
import HomeView from "./views/homeView/homeView";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginView />} />
        <Route path="/register" element={<RegisterView/>} />
        <Route path="/home" element={<HomeView/>} />
      </Routes>
    </Router>
  );
}

export default App;