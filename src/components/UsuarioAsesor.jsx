import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./UsuarioAsesor.css"; // Importa tu hoja de estilos

const UsuariosAsesor = () => {
  const [asesores, setAsesores] = useState([]);
  const [selectedAsesor, setSelectedAsesor] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [allUsersMode, setAllUsersMode] = useState(false);

  const [historico, setHistorico] = useState([]);
  const [historicoVisible, setHistoricoVisible] = useState(false);

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [emailUsuario, setEmailUsuario] = useState("");
  const [pais, setPais] = useState("");
  const [tipoNegocio, setTipoNegocio] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' o 'error'

  const [duplicatedUsers, setDuplicatedUsers] = useState([]);

  const [editingUser, setEditingUser] = useState(null);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const [uploadingFile, setUploadingFile] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [batchDeleteModalVisible, setBatchDeleteModalVisible] = useState(false);
  const [batchDeleteConfirmationText, setBatchDeleteConfirmationText] = useState("");

  const [sortOrder, setSortOrder] = useState("asc");

  // 1. Cargar asesores al montar
  useEffect(() => {
    axios
      .get("/api/asesores")
      .then((res) => setAsesores(res.data))
      .catch((err) => console.error("Error:", err));
  }, []);

  // Botón para regresar
  const handleBack = () => {
    window.history.back();
  };

  // 2. Listar usuarios de un asesor
  const handleListarUsuarios = () => {
    if (!selectedAsesor) return;
    axios
      .get(`/api/usuariosAsesor?nombre_asesor=${encodeURIComponent(selectedAsesor)}`)
      .then((res) => {
        setUsuarios(res.data);
        setHistoricoVisible(false);
        setSelectedUsers([]);
        setAllUsersMode(false);
      })
      .catch((err) => console.error("Error:", err));
  };

  // 2.b Listar TODOS los usuarios (sin filtrar por asesor)
  const handleListarTodosLosUsuarios = () => {
    axios
      .get("/api/usuariosAsesor?all=true")
      .then((res) => {
        setUsuarios(res.data);
        setHistoricoVisible(false);
        setSelectedUsers([]);
        setAllUsersMode(true);
      })
      .catch((err) => {
        console.error("Error:", err);
        setMessage("Error al obtener todos los usuarios.");
        setMessageType("error");
      });
  };

  // 3. Crear usuario (modo creación)
  const handleCrearUsuario = () => {
    if (!selectedAsesor) {
      setMessage("Selecciona un asesor primero.");
      setMessageType("error");
      return;
    }
    axios
      .post("/api/usuariosAsesor", {
        nombre_asesor: selectedAsesor,
        nombre_usuario: nombreUsuario,
        email_usuario: emailUsuario.toLowerCase(),
        pais: pais,
        tipo_negocio: tipoNegocio
      })
      .then(() => {
        setMessage("Usuario creado con éxito.");
        setMessageType("success");
        setNombreUsuario("");
        setEmailUsuario("");
        setPais("");
        setTipoNegocio("");
        handleListarUsuarios();
      })
      .catch((err) => {
        if (err.response && err.response.status === 409) {
          setMessage("Este usuario ya existe con los mismos campos (duplicado).");
          setMessageType("error");
        } else {
          setMessage("Ocurrió un error al crear el usuario.");
          setMessageType("error");
        }
      });
  };

  // 3.b Función para actualizar usuario (modo edición)
  const handleUpdateUsuario = async () => {
    try {
      await axios.put("/api/usuariosAsesor", {
        _id: editingUser._id,
        nombre_asesor: selectedAsesor,
        nombre_usuario: nombreUsuario,
        email_usuario: emailUsuario.toLowerCase(),
        pais: pais,
        tipo_negocio: tipoNegocio
      });
      setMessage("Usuario actualizado con éxito.");
      setMessageType("success");
      setEditingUser(null);
      setNombreUsuario("");
      setEmailUsuario("");
      setPais("");
      setTipoNegocio("");
      handleListarUsuarios();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      setMessage("Ocurrió un error al actualizar el usuario.");
      setMessageType("error");
    }
  };

  // 4. Carga masiva desde Excel
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      const duplicates = [];

      for (const row of rows) {
        try {
          if (!row.nombre_asesor) {
            console.warn("Fila omitida por no tener nombre_asesor:", row);
            continue;
          }
          await axios.post("/api/usuariosAsesor", {
            nombre_asesor: row.nombre_asesor,
            nombre_usuario: row.nombre_usuario,
            email_usuario: row.email_usuario
              ? row.email_usuario.toLowerCase()
              : "",
            pais: row.pais ? row.pais.toUpperCase() : "",
            tipo_negocio: row.tipo_negocio
          });
          successCount++;
        } catch (error) {
          if (error.response && error.response.status === 409) {
            duplicates.push({
              nombre_asesor: row.nombre_asesor,
              nombre_usuario: row.nombre_usuario,
              email_usuario: row.email_usuario,
              pais: row.pais,
              tipo_negocio: row.tipo_negocio
            });
          } else {
            console.error("Error al crear usuario:", error);
          }
        }
      }

      if (successCount === 0 && duplicates.length === 0) {
        setMessage(
          "No se insertaron usuarios. Verifica tu archivo o revisa los errores en consola."
        );
        setMessageType("error");
        setDuplicatedUsers([]);
      } else if (duplicates.length > 0) {
        setMessage(
          `Se subieron ${successCount} usuario(s) con éxito. Se omitieron ${duplicates.length} por duplicados.`
        );
        setMessageType("success");
        setDuplicatedUsers(duplicates);
      } else {
        setMessage(`Usuarios cargados exitosamente. Total insertados: ${successCount}.`);
        setMessageType("success");
        setDuplicatedUsers([]);
      }

      handleListarUsuarios();
    } catch (error) {
      console.error("Error leyendo archivo Excel:", error);
      setMessage("Error al procesar el archivo Excel.");
      setMessageType("error");
    } finally {
      setUploadingFile(false);
    }
  };

  // 5. Descargar formato para carga masiva
  const handleDescargarFormato = () => {
    const headers = [
      "nombre_asesor",
      "nombre_usuario",
      "email_usuario",
      "pais",
      "tipo_negocio"
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Formato");
    XLSX.writeFile(wb, "formatoUsuarios.xlsx");
  };

  // 6. Obtener histórico de usuarios
  const handleHistoricoUsuarios = () => {
    if (!selectedAsesor) {
      setMessage("Selecciona un asesor primero.");
      setMessageType("error");
      return;
    }
    axios
      .get(`/api/historicoUsuarios?nombre_asesor=${encodeURIComponent(selectedAsesor)}`)
      .then((res) => {
        setHistorico(res.data);
        setHistoricoVisible(true);
        setSelectedUsers([]);
        setAllUsersMode(false);
      })
      .catch((err) => {
        console.error("Error al obtener histórico:", err);
        setMessage("Ocurrió un error al obtener el histórico.");
        setMessageType("error");
      });
  };

  // 7. Función para editar usuario
  const handleEdit = (user) => {
    setEditingUser(user);
    setNombreUsuario(user.nombre_usuario);
    setEmailUsuario(user.email_usuario);
    setPais(user.pais);
    setTipoNegocio(user.tipo_negocio);
  };

  // 8. Modal de eliminación individual
  const handleDelete = (userId) => {
    setDeleteUserId(userId);
    setDeleteConfirmationText("");
    setDeleteModalVisible(true);
  };
  const confirmDelete = async () => {
    if (deleteConfirmationText !== "DELETE") {
      alert("La palabra ingresada no es correcta.");
      return;
    }
    try {
      await axios.delete(`/api/usuariosAsesor?_id=${deleteUserId}`);
      setMessage("Usuario eliminado correctamente.");
      setMessageType("success");
      setDeleteModalVisible(false);
      handleListarUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      setMessage("Error al eliminar usuario.");
      setMessageType("error");
      setDeleteModalVisible(false);
    }
  };
  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setDeleteUserId(null);
    setDeleteConfirmationText("");
  };

  // 9. Botón para refrescar tabla
  const handleRefresh = () => {
    handleListarUsuarios();
  };

  // ============ ELIMINACIÓN POR LOTES (CON POP-UP) ============
  const handleCheckboxChange = (userId) => {
    setSelectedUsers((prevSelected) => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter((id) => id !== userId);
      } else {
        return [...prevSelected, userId];
      }
    });
  };
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = usuarios.map((u) => u._id);
      setSelectedUsers(allIds);
    } else {
      setSelectedUsers([]);
    }
  };
  const openBatchDeleteModal = () => {
    if (selectedUsers.length === 0) {
      alert("No has seleccionado ningún usuario para eliminar.");
      return;
    }
    setBatchDeleteConfirmationText("");
    setBatchDeleteModalVisible(true);
  };
  const cancelBatchDelete = () => {
    setBatchDeleteModalVisible(false);
    setBatchDeleteConfirmationText("");
  };
  const confirmBatchDelete = async () => {
    if (batchDeleteConfirmationText !== "DELETE") {
      alert("La palabra ingresada no es correcta.");
      return;
    }
    try {
      const res = await axios.post("/api/usuariosAsesor/batchDelete", {
        ids: selectedUsers
      });
      setMessage(res.data.message || "Usuarios eliminados correctamente.");
      setMessageType("success");
      setSelectedUsers([]);
      setBatchDeleteModalVisible(false);
      handleListarUsuarios();
    } catch (error) {
      console.error("Error en eliminación masiva:", error);
      setMessage("Ocurrió un error al eliminar los usuarios seleccionados.");
      setMessageType("error");
      setBatchDeleteModalVisible(false);
    }
  };

  // ============ ORDENAR A-Z / Z-A ============
  const handleToggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };
  
  // Ordenamos usuarios antes de renderizar la tabla
    const sortedUsuarios = [...usuarios].sort((a, b) => {
      if (allUsersMode) {
        // Ordenar por el nombre del asesor (que viene en asesorData.nombre_asesor)
        const asesorA = (a.asesorData?.nombre_asesor || "").toLowerCase();
        const asesorB = (b.asesorData?.nombre_asesor || "").toLowerCase();
        if (asesorA < asesorB) return sortOrder === "asc" ? -1 : 1;
        if (asesorA > asesorB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      } else {
        // Ordenar por nombre del usuario (como estaba)
        const nameA = a.nombre_usuario.toLowerCase();
        const nameB = b.nombre_usuario.toLowerCase();
        if (nameA < nameB) return sortOrder === "asc" ? -1 : 1;
        if (nameA > nameB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      }
    });

  return (
    <div className="usuarios-asesor-container">
      {/* Pop-up de "Cargando archivo..." */}
      {uploadingFile && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Cargando archivo...</h3>
            <p>Esto no demorará mucho tiempo.</p>
          </div>
        </div>
      )}

      {/* Pop-up para confirmación de eliminación por lotes */}
      {batchDeleteModalVisible && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmar eliminación masiva</h3>
            <p>Para confirmar la eliminación, escribe "DELETE"</p>
            <input
              type="text"
              value={batchDeleteConfirmationText}
              onChange={(e) => setBatchDeleteConfirmationText(e.target.value)}
              placeholder='Escribe "DELETE"'
            />
            <div className="modal-buttons">
              <button className="usuarios-asesor-button" onClick={confirmBatchDelete}>
                Confirmar
              </button>
              <button className="usuarios-asesor-button" onClick={cancelBatchDelete}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Encabezado con botón de regresar */}
      <div className="title-row">
        <h2 className="usuarios-asesor-title">Asignar Usuarios a Asesor</h2>
        <button className="usuarios-asesor-button back-button" onClick={handleBack}>
          Regresar
        </button>
      </div>

      {/* Mensajes de éxito o error */}
      {message && (
        <p
          className={`usuarios-asesor-message ${
            messageType === "success"
              ? "message-success"
              : messageType === "error"
              ? "message-error"
              : ""
          }`}
        >
          {message}
        </p>
      )}

      {/* Si existen duplicados, mostramos la tabla debajo del mensaje */}
      {duplicatedUsers.length > 0 && (
        <div className="duplicated-users-container">
          <h4>Usuarios Duplicados (no se insertaron):</h4>
          <table className="usuarios-asesor-table">
            <thead>
              <tr>
                <th>Asesor</th>
                <th>Nombre Usuario</th>
                <th>Email</th>
                <th>País</th>
                <th>Tipo de Negocio</th>
              </tr>
            </thead>
            <tbody>
              {duplicatedUsers.map((dupe, index) => (
                <tr key={index}>
                  <td>{dupe.nombre_asesor}</td>
                  <td>{dupe.nombre_usuario}</td>
                  <td>{dupe.email_usuario}</td>
                  <td>{dupe.pais}</td>
                  <td>{dupe.tipo_negocio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Botones de selección de asesor y vistas */}
      <div className="usuarios-asesor-select-row">
        <select
          className="usuarios-asesor-select"
          value={selectedAsesor}
          onChange={(e) => setSelectedAsesor(e.target.value)}
        >
          <option value="">Selecciona un asesor</option>
          {asesores.map((asesor) => (
            <option key={asesor._id} value={asesor.nombre_asesor}>
              {asesor.nombre_asesor}
            </option>
          ))}
        </select>

        <button className="usuarios-asesor-button" onClick={handleListarUsuarios}>
          Listar Usuarios
        </button>
        <button className="usuarios-asesor-button" onClick={handleHistoricoUsuarios}>
          Histórico de Usuarios
        </button>
        <button className="usuarios-asesor-button" onClick={handleListarTodosLosUsuarios}>
          Todos los Usuarios
        </button>
      </div>

      {/* Formulario para crear o editar usuario */}
      <div className="usuarios-asesor-form">
        <input
          className="usuarios-asesor-input"
          type="text"
          placeholder="Nombre Usuario"
          value={nombreUsuario}
          onChange={(e) => setNombreUsuario(e.target.value)}
          autoComplete="off"
        />
        <input
          className="usuarios-asesor-input"
          type="email"
          placeholder="Email Usuario"
          value={emailUsuario}
          onChange={(e) => setEmailUsuario(e.target.value)}
          autoComplete="off"
        />
        <input
          className="usuarios-asesor-input"
          type="text"
          placeholder="País (ej. US, EC)"
          value={pais}
          onChange={(e) => setPais(e.target.value.toUpperCase())}
          autoComplete="off"
        />
        <input
          className="usuarios-asesor-input"
          type="text"
          placeholder="Tipo de Negocio"
          value={tipoNegocio}
          onChange={(e) => setTipoNegocio(e.target.value)}
          autoComplete="off"
        />
        {editingUser ? (
          <button className="usuarios-asesor-button" onClick={handleUpdateUsuario}>
            Actualizar Usuario
          </button>
        ) : (
          <button className="usuarios-asesor-button" onClick={handleCrearUsuario}>
            Crear Usuario
          </button>
        )}
      </div>

      {/* Carga masiva por Excel y botón para refrescar */}
      <div className="usuarios-asesor-mass-upload">
        <div className="mass-upload-left">
          <h3>Carga Masiva</h3>
          <button className="usuarios-asesor-button" onClick={handleDescargarFormato}>
            Descargar Formato
          </button>
          <label className="usuarios-asesor-button file-label">
            Elegir Archivo
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>

        <button className="usuarios-asesor-button refresh-button" onClick={handleRefresh}>
          Refrescar Tabla
        </button>
      </div>

      {/* Botón para eliminar varios usuarios a la vez */}
      {!historicoVisible && sortedUsuarios.length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <button
            className="usuarios-asesor-button eliminar-button"
            onClick={openBatchDeleteModal}
            style={{ marginRight: "10px" }}
          >
            Eliminar seleccionados
          </button>
          <button className="usuarios-asesor-button" onClick={handleToggleSortOrder}>
            {sortOrder === "asc" ? "Ordenar Z-A" : "Ordenar A-Z"}
          </button>
        </div>
      )}

      {/* Envolvemos la tabla (cuando NO es histórico) en un div con clase "usuarios-asesor-table-wrapper" */}
      {!historicoVisible && (
        <div className="usuarios-asesor-table-wrapper">
          <table className="usuarios-asesor-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      selectedUsers.length === sortedUsuarios.length &&
                      sortedUsuarios.length > 0
                    }
                  />
                </th>
                {allUsersMode && <th>Asesor</th>}
                <th>Nombre Usuario</th>
                <th>Email</th>
                <th>País</th>
                <th>Tipo de Negocio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsuarios.map((u) => {
                // Si venimos de "Todos los usuarios", el backend envía "asesorData.nombre_asesor"
                const asesorName = u.asesorData?.nombre_asesor || "";
                return (
                  <tr key={u._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u._id)}
                        onChange={() => handleCheckboxChange(u._id)}
                      />
                    </td>
                    {allUsersMode && <td>{asesorName}</td>}
                    <td>{u.nombre_usuario}</td>
                    <td>{u.email_usuario}</td>
                    <td>{u.pais}</td>
                    <td>{u.tipo_negocio}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="usuarios-asesor-button editar-button"
                          onClick={() => handleEdit(u)}
                        >
                          Editar
                        </button>
                        <button
                          className="usuarios-asesor-button eliminar-button"
                          onClick={() => handleDelete(u._id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tabla del histórico de usuarios */}
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

      {/* Modal de confirmación de eliminación individual */}
      {deleteModalVisible && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmar eliminación</h3>
            <p>Para confirmar la eliminación, escribe "DELETE"</p>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder='Escribe "DELETE"'
            />
            <div className="modal-buttons">
              <button className="usuarios-asesor-button" onClick={confirmDelete}>
                Confirmar
              </button>
              <button className="usuarios-asesor-button" onClick={cancelDelete}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosAsesor;
