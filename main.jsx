import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/theme-bootstrap.js';
import App from './src/App.jsx';
import UserGate from './src/UserGate.jsx';
import './src/styles.css';
import './src/premium.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserGate>
      <App />
    </UserGate>
  </React.StrictMode>
);
