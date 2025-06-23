import React from "react";
import DirectMessages from "./DirectMessages";
import "./App.css";

function App() {
  // Usa IDs reales de usuarios de tu base de datos
  const senderId = "afe7d8dc-d900-4186-ba40-f34873448f5f";
  const receiverId = "e0abc94d-9227-4f2a-a0ad-4b09e51754f2";

  return (
    <div className="App">
      <header className="App-header">
        <h1>Discord Clon</h1>
        <DirectMessages senderId={senderId} receiverId={receiverId} />
      </header>
    </div>
  );
}

export default App;