import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// No StrictMode on purpose: it double-runs effects in dev and would inflate the "API calls" counter.
createRoot(document.getElementById('root')).render(<App />);
