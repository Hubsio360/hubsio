
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { DataProvider } from './contexts/data/DataProvider.tsx'

createRoot(document.getElementById("root")!).render(
  <DataProvider>
    <App />
  </DataProvider>
);
