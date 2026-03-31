import { storage } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

/**
 * Sube la foto de perfil del usuario a Firebase Storage y devuelve la URL pública.
 * - path: profilePhotos/{userId}/{timestamp}_{filename}
 * - onProgress (opcional) recibe un número 0-100
 */
export function uploadProfilePhoto(userId, file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file provided"));

    const safeName = `${Date.now()}_${file.name}`.replace(/\s+/g, "_");
    const storageRef = ref(storage, `profilePhotos/${userId}/${safeName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (snapshot && snapshot.totalBytes > 0) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (onProgress) onProgress(progress);
        }
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      },
    );
  });
}
