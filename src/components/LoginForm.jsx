/**
 * Formulario de inicio de sesión [LOGIN-02].
 * Permite al usuario autenticarse con correo y contraseña.
 */
function LoginForm({ onSubmit, errorMessage }) {
  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get("email");
    const password = formData.get("password");
    onSubmit({ email, password });
  }

  return (
    <form onSubmit={handleSubmit}>
      

      <div>
        <label>Correo electrónico</label>
        <input name="email" type="email" required />
      </div>

      <div>
        <label>Contraseña</label>
        <input name="password" type="password" required />
      </div>

      {errorMessage && <p>{errorMessage}</p>}

      <button type="submit">Entrar</button>
    </form>
  );
}

export default LoginForm;
