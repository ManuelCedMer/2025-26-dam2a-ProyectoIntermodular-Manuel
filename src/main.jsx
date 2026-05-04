import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// Punto de entrada de la aplicación: montamos el árbol de componentes
// usando la API moderna de React (`createRoot`).
// `React.StrictMode` ayuda a detectar problemas en desarrollo.
// `BrowserRouter` maneja el enrutado basado en la URL del navegador.
// `AuthProvider` proporciona el contexto de autenticación a toda la app.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
