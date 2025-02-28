// src/components/Login.jsx
import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { sendSignInLinkToEmail } from "firebase/auth";
import "./Login.css"; // Importa los estilos

function Login() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Lista de correos permitidos
  const allowedEmails = [
    "mdvelascoc@outlook.com",
    "carboleda@adrianahoyos.com",
    "mauro@sanmiguel.io"
  ];

  // Lista de correos permitidos
  const allowedEmails = [
    "mdvelascoc@outlook.com",
    "carboleda@adrianahoyos.com",
    "mauro@sanmiguel.io"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    // Normalizamos el correo (quitamos espacios y lo pasamos a minúsculas)
    const normalizedEmail = email.trim().toLowerCase();

    // Validar si el correo está en la lista de permitidos
    if (!allowedEmails.includes(normalizedEmail)) {
      setMessage(
        "Correo inválido. Solo se permiten:\n" + allowedEmails.join(", ")
      );
    // Normalizamos el correo (quitamos espacios y lo pasamos a minúsculas)
    const normalizedEmail = email.trim().toLowerCase();

    // Validar si el correo está en la lista de permitidos
    if (!allowedEmails.includes(normalizedEmail)) {
      setMessage(
        "Correo inválido. Solo se permiten:\n" + allowedEmails.join(", ")
      );
      return;
    }

    // Configuración del enlace (Magic Link)
    // Configuración del enlace (Magic Link)
    const actionCodeSettings = {
      url: "https://proyecto-dash.vercel.app/dashboard", // Ajusta la ruta si es necesario
      url: "https://proyecto-dash.vercel.app/dashboard", // Ajusta la ruta si es necesario
      handleCodeInApp: true
    };

    // Enviar Magic Link
    sendSignInLinkToEmail(auth, normalizedEmail, actionCodeSettings)
    sendSignInLinkToEmail(auth, normalizedEmail, actionCodeSettings)
      .then(() => {
        window.localStorage.setItem("emailForSignIn", normalizedEmail);
        setMessage(`Se envió un correo de verificación a ${normalizedEmail}.
Por favor revisa tu bandeja de entrada.
        window.localStorage.setItem("emailForSignIn", normalizedEmail);
        setMessage(`Se envió un correo de verificación a ${normalizedEmail}.
Por favor revisa tu bandeja de entrada.
OJO: El correo puede estar archivado como no deseado.`);
      })
      .catch((error) => {
        console.error("Error al enviar el correo de verificación:", error);
        setMessage("Ocurrió un error al enviar el correo. Intenta de nuevo.");
      });
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <label>Correo:</label>
          <input
            type="email"
            value={email}
            placeholder="Ingresa tu correo"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Enviar Magic Link</button>
        </form>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default Login;

