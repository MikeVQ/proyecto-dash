// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Nueva ruta para la página Asesor */}
        <Route path="/asesor" element={<Asesor />} />
      </Routes>
    </Router>
  );
}

export default App;