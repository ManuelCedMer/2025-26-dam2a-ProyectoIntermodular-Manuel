/**
 * Formulario de registro [LOGIN-01].
 * Permite crear una cuenta nueva con correo y contraseña.
 */
function RegisterForm({ onSubmit, errorMessage, disabled = false }) {
  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const repeatPassword = formData.get("repeatPassword");

    onSubmit({ name, email, password, repeatPassword });
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="auth-field">
        <label className="sr-only" htmlFor="register-name">
          Nombre
        </label>
        <input
          id="register-name"
          className="input"
          name="name"
          type="text"
          placeholder="Nombre completo"
          required
          disabled={disabled}
        />
      </div>

      <div className="auth-field">
        <label className="sr-only" htmlFor="register-email">
          Correo electrónico
        </label>
        <input
          id="register-email"
          className="input"
          name="email"
          type="email"
          placeholder="Correo electrónico"
          required
          disabled={disabled}
        />
      </div>

      <div className="auth-field">
        <label className="sr-only" htmlFor="register-password">
          Contraseña
        </label>
        <input
          id="register-password"
          className="input"
          name="password"
          type="password"
          placeholder="Contraseña"
          required
          disabled={disabled}
        />
      </div>

      <div className="auth-field">
        <label className="sr-only" htmlFor="register-repeat">
          Confirmar contraseña
        </label>
        <input
          id="register-repeat"
          className="input"
          name="repeatPassword"
          type="password"
          placeholder="Confirmar contraseña"
          required
          disabled={disabled}
        />
      </div>

      {errorMessage && (
        <p className="auth-message auth-message--error">{errorMessage}</p>
      )}

      <button type="submit" className="btn btn-primary" disabled={disabled}>
        Crear cuenta
      </button>
    </form>
  );
}

export default RegisterForm;
