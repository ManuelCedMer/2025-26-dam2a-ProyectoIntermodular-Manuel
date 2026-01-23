import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm.jsx";
import RegisterForm from "../components/RegisterForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Pantalla de autenticación [LOGIN].
 * Permite iniciar sesión [LOGIN-02], registrarse [LOGIN-01]
 * y recuperar la contraseña.
 */
function LoginPage() {
  // Controla el modo: login | register | recover
  const [mode, setMode] = useState("login");

  // Mensajes de error y éxito a mostrar bajo el formulario.
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Email usado en recuperación de contraseña.
  const [recoverEmail, setRecoverEmail] = useState("");

  // Funciones de autenticación proporcionadas por el contexto.
  const { register, login, recoverPassword } = useAuth();

  // Para redirigir al usuario tras iniciar sesión o registrarse.
  const navigate = useNavigate();

  // Maneja el envío del formulario de inicio de sesión.
  async function handleLoginSubmit({ email, password }) {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await login({ email, password });
      // Si el login es correcto, vamos a la pantalla de inicio.
      navigate("/");
    } catch (error) {
      setErrorMessage(
        "No se ha podido iniciar sesión. Revisa el correo y la contraseña.",
      );
      console.error("Error al iniciar sesión:", error);
    }
  }

  // Maneja el envío del formulario de registro.
  async function handleRegisterSubmit({
    name,
    email,
    password,
    repeatPassword,
  }) {
    try {
      setErrorMessage("");
      setSuccessMessage("");

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

  // Maneja el envío del formulario de recuperación de contraseña.
  async function handleRecoverSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await recoverPassword(recoverEmail);
      setSuccessMessage(
        "Te hemos enviado un correo para restablecer tu contraseña.",
      );
      setRecoverEmail("");
    } catch (error) {
      setErrorMessage(
        "No se ha podido enviar el correo de recuperación.",
      );
      console.error("Error al recuperar contraseña:", error);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <header className="login-header">
          <h2>[LOGIN] Autenticación</h2>
          <p className="login-subtitle">
            Accede a tu cuenta o crea una nueva para empezar a usar NutriFit
          </p>
        </header>

        {/* Selector entre login y registro */}
        {(mode === "login" || mode === "register") && (
          <div className="login-mode-selector">
            <button
              type="button"
              className={mode === "login" ? "login-mode-button--active" : ""}
              onClick={() => {
                setMode("login");
                setErrorMessage("");
                setSuccessMessage("");
              }}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              className={mode === "register" ? "login-mode-button--active" : ""}
              onClick={() => {
                setMode("register");
                setErrorMessage("");
                setSuccessMessage("");
              }}
            >
              Crear cuenta
            </button>
          </div>
        )}

        {/* LOGIN */}
        {mode === "login" && (
          <>
            <LoginForm
              onSubmit={handleLoginSubmit}
              errorMessage={errorMessage}
            />

            <button
              type="button"
              className="auth-link"
              onClick={() => {
                setMode("recover");
                setErrorMessage("");
                setSuccessMessage("");
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </>
        )}

        {/* REGISTRO */}
        {mode === "register" && (
          <RegisterForm
            onSubmit={handleRegisterSubmit}
            errorMessage={errorMessage}
          />
        )}

        {/* RECUPERAR CONTRASEÑA */}
        {mode === "recover" && (
          <>
            <h3>Recuperar contraseña</h3>

            <form onSubmit={handleRecoverSubmit} className="auth-form">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={recoverEmail}
                onChange={(event) => setRecoverEmail(event.target.value)}
                required
              />

              <button type="submit" className="auth-button">
                Enviar enlace de recuperación
              </button>
            </form>

            {successMessage && (
              <p className="login-success">{successMessage}</p>
            )}

            {errorMessage && (
              <p className="login-error">{errorMessage}</p>
            )}

            <button
              type="button"
              className="auth-link"
              onClick={() => {
                setMode("login");
                setErrorMessage("");
                setSuccessMessage("");
              }}
            >
              Volver a iniciar sesión
            </button>
          </>
        )}
      </section>
    </main>
  );
}

export default LoginPage;
