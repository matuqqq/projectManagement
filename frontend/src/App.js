import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginScreen from "./screens/loginScreen/loginScreen";
import RegisterScreen from "./screens/registerScreen/registerScreen";
import HomeScreen from "./screens/homeScreen/homeScreen";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen/>} />
        <Route path="/home" element={<HomeScreen/>} />
      </Routes>
    </Router>
  );
}

export default App;