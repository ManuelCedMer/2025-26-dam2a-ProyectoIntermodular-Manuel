import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm.jsx";
import RegisterForm from "../components/RegisterForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Pantalla de autenticación [LOGIN].
 * Permite iniciar sesión [LOGIN-02] o registrarse [LOGIN-01].
 */
function LoginPage() {
  // Controla si se muestra el formulario de login o el de registro.
  const [mode, setMode] = useState("login"); 

  // Mensaje de error a mostrar bajo el formulario.
  const [errorMessage, setErrorMessage] = useState("");

  // Funciones de autenticación proporcionadas por el contexto.
  const { register, login } = useAuth();

  // Para redirigir al usuario tras iniciar sesión o registrarse.
  const navigate = useNavigate();

  // Maneja el envío del formulario de inicio de sesión.
  async function handleLoginSubmit({ email, password }) {
    try {
      setErrorMessage("");
      await login({ email, password });
      // Si el login es correcto, vamos a la pantalla de inicio.
      navigate("/");
    } catch (error) {
      setErrorMessage("No se ha podido iniciar sesión. Revisa el correo y la contraseña.");
      console.error("Error al iniciar sesión:", error);
    }
  }

  // Maneja el envío del formulario de registro.
  async function handleRegisterSubmit({ name, email, password, repeatPassword }) {
    try {
      setErrorMessage("");

      if (password !== repeatPassword) {
        setErrorMessage("Las contraseñas no coinciden.");
        return;
      }

      await register({ name, email, password });
      // Tras registrarse, se envía al usuario a la pantalla de inicio.
      navigate("/");
    } catch (error) {
      setErrorMessage("No se ha podido crear la cuenta.");
      console.error("Error al registrar usuario:", error);
    }
  }

  return (
    <div>
      <h2>[LOGIN] Pantalla de autenticación</h2>

      {/* Selector entre login y registro */}
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

      {/* Renderizado condicional del formulario según el modo actual */}
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
