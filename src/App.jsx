import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import "./App.css";
import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import RoutinesPage from "./pages/RoutinesPage.jsx";
import DietPage from "./pages/DietPage.jsx";
import RecipesPage from "./pages/RecipesPage.jsx";
import ProgressPage from "./pages/ProgressPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import RoutineDetailPage from "./pages/RoutineDetailPage.jsx";
import DietDetailPage from "./pages/DietDetailPage.jsx";
import RecipeDetailPage from "./pages/RecipeDetailPage.jsx";
import RoutineTemplateDetailPage from "./pages/RoutineTemplateDetailPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          {/* Lista de rutinas */}
          <Route path="/rutinas" element={<RoutinesPage />} />
          {/* Detalle de una rutina concreta (ejercicios) */}
          <Route path="/rutinas/:routineId" element={<RoutineDetailPage />} />
          <Route
            path="/rutinas/plantillas/:templateId"
            element={<RoutineTemplateDetailPage />}
          />
          <Route path="/dietas" element={<DietPage />} />
          <Route path="/dietas/:dietId" element={<DietDetailPage />} />
          <Route path="/recetas" element={<RecipesPage />} />
          <Route path="/recetas/:recipeId" element={<RecipeDetailPage />} />
          <Route path="/progreso" element={<ProgressPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
