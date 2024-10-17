import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

//imports del local
import App from './App.jsx'
import './index.css'
import PrimerComponente from './components/MicroPerfil/MicroPerfil.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App/>
  </StrictMode>,
)

