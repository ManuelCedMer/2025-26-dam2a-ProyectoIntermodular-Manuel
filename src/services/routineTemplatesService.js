import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Obtiene las plantillas de rutinas desde la colección `routineTemplates`.
 * Retorna un array de objetos con `id` y los campos del documento.
 */
export async function getRoutineTemplates() {
  const col = collection(db, "routineTemplates");
  const snapshot = await getDocs(col);

  const templates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Orden sencillo por nombre en cliente
  templates.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  return templates;
}

/**
 * Obtiene una plantilla concreta por su id.
 * Retorna null si no existe.
 */
export async function getRoutineTemplateById(templateId) {
  if (!templateId) return null;
  const ref = doc(db, "routineTemplates", templateId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
