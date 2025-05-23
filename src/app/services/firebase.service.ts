import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Injectable, Inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(@Inject(Firestore) private firestore: Firestore) {}

  async setDocument(path: string, data: any): Promise<void> {
    try {
      console.log('[FirebaseService] setDocument path:', path, 'data:', data);
      const ref = doc(this.firestore, path);
      await setDoc(ref, data);
      console.log('[FirebaseService] Documento guardado correctamente en:', path);
    } catch (error: any) {
      console.error('Error al establecer el documento:', error);
      alert('Ocurrió un error al guardar el documento. Por favor, inténtalo de nuevo.');
    }
  }

  async getDocument(path: string): Promise<any> {
    try {
      console.log('[FirebaseService] Intentando leer documento en:', path);
      const platform = Capacitor.getPlatform();

      if (platform === 'ios' || platform === 'android') {
        const { token } = await FirebaseAuthentication.getIdToken();
        const [collection, docId] = path.split('/');
        const projectId = 'proscout-dd0b6'; // Cambia si tu ID es distinto
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        const data = await res.json();
        // Simplificado: solo convierte los fields básicos
        const fields = data.fields || {};
        const parsed: any = {};
        for (const k in fields) {
          const v = fields[k];
          parsed[k] = v?.stringValue ?? v?.booleanValue ?? v?.integerValue ?? null;
        }
        return parsed;
      } else {
        const ref = doc(this.firestore, path);
        const snapshot = await getDoc(ref);
        return snapshot.exists() ? snapshot.data() : null;
      }
    } catch (error: any) {
      console.error('[FirebaseService] Error al obtener el documento:', error);
      alert('Ocurrió un error al obtener el documento. Por favor, inténtalo de nuevo.');
      return null;
    }
  }

  async getCollection(collectionPath: string): Promise<any[]> {
    try {
      console.log('[FirebaseService] getCollection INICIO', collectionPath);
      const platform = Capacitor.getPlatform();
      if (platform === 'ios' || platform === 'android') {
        // Intenta obtener el token, pero si falla, prueba sin autenticación (modo público)
        let token = '';
        try {
          const res = await FirebaseAuthentication.getIdToken();
          token = res.token;
        } catch (err) {
          console.warn('[FirebaseService] getCollection: No se pudo obtener token, intentando sin auth', err);
        }
        const projectId = 'proscout-dd0b6';
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionPath}`;
        const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        const data = await res.json();
        if (!data.documents) return [];
        const docs = data.documents.map((doc: any) => {
          const fields = doc.fields || {};
          const parsed: any = { id: doc.name.split('/').pop() };
          for (const k in fields) {
            const v = fields[k];
            if (v.geoPointValue) parsed[k] = v.geoPointValue;
            else if (v.stringValue !== undefined) parsed[k] = v.stringValue;
            else if (v.integerValue !== undefined) parsed[k] = Number(v.integerValue);
            else if (v.doubleValue !== undefined) parsed[k] = Number(v.doubleValue);
            else if (v.booleanValue !== undefined) parsed[k] = v.booleanValue;
            else if (v.arrayValue) parsed[k] = v.arrayValue.values || [];
            else if (v.mapValue) parsed[k] = v.mapValue.fields || {};
            else parsed[k] = null;
          }
          return parsed;
        });
        console.log('[FirebaseService] getCollection OK', docs);
        return docs;
      } else {
        const { collection, getDocs } = await import('@angular/fire/firestore');
        const col = collection(this.firestore, collectionPath);
        const snapshot = await getDocs(col);
        const docs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        console.log('[FirebaseService] getCollection OK', docs);
        return docs;
      }
    } catch (error: any) {
      console.error('[FirebaseService] getCollection ERROR', error);
      return [];
    }
  }

  async updateDocument(path: string, data: any): Promise<void> {
    try {
      console.log('[FirebaseService] updateDocument path:', path, 'data:', data);
      const ref = doc(this.firestore, path);
      await updateDoc(ref, data);
      console.log('[FirebaseService] Documento actualizado correctamente en:', path);
    } catch (error: any) {
      console.error('Error al actualizar el documento:', error);
      alert('Ocurrió un error al actualizar el documento. Por favor, inténtalo de nuevo.');
    }
  }
}