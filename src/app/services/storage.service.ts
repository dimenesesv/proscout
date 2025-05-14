import { Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private storage: AngularFireStorage) {}

  // Subir un archivo a Firebase Storage con progreso
  uploadFileWithProgress(path: string, file: File): AngularFireUploadTask {
    return this.storage.upload(path, file);
  }

  // Obtener la URL de descarga de un archivo
  async getDownloadUrl(path: string): Promise<string> {
    const fileRef = this.storage.ref(path);
    return fileRef.getDownloadURL().toPromise();
  }
}