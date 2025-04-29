import { Injectable } from '@angular/core';
import { doc, getDoc, getFirestore, setDoc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  firestore = getFirestore(); // Instancia de Firestore
  readonly path = 'usuarios/KH661jqP2qPPhmbR4ZAMuc6bz032'; // Path del documento

  // Función para establecer un documento
  setDocument(path: string, data: any) {
    return setDoc(doc(this.firestore, path), data);  // Agrega o actualiza el documento
  }

  // Función para obtener un documento
  async getDocument(path: string): Promise<any> {
    try {
      const snapshot = await getDoc(doc(this.firestore, path));
      return snapshot.exists() ? snapshot.data() : null;  // Retorna los datos si existen
    } catch (error: any) {
      console.error('Error al obtener el documento:', error);
      if (error.code === 'unavailable') {
        alert('No se pudo obtener el documento porque estás sin conexión.');
      }
      return null;
    }
  }

  // Función para actualizar un documento
  updateDocument(path: string, data: any) {
    return updateDoc(doc(this.firestore, path), data);
  }
}