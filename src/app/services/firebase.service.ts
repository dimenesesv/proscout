import { AngularFirestore } from '@angular/fire/compat/firestore';
import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireModule } from '@angular/fire/compat';
import { Firestore, getFirestore, setDoc, doc ,getDoc} from '@angular/fire/firestore';
import { initializeApp } from '@angular/fire/app';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  firestore = inject(AngularFirestore);


  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }
  async getDocument(path: string): Promise<any> {
    return (await getDoc(doc(getFirestore(), path))).data();
  }
}