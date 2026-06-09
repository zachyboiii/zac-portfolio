import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log(
  '%c' +
  '███████╗ █████╗  ██████╗██╗  ██╗ █████╗ ██████╗ ██╗   ██╗\n' +
  '╚══███╔╝██╔══██╗██╔════╝██║  ██║██╔══██╗██╔══██╗╚██╗ ██╔╝\n' +
  '  ███╔╝ ███████║██║     ███████║███████║██████╔╝  ╚████╔╝ \n' +
  ' ███╔╝  ██╔══██║██║     ██╔══██║██╔══██║██╔══██╗   ╚██╔╝  \n' +
  '███████╗██║  ██║╚██████╗██║  ██║██║  ██║██║  ██║    ██║   \n' +
  '╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝  \n' +
  '\n' +
  '██╗     ███████╗███████╗\n' +
  '██║     ██╔════╝██╔════╝\n' +
  '██║     █████╗  █████╗  \n' +
  '██║     ██╔══╝  ██╔══╝  \n' +
  '███████╗███████╗███████╗\n' +
  '╚══════╝╚══════╝╚══════╝\n',
  'color: #f9f1c1; font-family: monospace; font-size: 10px; line-height: 1.2;'
)
console.log(
  '%c  ZACHARY LEE  ·  SWE & AI  ·  SUTD  2027',
  'color: rgba(236,231,225,0.5); font-family: monospace; font-size: 11px; letter-spacing: 0.15em;'
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
