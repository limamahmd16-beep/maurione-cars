import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/theme-bootstrap.js';
import AppExact from './src/AppExact.jsx';
import FunctionalEnhancer from './src/functional-enhancer.jsx';
import SafeEntry from './src/SafeEntry.jsx';
import './src/styles.css';
import './src/premium.css';
import './src/brand-fix.css';
import './src/exact.css';
import './src/no-messages.css';
import './src/functional-enhancer.css';
import './src/auth-final.css';
import './src/guest-login.css';
import './src/auth-approved.css';
import './src/welcome.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SafeEntry>
      <AppExact />
      <FunctionalEnhancer />
    </SafeEntry>
  </React.StrictMode>
);
