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
}