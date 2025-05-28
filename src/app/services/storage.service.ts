import { Injectable } from '@angular/core';
import { ref, uploadBytesResumable, getDownloadURL, UploadTask, getStorage } from 'firebase/storage';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storage = getStorage();

  // Subir un archivo a Firebase Storage con progreso
  uploadFileWithProgress(path: string, file: File): UploadTask {
    const storageRef = ref(this.storage, path);
    return uploadBytesResumable(storageRef, file);
  }

  // Obtener la URL de descarga de un archivo
  async getDownloadUrl(path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    return await getDownloadURL(storageRef);
  }

  /**
   * Sube un archivo y devuelve la URL pública de descarga.
   * Actualiza el progreso mediante el callback opcional.
   */
  async uploadImageAndGetUrl(path: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const storageRef = ref(this.storage, path);
    const task = uploadBytesResumable(storageRef, file);
    await new Promise<void>((resolve, reject) => {
      task.on('state_changed',
        (snapshot) => {
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          }
        },
        (error) => reject(error),
        () => resolve()
      );
    });
    return await getDownloadURL(storageRef);
  }

  /**
   * Sube una imagen a la galería del usuario, actualiza Firestore y retorna la galería actualizada.
   * Usa arrayUnion si está disponible para evitar duplicados y condiciones de carrera.
   */
  async uploadUserGalleryImage(
    userId: string,
    file: File,
    firebaseService: any,
    onProgress?: (progress: number) => void
  ): Promise<string[]> {
    const filePath = `usuarios/${userId}/gallery/${Date.now()}_${file.name}`;
    const downloadUrl = await this.uploadImageAndGetUrl(filePath, file, onProgress);
    // Intenta usar arrayUnion si está disponible
    if (firebaseService.arrayUnion) {
      await firebaseService.updateDocument(`usuarios/${userId}`, {
        gallery: firebaseService.arrayUnion(downloadUrl)
      });
      // Recarga la galería real desde Firestore
      const userDoc = await firebaseService.getDocument(`usuarios/${userId}`);
      return Array.isArray(userDoc?.gallery) ? userDoc.gallery : [];
    } else {
      // Fallback: recarga, agrega y actualiza (puede causar duplicados si hay concurrencia)
      const userDoc = await firebaseService.getDocument(`usuarios/${userId}`);
      let gallery: string[] = Array.isArray(userDoc?.gallery) ? userDoc.gallery : [];
      if (!gallery.includes(downloadUrl)) {
        gallery.push(downloadUrl);
        await firebaseService.updateDocument(`usuarios/${userId}`, { gallery });
      }
      return gallery;
    }
  }
}