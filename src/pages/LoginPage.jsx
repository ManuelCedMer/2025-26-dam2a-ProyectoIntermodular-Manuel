import { useState } from "react";
import LoginForm from "../components/LoginForm.jsx";
import RegisterForm from "../components/RegisterForm.jsx";

/**
 * Pantalla de autenticación [LOGIN].
 * Desde aquí el usuario puede iniciar sesión o crear una cuenta nueva.
 */
function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [errorMessage, setErrorMessage] = useState("");

  function handleLoginSubmit({ email, password }) {
    // Más adelante aquí se llamará a Firebase Authentication.
    console.log("Login con:", email, password);
    setErrorMessage(""); 
  }

  function handleRegisterSubmit({ name, email, password, repeatPassword }) {
    // Más adelante se validará y se registrará con Firebase.
    console.log("Registro con:", name, email, password, repeatPassword);
    setErrorMessage("");
  }

  return (
    <div>
      <h2>[LOGIN] Pantalla de autenticación</h2>

      <div>
        <button
          type="button"
          onClick={() => setMode("login")}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
        >
          Crear cuenta
        </button>
      </div>

      {mode === "login" && (
        <LoginForm
          onSubmit={handleLoginSubmit}
          errorMessage={errorMessage}
        />
      )}

      {mode === "register" && (
        <RegisterForm
          onSubmit={handleRegisterSubmit}
          errorMessage={errorMessage}
        />
      )}
    </div>
  );
}

export default LoginPage;
