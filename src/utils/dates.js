/**
 * Devuelve la fecha de hoy en formato YYYY-MM-DD
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Convierte una fecha "YYYY-MM-DD" en un objeto Date.
 * Si hay algún problema con el formato, devuelve null.
 */
export function parseDateFromString(dateString) {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-");
  if (!year || !month || !day) return null;
  return new Date(Number(year), Number(month) - 1, Number(day));
}