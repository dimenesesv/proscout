import { Injectable } from '@angular/core';
import { doc, getDoc, getFirestore, setDoc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private readonly firestore = getFirestore(); // Instancia de Firestore
  private readonly path = 'usuarios/KH661jqP2qPPhmbR4ZAMuc6bz032'; // Path del documento

  // Función para establecer un documento
  async setDocument(path: string, data: any): Promise<void> {
    try {
      await setDoc(doc(this.firestore, path), data); // Agrega o actualiza el documento
    } catch (error: any) {
      console.error('Error al establecer el documento:', error);
      alert('Ocurrió un error al guardar el documento. Por favor, inténtalo de nuevo.');
    }
  }

  // Función para obtener un documento
  async getDocument(path: string): Promise<any> {
    try {
      const snapshot = await getDoc(doc(this.firestore, path));
      return snapshot.exists() ? snapshot.data() : null; // Retorna los datos si existen
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
      await updateDoc(doc(this.firestore, path), data);
    } catch (error: any) {
      console.error('Error al actualizar el documento:', error);
      alert('Ocurrió un error al actualizar el documento. Por favor, inténtalo de nuevo.');
    }
  }

  
}