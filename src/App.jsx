import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import RoutinesPage from "./pages/RoutinesPage.jsx";
import DietPage from "./pages/DietPage.jsx";
import RecipesPage from "./pages/RecipesPage.jsx";
import ProgressPage from "./pages/ProgressPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/rutinas" element={<RoutinesPage />} />
        <Route path="/dietas" element={<DietPage />} />
        <Route path="/recetas" element={<RecipesPage />} />
        <Route path="/progreso" element={<ProgressPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
