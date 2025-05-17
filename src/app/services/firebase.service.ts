import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(private afs: AngularFirestore) {}

  // Función para establecer un documento
  async setDocument(path: string, data: any): Promise<void> {
    try {
      await this.afs.doc(path).set(data);
    } catch (error: any) {
      console.error('Error al establecer el documento:', error);
      alert('Ocurrió un error al guardar el documento. Por favor, inténtalo de nuevo.');
    }
  }

  // Función para obtener un documento
  async getDocument(path: string): Promise<any> {
    try {
      console.log('[FirebaseService] Intentando leer documento en:', path);
      const snapshot = await firstValueFrom(this.afs.doc(path).get());
      console.log('[FirebaseService] Documento existe:', snapshot.exists);
      console.log('[FirebaseService] Documento completo:', snapshot);
      console.log('[FirebaseService] Datos:', snapshot.data());
      return snapshot?.data() ?? null;
    } catch (error: any) {
      console.error('Error al obtener el documento:', error);
      if (error.code === 'unavailable') {
        alert('No se pudo obtener el documento porque estás sin conexión.');
      } else {
        alert('Ocurrió un error al obtener el documento. Por favor, inténtalo de nuevo.');
      }
      return null;
    }
  }

  // Función para actualizar un documento
  async updateDocument(path: string, data: any): Promise<void> {
    try {
      await this.afs.doc(path).update(data);
    } catch (error: any) {
      console.error('Error al actualizar el documento:', error);
      alert('Ocurrió un error al actualizar el documento. Por favor, inténtalo de nuevo.');
    }
  }
}