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
// Deprecated CRA entrypoint. Vite uses `src/main.jsx` via `index.html`.
// Keeping this file as a non-JSX stub to avoid accidental bundling.
console.warn('[frontend] Deprecated entry: use main.jsx with Vite');
export {};
