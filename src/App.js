// src/App.js
import React from 'react';
import FlightSearch from './FlightSearch';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* Diğer içerikler */}
        <FlightSearch />
      </header>
    </div>
  );
}

export default App;
