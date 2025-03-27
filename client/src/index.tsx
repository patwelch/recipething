// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // Your main App component
import './output.css'; // Your main CSS file with Tailwind directives
import { Provider } from 'react-redux';
import { store } from './store/store.ts'; // Import the configured store
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}> {/* Wrap with Redux Provider */}
      <BrowserRouter> {/* Wrap with BrowserRouter */}
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);