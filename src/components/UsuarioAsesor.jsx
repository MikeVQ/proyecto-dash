// UsuariosAsesor.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./UsuarioAsesor.css"; // Importa tu hoja de estilos

const UsuariosAsesor = () => {
  const [asesores, setAsesores] = useState([]);
  const [selectedAsesor, setSelectedAsesor] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  
  // Estados para el histórico
  const [historico, setHistorico] = useState([]);
  const [historicoVisible, setHistoricoVisible] = useState(false);
  
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
    if (!selectedAsesor) return;
    axios.get(`/api/usuariosAsesor?nombre_asesor=${encodeURIComponent(selectedAsesor)}`)
      .then(res => {
        setUsuarios(res.data);
        setHistoricoVisible(false); // Oculta el histórico si se listan usuarios actuales
      })
      .catch(err => console.error("Error:", err));
  };

  // 3. Crear usuario
  const handleCrearUsuario = () => {
    if (!selectedAsesor) {
      setMessage("Selecciona un asesor primero.");
      return;
    }
    axios.post("/api/usuariosAsesor", {
      nombre_asesor: selectedAsesor,
      nombre_usuario: nombreUsuario,
      email_usuario: emailUsuario,
      pais: pais,
      tipo_negocio: tipoNegocio
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

  // 4. Carga masiva desde Excel
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedAsesor) {
      setMessage("Selecciona un asesor antes de subir Excel.");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      // Opción: Hacer un POST por cada fila
      for (const row of rows) {
        await axios.post("/api/usuariosAsesor", {
          nombre_asesor: selectedAsesor,
          nombre_usuario: row.nombre_usuario,
          email_usuario: row.email_usuario,
          pais: row.pais,
          tipo_negocio: row.tipo_negocio
        });
      }

      setMessage("Usuarios cargados exitosamente desde Excel.");
      handleListarUsuarios();
    } catch (error) {
      console.error("Error leyendo archivo Excel:", error);
      setMessage("Error al procesar el archivo Excel.");
    }
  };

  // 5. Descargar formato para carga masiva
  const handleDescargarFormato = () => {
    const headers = ['nombre_usuario', 'email_usuario', 'pais', 'tipo_negocio'];
    // Se crea una hoja con solo la fila de encabezados
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Formato");
    XLSX.writeFile(wb, "formatoUsuarios.xlsx");
  };

  // 6. Obtener histórico de usuarios
  const handleHistoricoUsuarios = () => {
    if (!selectedAsesor) {
      setMessage("Selecciona un asesor primero.");
      return;
    }
    // Se asume que existe un endpoint para obtener el histórico
    axios.get(`/api/historicoUsuarios?nombre_asesor=${encodeURIComponent(selectedAsesor)}`)
      .then(res => {
        setHistorico(res.data);
        setHistoricoVisible(true);
      })
      .catch(err => {
        console.error("Error al obtener histórico:", err);
        setMessage("Ocurrió un error al obtener el histórico.");
      });
  };

  return (
    <div className="usuarios-asesor-container">
      <h2 className="usuarios-asesor-title">Asignar Usuarios a Asesor</h2>
      {message && <p className="usuarios-asesor-message">{message}</p>}

      {/* Seleccionar asesor */}
      <div className="usuarios-asesor-select-row">
        <select
          className="usuarios-asesor-select"
          value={selectedAsesor}
          onChange={(e) => setSelectedAsesor(e.target.value)}
        >
          <option value="">Selecciona un asesor</option>
          {asesores.map(asesor => (
            <option key={asesor._id} value={asesor.nombre_asesor}>
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
        <button
          className="usuarios-asesor-button"
          onClick={handleHistoricoUsuarios}
        >
          Histórico de Usuarios
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
      <button
        className="usuarios-asesor-button"
        onClick={handleDescargarFormato}
      >
        Descargar Formato
      </button>
      <label className="usuarios-asesor-button file-label">
        Elegir Archivo
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </label>
      </div>

      {/* Tabla de usuarios o histórico según corresponda */}
      {!historicoVisible && (
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
                <td>{u.pais}</td>
                <td>{u.tipo_negocio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

{historicoVisible && (
  <div>
    <h3>Histórico de Usuarios</h3>
    <table className="usuarios-asesor-table">
      <thead>
        <tr>
          <th>Nombre Usuario</th>
          <th>Email Usuario</th>
          <th>Producto</th>
          <th>Fecha</th>
          <th>Url</th>
          <th>pdf</th>
        </tr>
      </thead>
      <tbody>
        {historico.map((item) => (
          <tr key={item._id}>
            <td>{item.nombre_usuario}</td>
            <td>{item.email_usuario}</td>
            <td>{item.nombre_producto}</td>
            <td>{item.fecha}</td>
            <td>
              <a href={item.url_actual} target="_blank" rel="noopener noreferrer">
                🔗
              </a>
            </td>
            <td>
              <a href={item.url_link} target="_blank" rel="noopener noreferrer">
                📄
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

    </div>
  );
};

export default UsuariosAsesor;
