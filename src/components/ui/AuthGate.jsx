import { Page, PageTitle } from "./Page.jsx";

/**
 * Gate reutilizable para páginas privadas.
 */
function AuthGate({ user, title = "Acceso", children }) {
  if (!user) {
    return (
      <Page>
        <PageTitle>{title}</PageTitle>
        <p>Inicia sesión para ver tu información.</p>
      </Page>
    );
  }

  return children;
}

export default AuthGate;