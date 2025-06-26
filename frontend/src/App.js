import './App.css';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginView from "./views/registerView/registerView";
import RegisterView from "./views/loginView/loginView";
import HomeView from "./views/homeView/homeView";

function App() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cambia este ID por el del servidor que quieras mostrar
  const serverId = "ID_DEL_SERVIDOR"; // <-- PON AQUÍ EL ID REAL

  useEffect(() => {
    fetch(`http://localhost:3000/api/channels?serverId=${serverId}`)
      .then(res => res.json())
      .then(data => {
        setChannels(data.data || []);
        setLoading(false);
      });
  }, [serverId]);

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