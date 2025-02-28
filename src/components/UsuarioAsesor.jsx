// UsuariosAsesor.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./UsuarioAsesor.css"; // <-- Importa tu hoja de estilos

const UsuariosAsesor = () => {
  const [asesores, setAsesores] = useState([]);
  const [selectedAsesorId, setSelectedAsesorId] = useState("");
  const [usuarios, setUsuarios] = useState([]);

  // Campos para crear usuario
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [emailUsuario, setEmailUsuario] = useState("");
  const [pais, setPais] = useState("");
  const [tipoNegocio, setTipoNegocio] = useState("");
  const [message, setMessage] = useState("");

  // 1. Cargar asesores al montar
  useEffect(() => {
    axios.get("/api/asesores")
      .then(res => setAsesores(res.data))
      .catch(err => console.error("Error:", err));
  }, []);

  // 2. Listar usuarios de un asesor
  const handleListarUsuarios = () => {
    if (!selectedAsesorId) return;
    axios.get(`/api/usuariosAsesor?asesorId=${selectedAsesorId}`)
      .then(res => setUsuarios(res.data))
      .catch(err => console.error("Error:", err));
  };

  // 3. Crear usuario
  const handleCrearUsuario = () => {
    if (!selectedAsesorId) {
      setMessage("Selecciona un asesor primero.");
      return;
    }
    axios.post("/api/usuariosAsesor", {
      asesorId: selectedAsesorId,
      nombre_usuario: nombreUsuario,
      email_usuario: emailUsuario,
      pais_origen: pais,
      bussines_type: tipoNegocio
    })
      .then(() => {
        setMessage("Usuario creado con éxito.");
        setNombreUsuario("");
        setEmailUsuario("");
        setPais("");
        setTipoNegocio("");
        handleListarUsuarios(); // Refresca la tabla
      })
      .catch(err => {
        console.error("Error al crear usuario:", err);
        setMessage("Ocurrió un error al crear el usuario.");
      });
  };

  // 4. Carga masiva desde Excel (opcional)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedAsesorId) {
      setMessage("Selecciona un asesor antes de subir Excel.");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      // Opción A: Hacer un POST por cada fila
      for (const row of rows) {
        await axios.post("/api/usuariosAsesor", {
          asesorId: selectedAsesorId,
          nombre_usuario: row.nombre_usuario,
          email_usuario: row.email_usuario,
          pais_origen: row.pais_origen,
          bussines_type: row.bussines_type
        });
      }

      setMessage("Usuarios cargados exitosamente desde Excel.");
      handleListarUsuarios();
    } catch (error) {
      console.error("Error leyendo archivo Excel:", error);
      setMessage("Error al procesar el archivo Excel.");
    }
  };

  return (
    <div className="usuarios-asesor-container">
      <h2 className="usuarios-asesor-title">Asignar Usuarios a Asesor</h2>
      {message && <p className="usuarios-asesor-message">{message}</p>}

      {/* Seleccionar asesor */}
      <div className="usuarios-asesor-select-row">
        <select
          className="usuarios-asesor-select"
          value={selectedAsesorId}
          onChange={(e) => setSelectedAsesorId(e.target.value)}
        >
          <option value="">Selecciona un asesor</option>
          {asesores.map(asesor => (
            <option key={asesor._id} value={asesor._id}>
              {asesor.nombre_asesor}
            </option>
          ))}
        </select>

        <button
          className="usuarios-asesor-button"
          onClick={handleListarUsuarios}
        >
          Listar Usuarios
        </button>
      </div>

      {/* Formulario para crear usuario */}
      <div className="usuarios-asesor-form">
        <input
          className="usuarios-asesor-input"
          type="text"
          placeholder="Nombre Usuario"
          value={nombreUsuario}
          onChange={(e) => setNombreUsuario(e.target.value)}
        />
        <input
          className="usuarios-asesor-input"
          type="email"
          placeholder="Email Usuario"
          value={emailUsuario}
          onChange={(e) => setEmailUsuario(e.target.value)}
        />
        <input
          className="usuarios-asesor-input"
          type="text"
          placeholder="País"
          value={pais}
          onChange={(e) => setPais(e.target.value)}
        />
        <input
          className="usuarios-asesor-input"
          type="text"
          placeholder="Tipo de Negocio"
          value={tipoNegocio}
          onChange={(e) => setTipoNegocio(e.target.value)}
        />
        <button
          className="usuarios-asesor-button"
          onClick={handleCrearUsuario}
        >
          Crear Usuario
        </button>
      </div>

      {/* Carga masiva por Excel */}
      <div className="usuarios-asesor-mass-upload">
        <h3>Carga Masiva</h3>
        <input
          className="usuarios-asesor-file"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
        />
      </div>

      {/* Tabla de usuarios */}
      <table className="usuarios-asesor-table">
        <thead>
          <tr>
            <th>Nombre Usuario</th>
            <th>Email</th>
            <th>País</th>
            <th>Tipo de Negocio</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u._id}>
              <td>{u.nombre_usuario}</td>
              <td>{u.email_usuario}</td>
              <td>{u.pais_origen}</td>
              <td>{u.bussines_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsuariosAsesor;
