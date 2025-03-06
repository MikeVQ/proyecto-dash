// src/components/Asesor.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Asesor.css"; // Importa tu hoja de estilos

const Asesor = () => {
  // Estados para manejar la lista, formulario y edición
  const [asesores, setAsesores] = useState([]);
  const [nombreAsesor, setNombreAsesor] = useState("");
  const [emailAsesor, setEmailAsesor] = useState("");
  const [editingAsesor, setEditingAsesor] = useState(null);

  // Estados para carga, mensajes y selección múltiple
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedAsesores, setSelectedAsesores] = useState([]);

  useEffect(() => {
    fetchAsesores();
  }, []);

  /**
   * Obtiene la lista de asesores desde el backend
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
   * Crea o actualiza un asesor según el modo actual (creación o edición)
   */
  const handleCreateOrUpdateAsesor = async () => {
    if (!nombreAsesor.trim() || !emailAsesor.trim()) {
      setMessage("Todos los campos son obligatorios.");
      return;
    }
    if (editingAsesor) {
      // Modo edición: actualizar asesor
      try {
        await axios.put("/api/asesores", {
          _id: editingAsesor._id,
          nombre_asesor: nombreAsesor,
          email_asesor: emailAsesor,
        });
        setMessage("Asesor actualizado con éxito.");
        setEditingAsesor(null);
      } catch (error) {
        console.error("Error al actualizar asesor:", error);
        setMessage("Ocurrió un error al actualizar el asesor.");
      }
    } else {
      // Modo creación: insertar nuevo asesor
      try {
        await axios.post("/api/asesores", {
          nombre_asesor: nombreAsesor,
          email_asesor: emailAsesor,
        });
        setMessage("Asesor creado con éxito.");
      } catch (error) {
        console.error("Error al crear asesor:", error);
        setMessage("Ocurrió un error al crear el asesor.");
      }
    }
    // Limpiar campos y refrescar lista
    setNombreAsesor("");
    setEmailAsesor("");
    fetchAsesores();
  };

  /**
   * Llena el formulario con los datos del asesor para editar
   */
  const handleEdit = (asesor) => {
    setEditingAsesor(asesor);
    setNombreAsesor(asesor.nombre_asesor);
    setEmailAsesor(asesor.email_asesor);
  };

  /**
   * Elimina un asesor individual
   */
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/asesores?_id=${id}`);
      setMessage("Asesor eliminado correctamente.");
      fetchAsesores();
    } catch (error) {
      console.error("Error al eliminar asesor:", error);
      setMessage("Ocurrió un error al eliminar el asesor.");
    }
  };

  /**
   * Maneja la selección individual de asesores para eliminación en lote
   */
  const handleCheckboxChange = (id) => {
    setSelectedAsesores((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((ase => ase !== id));
      } else {
        return [...prevSelected, id];
      }
    });
  };

  /**
   * Selecciona o deselecciona todos los asesores
   */
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = asesores.map((ase) => ase._id);
      setSelectedAsesores(allIds);
    } else {
      setSelectedAsesores([]);
    }
  };

  /**
   * Elimina todos los asesores seleccionados
   */
  const handleDeleteSelected = async () => {
    if (selectedAsesores.length === 0) {
      setMessage("No se ha seleccionado ningún asesor para eliminar.");
      return;
    }
    try {
      // Se elimina uno por uno (o se podría implementar un endpoint batch)
      await Promise.all(
        selectedAsesores.map((id) => axios.delete(`/api/asesores?_id=${id}`))
      );
      setMessage("Asesores eliminados correctamente.");
      setSelectedAsesores([]);
      fetchAsesores();
    } catch (error) {
      console.error("Error al eliminar asesores seleccionados:", error);
      setMessage("Ocurrió un error al eliminar los asesores seleccionados.");
    }
  };

  /**
   * Función para regresar a la página anterior
   */
  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return <p className="asesor-loading">Cargando...</p>;
  }

  return (
    <div className="asesor-container">
      {/* Encabezado con botón de regresar */}
      <div className="header">
        <button onClick={handleBack} className="asesor-button back-button">
          Regresar
        </button>
        <h2 className="asesor-title">Gestión de Asesores</h2>
      </div>

      {/* Mensajes de error o confirmación */}
      {message && <p className="asesor-message">{message}</p>}

      {/* Formulario para crear o actualizar asesor */}
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
        <button onClick={handleCreateOrUpdateAsesor} className="asesor-button">
          {editingAsesor ? "Actualizar Asesor" : "Agregar Asesor"}
        </button>
      </div>

      {/* Botón para eliminar asesores seleccionados */}
      <div className="asesor-actions">
        <button onClick={handleDeleteSelected} className="asesor-button delete-selected">
          Eliminar Seleccionados
        </button>
      </div>

      {/* Tabla de asesores */}
      <table className="asesor-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedAsesores.length === asesores.length && asesores.length > 0}
              />
            </th>
            <th>Nombre Asesor</th>
            <th>Email Asesor</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {asesores.length === 0 ? (
            <tr>
              <td colSpan="4" className="asesor-no-data">
                No hay asesores registrados.
              </td>
            </tr>
          ) : (
            asesores.map((asesor) => (
              <tr key={asesor._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedAsesores.includes(asesor._id)}
                    onChange={() => handleCheckboxChange(asesor._id)}
                  />
                </td>
                <td>{asesor.nombre_asesor}</td>
                <td>{asesor.email_asesor}</td>
                <td>
                  <button onClick={() => handleEdit(asesor)} className="asesor-button edit-button">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(asesor._id)} className="asesor-button delete-button">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Asesor;
