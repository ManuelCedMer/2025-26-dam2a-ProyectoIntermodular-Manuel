import {
  collection,
  getDocs,
  addDoc,
  query,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase.js";
import { routineTemplatesSeed } from "./routineTemplatesSeed.js";

/**
 * Script auxiliar para cargar plantillas de rutinas en Firebase.
 * Utiliza los datos definidos previamente y los inserta en la base de datos
 * para disponer de contenido inicial en la aplicación.
 */
export async function seedRoutineTemplatesOnce() {
  const templatesRef = collection(db, "routineTemplates");

  const existingDocs = await getDocs(query(templatesRef, limit(1)));

  if (!existingDocs.empty) {
    console.log(
      "La colección 'routineTemplates' ya contiene documentos. Seed cancelado para evitar duplicados.",
    );
    return {
      ok: false,
      message:
        "La colección 'routineTemplates' ya contiene documentos. No se ha realizado la carga.",
    };
  }

  for (const plantilla of routineTemplatesSeed) {
    await addDoc(templatesRef, {
      ...plantilla,
      createdAt: serverTimestamp(),
    });
  }

  console.log("Seed de plantillas de rutinas completado correctamente.");
  return {
    ok: true,
    message: "Plantillas de rutinas subidas correctamente.",
  };
}