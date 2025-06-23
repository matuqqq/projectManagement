import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/api/direct-messages";
const USERS_URL = "http://localhost:3000/api/user";

export default function DirectMessages({ senderId, receiverId }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [senderName, setSenderName] = useState("");
  const [receiverName, setReceiverName] = useState("");

  // Obtener nombres de usuarios
  useEffect(() => {
    if (senderId) {
      fetch(`${USERS_URL}/${senderId}`)
        .then(res => res.json())
        .then(user => setSenderName(user.username || "Desconocido"))
        .catch(() => setSenderName("Desconocido"));
    }
    if (receiverId) {
      fetch(`${USERS_URL}/${receiverId}`)
        .then(res => res.json())
        .then(user => setReceiverName(user.username || "Desconocido"))
        .catch(() => setReceiverName("Desconocido"));
    }
  }, [senderId, receiverId]);

  // Obtener mensajes entre dos usuarios
  useEffect(() => {
    if (senderId && receiverId) {
      fetch(`${API_URL}/${senderId}/${receiverId}`)
        .then(res => res.json())
        .then(setMessages)
        .catch(() => setError("Error al cargar mensajes"));
    }
  }, [senderId, receiverId]);

  // Enviar mensaje
  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    if (!content.trim()) {
      setError("El mensaje no puede estar vacío");
      return;
    }
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId, receiverId, content })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al enviar mensaje");
        return;
      }
      setContent("");
      // Recargar mensajes
      const updated = await fetch(`${API_URL}/${senderId}/${receiverId}`).then(r => r.json());
      setMessages(updated);
    } catch {
      setError("Error al enviar mensaje");
    }
  };

  return (
    <div>
      <h2>Mensajes Privados</h2>
      <div>
        <b>Emisor:</b> {senderName} <br />
        <b>Receptor:</b> {receiverName}
      </div>
      <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #ccc", marginBottom: 10, marginTop: 10 }}>
        {messages.length === 0 && <div>No hay mensajes.</div>}
        {messages.map(msg => (
          <div key={msg.id}>
            <b>{msg.senderId === senderId ? senderName : receiverName}:</b> {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend}>
        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Escribe un mensaje"
        />
        <button type="submit">Enviar</button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}