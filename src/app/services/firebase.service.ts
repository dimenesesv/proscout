import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(private firestore: Firestore) {}

  async setDocument(path: string, data: any): Promise<void> {
    try {
      const ref = doc(this.firestore, path);
      await setDoc(ref, data);
    } catch (error: any) {
      console.error('Error al establecer el documento:', error);
      alert('Ocurrió un error al guardar el documento. Por favor, inténtalo de nuevo.');
    }
  }

  async getDocument(path: string): Promise<any> {
    try {
      console.log('[FirebaseService] Intentando leer documento en:', path);
      const ref = doc(this.firestore, path);
      const snapshot = await getDoc(ref);
      console.log('[FirebaseService] Documento existe:', snapshot.exists());
      console.log('[FirebaseService] Documento completo:', snapshot);
      console.log('[FirebaseService] Datos:', snapshot.data());
      return snapshot.exists() ? snapshot.data() : null;
    } catch (error: any) {
      console.error('Error al obtener el documento:', error);
      alert('Ocurrió un error al obtener el documento. Por favor, inténtalo de nuevo.');
      return null;
    }
  }

  async updateDocument(path: string, data: any): Promise<void> {
    try {
      const ref = doc(this.firestore, path);
      await updateDoc(ref, data);
    } catch (error: any) {
      console.error('Error al actualizar el documento:', error);
      alert('Ocurrió un error al actualizar el documento. Por favor, inténtalo de nuevo.');
    }
  }
}