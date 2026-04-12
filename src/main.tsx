import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ChainReactionGame from './ChainReactionGame';
import './index.css';

const isGameRoute = window.location.pathname === '/game';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isGameRoute ? <ChainReactionGame /> : <App />}
  </React.StrictMode>
);
