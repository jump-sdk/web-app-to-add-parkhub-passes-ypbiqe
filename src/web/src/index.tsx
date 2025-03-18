import React from 'react'; // ^18.2.0
import { createRoot } from 'react-dom/client'; // ^18.2.0
import App from './App';
import './assets/styles/index.css';

/**
 * Renders the React application to the DOM
 */
const renderApp = () => {
  // Get the root DOM element
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Failed to find the root element');
    return;
  }
  
  // Create a React root using createRoot for concurrent rendering
  const root = createRoot(rootElement);
  
  // Render the App component with StrictMode in development environment
  if (process.env.NODE_ENV === 'development') {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    root.render(<App />);
  }
};

// Initialize the application
renderApp();

// Enable Hot Module Replacement for development
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./App', renderApp);
}