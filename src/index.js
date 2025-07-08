import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // This imports the global styles
import App from './App'; // This imports your main App component

// Create a root to render your React application into the 'root' element in public/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render your App component. React.StrictMode helps with highlighting potential problems.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);