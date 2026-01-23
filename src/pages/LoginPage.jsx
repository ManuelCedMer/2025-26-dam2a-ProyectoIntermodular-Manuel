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
  const [mode, setMode] = useState("login");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [recoverEmail, setRecoverEmail] = useState("");

  const { register, login, recoverPassword } = useAuth();
  const navigate = useNavigate();

  async function handleLoginSubmit({ email, password }) {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await login({ email, password });
      navigate("/");
    } catch (error) {
      setErrorMessage(
        "No se ha podido iniciar sesión. Revisa el correo y la contraseña.",
      );
      console.error("Error al iniciar sesión:", error);
    }
  }

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
      navigate("/");
    } catch (error) {
      setErrorMessage("No se ha podido crear la cuenta.");
      console.error("Error al registrar usuario:", error);
    }
  }

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
      setErrorMessage("No se ha podido enviar el correo de recuperación.");
      console.error("Error al recuperar contraseña:", error);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        {/* CABECERA (centrada) */}
        <header className="login-header">
          <h1 className="login-brand">NutriFit</h1>

          {mode === "login" && <h2>Iniciar sesión</h2>}
          {mode === "register" && <h2>Crear cuenta</h2>}
          {mode === "recover" && <h2>Recuperar contraseña</h2>}
        </header>

        {/* CONTENIDO (alineado a la izquierda) */}
        <div className="login-content">
          {/* LOGIN */}
          {mode === "login" && (
            <>
              <LoginForm
                onSubmit={handleLoginSubmit}
                errorMessage={errorMessage}
              />

              <button
                type="button"
                className="login-forgot-link"
                onClick={() => {
                  setMode("recover");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>

              <button
                type="button"
                className="login-link"
                onClick={() => {
                  setMode("register");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
              >
                ¿No tienes cuenta? <strong>Regístrate</strong>
              </button>
            </>
          )}

          {/* REGISTRO */}
          {mode === "register" && (
            <>
              <RegisterForm
                onSubmit={handleRegisterSubmit}
                errorMessage={errorMessage}
              />

              <button
                type="button"
                className="login-link"
                onClick={() => {
                  setMode("login");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
              >
                ¿Ya tienes cuenta? <strong>Inicia sesión</strong>
              </button>
            </>
          )}

          {/* RECUPERAR CONTRASEÑA */}
          {mode === "recover" && (
            <>
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
                className="login-link"
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
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
