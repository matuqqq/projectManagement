import React from "react";
import "./homeStyle.css";

export default function HomeView() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="container">
      <h1 className="title">Falso Discord</h1>
      <h2 className="subtitle">Home</h2>
      <div>
        <h1>Bienvenido a Home</h1>
        {user && (
          <div>
            <p>Usuario: {user.username}</p>
            <p>Email: {user.email}</p>
          </div>
        )}
      </div>
    </div>
  );
}
