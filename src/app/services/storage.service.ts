import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private storage: AngularFireStorage) {}

  // Subir un archivo a Firebase Storage
  async uploadFile(path: string, file: File): Promise<string> {
    const fileRef = this.storage.ref(path);
    const task = this.storage.upload(path, file);

    return new Promise((resolve, reject) => {
      task
        .snapshotChanges()
        .pipe(
          finalize(async () => {
            try {
              const downloadUrl = await fileRef.getDownloadURL().toPromise();
              resolve(downloadUrl);
            } catch (error) {
              reject(error);
            }
          })
        )
        .subscribe();
    });
  }
}