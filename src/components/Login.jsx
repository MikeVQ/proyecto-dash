// src/components/Login.jsx
import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { sendSignInLinkToEmail } from "firebase/auth";
import "./Login.css"; // Importa los estilos

function Login() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar correo exacto
    if (email.trim().toLowerCase() !== "mdvelascoc@outlook.com") {
      setMessage("Correo inválido. Solo se permite 'mdvelascoc@outlook.com'.");
      return;
    }

    // Configuración del enlace
    const actionCodeSettings = {
      url: "https://proyecto-dash.vercel.app/dashboard",
      handleCodeInApp: true
    };

    // Enviar Magic Link
    sendSignInLinkToEmail(auth, email, actionCodeSettings)
      .then(() => {
        window.localStorage.setItem("emailForSignIn", email);
        setMessage(`Se envió un correo de verificación a ${email}. 
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
