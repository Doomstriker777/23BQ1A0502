import { useEffect } from 'react';
import { Log } from '../logging_middleware/logger';
import './App.css';

function App() {
  
  useEffect(() => {
    // Trigger a test log when the app starts
    Log("frontend", "info", "page", "React application successfully initialized.");
  }, []);

  return (
    <div>
      <h1>Affordmed Frontend Application</h1>
      <p>Check your browser console to see if the log was successful!</p>
    </div>
  )
}

export default App;
