/**
 * Entry point for the React application.
 * 
 * This module initializes and renders the root React component into the DOM.
 * It creates a React root using the modern concurrent rendering API and wraps
 * the main App component in React.StrictMode for additional development checks.
 * 
 * @module index
 * @requires react
 * @requires react-dom/client
 * @requires ./index.css
 * @requires ./App
 * @requires ./reportWebVitals
 * 
 * @description
 * - Creates a root React DOM container using ReactDOM.createRoot()
 * - Renders the App component wrapped in React.StrictMode
 * - Initializes web vitals reporting for performance monitoring
 * 
 * @see {@link https://react.dev/reference/react-dom/client/createRoot|React createRoot Documentation}
 * @see {@link https://bit.ly/CRA-vitals|Web Vitals Documentation}
 */
import React           from 'react';
import ReactDOM        from 'react-dom/client';
import './index.css';
import App             from './App';
import reportWebVitals from './reportWebVitals';
/**
 * The root React DOM element created using ReactDOM.createRoot().
 * This is the entry point for rendering the React application into the DOM.
 * @type {import('react-dom/client').Root}
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
