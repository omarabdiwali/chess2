import { SnackbarProvider } from 'notistack';
import React from 'react';
import HomePage from './components/Home';

function App() {
  return (
    <SnackbarProvider preventDuplicate>
      <div>
        <HomePage />
      </div>
    </SnackbarProvider>
  );
}

export default App;
