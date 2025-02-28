// src/components/Asesor.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Asesor.css"; // <-- Importa tu hoja de estilos

const Asesor = () => {
  // Estados para manejar asesores y formulario
  const [asesores, setAsesores] = useState([]);
  const [nombreAsesor, setNombreAsesor] = useState("");
  const [emailAsesor, setEmailAsesor] = useState("");

  // Estados para manejar la carga y mensajes
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Efecto para listar asesores al montar el componente
  useEffect(() => {
    fetchAsesores();
  }, []);

  /**
   * Obtiene la lista de asesores desde /api/asesores
   */
  const fetchAsesores = async () => {
    try {
      const res = await axios.get("/api/asesores");
      setAsesores(res.data);
    } catch (error) {
      console.error("Error al obtener asesores:", error);
      setMessage("Ocurrió un error al obtener la lista de asesores.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crea un nuevo asesor enviando un POST a /api/asesores
   */
  const handleCreateAsesor = async () => {
    // Validación básica
    if (!nombreAsesor.trim() || !emailAsesor.trim()) {
      setMessage("Todos los campos son obligatorios.");
      return;
    }

    try {
      await axios.post("/api/asesores", {
        nombre_asesor: nombreAsesor,
        email_asesor: emailAsesor,
      });
      setMessage("Asesor creado con éxito.");

      // Limpiamos los campos
      setNombreAsesor("");
      setEmailAsesor("");

      // Refrescamos la lista
      fetchAsesores();
    } catch (error) {
      console.error("Error al crear asesor:", error);
      setMessage("Ocurrió un error al crear el asesor.");
    }
  };

  // Mostrar un mensaje de carga inicial
  if (loading) {
    return <p className="asesor-loading">Cargando...</p>;
  }

  return (
    <div className="asesor-container">
      <h2 className="asesor-title">Gestión de Asesores</h2>

      {/* Mensajes de error o confirmación */}
      {message && <p className="asesor-message">{message}</p>}

      {/* Formulario para agregar un asesor */}
      <div className="asesor-form">
        <div className="asesor-field">
          <label>Nombre del Asesor:</label>
          <input
            type="text"
            value={nombreAsesor}
            onChange={(e) => setNombreAsesor(e.target.value)}
          />
        </div>

        <div className="asesor-field">
          <label>Email del Asesor:</label>
          <input
            type="email"
            value={emailAsesor}
            onChange={(e) => setEmailAsesor(e.target.value)}
          />
        </div>

        <button onClick={handleCreateAsesor} className="asesor-button">
          Agregar Asesor
        </button>
      </div>

      {/* Tabla de asesores */}
      <table className="asesor-table">
        <thead>
          <tr>
            <th>Nombre Asesor</th>
            <th>Email Asesor</th>
          </tr>
        </thead>
        <tbody>
          {asesores.length === 0 ? (
            <tr>
              <td colSpan="2" className="asesor-no-data">
                No hay asesores registrados.
              </td>
            </tr>
          ) : (
            asesores.map((asesor) => (
              <tr key={asesor._id}>
                <td>{asesor.nombre_asesor}</td>
                <td>{asesor.email_asesor}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Asesor;
