import React, { useState } from "react";
import "./homeStyle.css"; 

export default function HomeView() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  
  const handleSearchChange = (e) => {
    setSearchId(e.target.value);
    setSearchResult(null);
    setError('');
  };

  
  const handleSearchSubmit = async (e) => {
    e.preventDefault(); 

    if (!searchId.trim()) {
      setError('Please enter a user or server ID.');
      setSearchResult(null);
      return;
    }

    setError(''); 
    setSearchResult(null); 
    setIsLoading(true); 

    try {
      const response = await fetch(`http://localhost:3000/api/search/${searchId}`);

      if (!response.ok) {
        
        const errorData = await response.json(); 
        throw new Error(errorData.message || 'Item not found or server error.');
      }

      const data = await response.json();
      
      setSearchResult(data); 
      console.log("Search Result:", data); 
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || 'An unexpected error occurred during search.');
    } finally {
      setIsLoading(false); 
    }
  };

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


      <div className="search-section"> 
        <h3>Search User or Server by ID</h3>
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Enter User or Server ID"
            value={searchId}
            onChange={handleSearchChange}
            className="search-input" 
          />
          <button
            type="submit"
            className="search-button"
            disabled={isLoading} 
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

        
        {error && <p className="error-message">{error}</p>}
        {isLoading && <p>Cargando...</p>}

        {searchResult && !error && ( 
          <div className="search-results"> 
            <h4>Resultadp:</h4>
            <p>Type: <strong>{searchResult.type === 'user' ? 'User' : 'Server'}</strong></p>
            <p>Name: <strong>{searchResult.name}</strong></p>
            
          </div>
        )}
      </div>      
    </div>
  );
}