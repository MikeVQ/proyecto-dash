// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Asesor from "./components/Asesor";
import UsuariosAsesor from "./components/UsuariosAsesor"; // <-- Importar tu nuevo componente

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/asesor" element={<Asesor />} />
        <Route path="/usuarios-asesor" element={<UsuarioAsesor />} /> 
        {/* ^^^ Nueva ruta */}
      </Routes>
    </Router>
  );
}

export default App;
