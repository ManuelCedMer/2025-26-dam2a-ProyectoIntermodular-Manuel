import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { recipesSeed } from "../scripts/recipesSeedData.js";

/**
 * Página temporal para insertar recetas de prueba en Firestore.
 * No forma parte del producto final, solo se usa una vez.
 */
function SeedRecipesPage() {
  const [status, setStatus] = useState("");

  async function handleSeed() {
    try {
      setStatus("Insertando recetas de prueba...");
      const recipesRef = collection(db, "recipes");

      for (const recipe of recipesSeed) {
        await addDoc(recipesRef, recipe);
      }

      setStatus("Recetas insertadas correctamente. Revisa la colección 'recipes' en Firestore.");
    } catch (error) {
      console.error("Error al insertar recetas:", error);
      setStatus("Ha ocurrido un error al insertar las recetas. Revisa la consola.");
    }
  }

  return (
    <div>
      <h2>Insertar recetas de prueba</h2>
      <p>
        Esta página es solo para desarrollo. Pulsa el botón una vez para crear
        20 recetas en la colección <strong>recipes</strong>.
      </p>

      <button type="button" onClick={handleSeed}>
        Insertar recetas de prueba
      </button>

      {status && <p>{status}</p>}
    </div>
  );
}

export default SeedRecipesPage;
