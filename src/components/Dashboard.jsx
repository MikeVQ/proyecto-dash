import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Treemap
} from "recharts";
import * as XLSX from "xlsx";
import "./Dashboard.css";

// Importaciones de Firebase
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "../firebaseConfig"; // Ajusta la ruta si es necesario

const COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#D16BA5"];

const Dashboard = () => {
  // Estado para el usuario logueado en Firebase
  const [user, setUser] = useState(null);
  // Estado para saber si estamos validando la autenticación (Magic Link)
  const [authLoading, setAuthLoading] = useState(true);

  // Estados para los datos
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Estados para el filtrado por fecha
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // "all", "day", "month", "year", "range"
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // -----------------------------------------------
  // 1. Efecto para validar Magic Link y escuchar cambios de sesión
  // -----------------------------------------------
  useEffect(() => {
    // Listener para saber si el usuario está logueado
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Verificar si la URL actual contiene un enlace de inicio de sesión (Magic Link)
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        // Si por alguna razón no está en localStorage,
        // se lo pedimos al usuario.
        email = window.prompt("Por favor, ingresa tu correo para confirmar:");
      }

      signInWithEmailLink(auth, email, window.location.href)
        .then(() => {
          // Eliminamos el correo del localStorage por seguridad
          window.localStorage.removeItem("emailForSignIn");
        })
        .catch((error) => {
          console.error("Error al iniciar sesión con Magic Link:", error);
        })
        .finally(() => {
          // Ya terminamos de procesar el Magic Link
          setAuthLoading(false);
        });
    } else {
      // Si no es un Magic Link, no hay nada que procesar
      setAuthLoading(false);
    }

    // Cleanup del listener
    return () => unsubscribe();
  }, []);

  // -----------------------------------------------
  // 2. Efecto para obtener los datos de la API
  // -----------------------------------------------
  useEffect(() => {
    axios
      .get("/api/datos")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setData(response.data);
          setFilteredData(response.data);
        }
        setDataLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener datos:", error);
        setDataLoading(false);
      });
  }, []);

  // -----------------------------------------------
  // 3. Manejo de estados de carga
  // -----------------------------------------------
  // Si aún estamos verificando la autenticación o descargando datos, mostramos un loader
  if (authLoading || dataLoading) {
    return <p className="loading">Cargando...</p>;
  }

  // Si ya no estamos cargando y no hay usuario, significa que NO inició sesión
  if (!user) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        No has iniciado sesión.{" "}
        <a href="/" style={{ color: "#4D96FF", textDecoration: "underline" }}>
          Ir al Login
        </a>
      </p>
    );
  }

  // -----------------------------------------------
  // 4. Lógica de filtrado
  // -----------------------------------------------
  const filterData = () => {
    let filtered = [...data];

    // Filtrado por búsqueda
    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.nombre_producto.toLowerCase().includes(search.toLowerCase()) ||
          item.email_usuario.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Convertimos la fecha seleccionada a formato "YYYY-MM-DD", "YYYY-MM" o "YYYY"
    if (selectedFilter === "day" && startDate) {
      const formatted = startDate.toISOString().split("T")[0];
      filtered = filtered.filter((item) => item.fecha.startsWith(formatted));
    } else if (selectedFilter === "month" && startDate) {
      const formatted = startDate.toISOString().slice(0, 7);
      filtered = filtered.filter((item) => item.fecha.startsWith(formatted));
    } else if (selectedFilter === "year" && startDate) {
      const formatted = startDate.toISOString().slice(0, 4);
      filtered = filtered.filter((item) => item.fecha.startsWith(formatted));
    } else if (selectedFilter === "range" && startDate && endDate) {
      const formattedStart = startDate.toISOString().split("T")[0];
      const formattedEnd = endDate.toISOString().split("T")[0];
      filtered = filtered.filter((item) => {
        const itemDate = item.fecha.split(" ")[0];
        return itemDate >= formattedStart && itemDate <= formattedEnd;
      });
    }

    setFilteredData(filtered);
  };

  // -----------------------------------------------
  // 5. Preparar datos para gráficos
  // -----------------------------------------------
  const productCounts = filteredData.reduce((acc, item) => {
    acc[item.nombre_producto] = (acc[item.nombre_producto] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(productCounts).map((producto, index) => ({
    name: producto,
    downloads: productCounts[producto],
    color: COLORS[index % COLORS.length]
  }));

  const downloadsByDate = filteredData.reduce((acc, item) => {
    const date = item.fecha.split(" ")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const lineChartData = Object.keys(downloadsByDate).map((date) => ({
    date,
    downloads: downloadsByDate[date]
  }));

  const treemapData = chartData.map((item) => ({
    name: item.name,
    size: item.downloads
  }));

  // -----------------------------------------------
  // 6. Exportar datos a Excel
  // -----------------------------------------------
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Descargas");
    XLSX.writeFile(wb, "descargas.xlsx");
  };

  // -----------------------------------------------
  // 7. Render del Dashboard
  // -----------------------------------------------
  return (
    <div className="dashboard-container">
      <div className="header-container">
        <h1 className="dashboard-title">📊 Dashboard de Descargas</h1>
        <input
          type="text"
          className="search-bar"
          placeholder="🔍 Buscar por producto o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="stats-container">
          <div className="stat-card">
            <h3>📥 Total de Descargas</h3>
            <p>{data.length}</p>
          </div>
          <div className="stat-card">
            <h3>⭐ Producto Más Descargado</h3>
            <p>{chartData.length > 0 ? chartData[0].name : "N/A"}</p>
          </div>
          <div className="stat-card">
            <h3>👥 Usuarios Activos</h3>
            <p>
              {[...new Set(data.map((item) => item.email_usuario))].length}
            </p>
          </div>
        </div>
      </div>

      <div className="content-container">
        {/* Tabla y filtros */}
        <div className="table-container">
          <div className="top-controls">
            <div className="filter-container">
              <select
                className="filter-select"
                value={selectedFilter}
                onChange={(e) => {
                  setSelectedFilter(e.target.value);
                  // Reiniciamos las fechas al cambiar el tipo de filtro
                  setStartDate(null);
                  setEndDate(null);
                }}
              >
                <option value="all">Todos</option>
                <option value="day">Día</option>
                <option value="month">Mes</option>
                <option value="year">Año</option>
                <option value="range">Rango de Fechas</option>
              </select>

              {selectedFilter === "day" && (
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Selecciona un día"
                  className="date-picker"
                />
              )}

              {selectedFilter === "month" && (
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="yyyy-MM"
                  showMonthYearPicker
                  placeholderText="Selecciona un mes"
                  className="date-picker"
                />
              )}

              {selectedFilter === "year" && (
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="yyyy"
                  showYearPicker
                  placeholderText="Selecciona un año"
                  className="date-picker"
                />
              )}

              {selectedFilter === "range" && (
                <>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Inicio"
                    className="date-picker"
                  />
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Fin"
                    className="date-picker"
                  />
                </>
              )}

              <button className="apply-filter-btn" onClick={filterData}>
                Filtrar
              </button>
            </div>
            <button className="export-btn" onClick={exportToExcel}>
              📤 Exportar a Excel
            </button>
          </div>

          <table className="dashboard-table">
            <thead>
              <tr>
                <th>ID Usuario</th>
                <th>Email</th>
                <th>Producto</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td>{item.id_usuario}</td>
                  <td>{item.email_usuario}</td>
                  <td>{item.nombre_producto}</td>
                  <td>{item.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sección de gráficos */}
        <div className="charts-container">
          <div className="chart-box">
            <h3>📊 Descargas por Producto</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="downloads" fill="#4D96FF" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h3>📈 Evolución de Descargas</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineChartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="downloads" stroke="#FF6B6B" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h3>🍰 Distribución de Descargas</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="downloads"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h3>📊 Gráfico de Marimekko</h3>
            <ResponsiveContainer width="100%" height={250}>
              <Treemap
                data={treemapData}
                dataKey="size"
                stroke="#fff"
                fill="#4D96FF"
              >
                {treemapData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Treemap>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
