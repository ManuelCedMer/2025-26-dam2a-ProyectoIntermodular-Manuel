/**
 * Formulario de registro [LOGIN-01].
 * Permite crear una cuenta nueva con correo y contraseña.
 */
function RegisterForm({ onSubmit, errorMessage }) {
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
    <form onSubmit={handleSubmit}>
      

      <div>
        <label>Nombre</label>
        <input name="name" type="text" required />
      </div>

      <div>
        <label>Correo electrónico</label>
        <input name="email" type="email" required />
      </div>

      <div>
        <label>Contraseña</label>
        <input name="password" type="password" required />
      </div>

      <div>
        <label>Repetir contraseña</label>
        <input name="repeatPassword" type="password" required />
      </div>

      {errorMessage && <p>{errorMessage}</p>}

      <button type="submit">Registrarse</button>
    </form>
  );
}

export default RegisterForm;
