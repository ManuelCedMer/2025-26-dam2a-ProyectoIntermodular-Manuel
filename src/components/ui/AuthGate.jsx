import { useAuth } from "../../context/AuthContext.jsx";
import { Page, PageTitle } from "./Page.jsx";

/**
 * Gate reutilizable para páginas privadas.
 * - Si no hay usuario autenticado, muestra un mensaje de acceso.
 * - Si hay usuario, renderiza el contenido.
 */
function AuthGate({ title = "Acceso", children }) {
  const { user } = useAuth();

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
