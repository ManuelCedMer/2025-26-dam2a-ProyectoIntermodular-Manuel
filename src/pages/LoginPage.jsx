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
  <main className="auth-page">
    <section className="card auth-card">
      <header className="auth-header">
        <h1 className="auth-brand">NutriFit</h1>

        {mode === "login" && <h2 className="auth-title">Iniciar sesión</h2>}
        {mode === "register" && <h2 className="auth-title">Crear cuenta</h2>}
        {mode === "recover" && (
          <h2 className="auth-title">Recuperar contraseña</h2>
        )}
      </header>

      {/* LOGIN */}
      {mode === "login" && (
        <>
          <LoginForm
                onSubmit={handleLoginSubmit}
                errorMessage={errorMessage}
                onForgot={() => {
                  setMode("recover");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}/>
          <div className="auth-links">
            
            <button
              type="button"
              className="auth-textbtn"
              onClick={() => {
                setMode("register");
                setErrorMessage("");
                setSuccessMessage("");
              }}
            >
              ¿No tienes cuenta? <span className="auth-strong">Regístrate</span>
            </button>
          </div>
        </>
      )}

      {/* REGISTRO */}
      {mode === "register" && (
        <>
          <RegisterForm
            onSubmit={handleRegisterSubmit}
            errorMessage={errorMessage}
          />

          <div className="auth-links">
            <button
              type="button"
              className="auth-textbtn"
              onClick={() => {
                setMode("login");
                setErrorMessage("");
                setSuccessMessage("");
              }}
            >
              ¿Ya tienes cuenta?{" "}
              <span className="auth-strong">Inicia sesión</span>
            </button>
          </div>
        </>
      )}

      {/* RECUPERAR CONTRASEÑA */}
      {mode === "recover" && (
        <>
          <form onSubmit={handleRecoverSubmit} className="auth-form">
            <div className="auth-field">
              <label className="sr-only" htmlFor="recover-email">
                Correo electrónico
              </label>
              <input
                id="recover-email"
                className="input"
                type="email"
                placeholder="Correo electrónico"
                value={recoverEmail}
                onChange={(event) => setRecoverEmail(event.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Enviar enlace de recuperación
            </button>
          </form>

          {successMessage && (
            <p className="auth-message auth-message--success">
              {successMessage}
            </p>
          )}

          {errorMessage && (
            <p className="auth-message auth-message--error">{errorMessage}</p>
          )}

          <div className="auth-links">
            <button
              type="button"
              className="auth-textbtn"
              onClick={() => {
                setMode("login");
                setErrorMessage("");
                setSuccessMessage("");
              }}
            >
              Volver a iniciar sesión
            </button>
          </div>
        </>
      )}
    </section>
  </main>
);

}

export default LoginPage;
