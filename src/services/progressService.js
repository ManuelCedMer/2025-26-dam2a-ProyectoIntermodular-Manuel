import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Devuelve todas las entradas de progreso de un usuario,
 * ordenadas por fecha descendente (la más reciente primero).
 * [PROGRESS-01][PROGRESS-02] Consultar historial básico.
 */
export async function getProgressEntriesByUser(userId) {
  const progressRef = collection(db, "progress");

  const q = query(
    progressRef,
    where("userId", "==", userId),
    orderBy("date", "desc"),
  );

  const snapshot = await getDocs(q);

  const entries = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  return entries;
}

/**
 * Guarda o actualiza el progreso diario de un usuario.
 * Usamos como id de documento: `${userId}_${date}`.
 *
 * [PROGRESS-01] Calorías consumidas / gastadas.
 * [PROGRESS-02] Peso y notas.
 */
export async function saveDailyProgress({
  userId,
  date,
  caloriesIn,
  caloriesOut,
  weight,
  notes,
}) {
  const docId = `${userId}_${date}`;
  const progressDocRef = doc(db, "progress", docId);

  const snapshot = await getDoc(progressDocRef);

  const now = new Date();

  const baseData = {
    userId,
    date,
    caloriesIn,
    caloriesOut,
    weight,
    notes,
  };

  if (snapshot.exists()) {
    // Si ya existe la entrada de ese día, actualizamos los campos y updatedAt.
    await setDoc(
      progressDocRef,
      {
        ...snapshot.data(),
        ...baseData,
        updatedAt: now,
      },
      { merge: true },
    );
  } else {
    // Si no existe, creamos una nueva entrada con createdAt.
    await setDoc(progressDocRef, {
      ...baseData,
      createdAt: now,
      updatedAt: now,
    });
  }

  const finalSnapshot = await getDoc(progressDocRef);

  return {
    id: finalSnapshot.id,
    ...finalSnapshot.data(),
  };
}

/**
 * Devuelve el progreso de un usuario para una fecha concreta (YYYY-MM-DD).
 * Usamos el id `${userId}_${date}` para leerlo directo.
 */
export async function getDailyProgressByDate({ userId, date }) {
  const docId = `${userId}_${date}`;
  const progressDocRef = doc(db, "progress", docId);

  const snapshot = await getDoc(progressDocRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}
