/**
 * Formulario de inicio de sesión [LOGIN-02].
 * Permite al usuario autenticarse con correo y contraseña.
 */
function LoginForm({ onSubmit, errorMessage, onForgot, disabled = false }) {
  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get("email");
    const password = formData.get("password");
    onSubmit({ email, password });
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="auth-field">
        <label className="sr-only" htmlFor="login-email">
          Correo electrónico
        </label>
        <input
          id="login-email"
          className="input"
          name="email"
          type="email"
          placeholder="Correo electrónico"
          required
          disabled={disabled}
        />
      </div>

      <div className="auth-field">
        <label className="sr-only" htmlFor="login-password">
          Contraseña
        </label>
        <input
          id="login-password"
          className="input"
          name="password"
          type="password"
          placeholder="Contraseña"
          required
          disabled={disabled}
        />
      </div>

      {onForgot && (
        <div className="auth-forgot">
          <button
            type="button"
            className="auth-forgot-btn"
            onClick={onForgot}
            disabled={disabled}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      )}

      {errorMessage && (
        <p className="auth-message auth-message--error">{errorMessage}</p>
      )}

      <button type="submit" className="btn btn-primary" disabled={disabled}>
        Entrar
      </button>
    </form>
  );
}

export default LoginForm;
