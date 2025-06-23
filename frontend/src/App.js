import './App.css';
import React, { useEffect, useState } from 'react';

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
    <div className="discord-app">
      <nav className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-icon dm">
            <span>💬</span>
          </div>
          <div className="sidebar-divider" />
        </div>
        <div className="server-list">
          {loading ? (
            <div style={{ color: "#fff" }}>Cargando...</div>
          ) : (
            channels.map(channel => (
              <div className="sidebar-icon" key={channel.id} title={channel.name}>
                <span>#{channel.name}</span>
              </div>
            ))
          )}
        </div>
      </nav>
      <main className="main-content">
        <h1 style={{ color: "#fff" }}>Bienvenido a tu clon de Discord</h1>
      </main>
    </div>
  );
}

export default App;
