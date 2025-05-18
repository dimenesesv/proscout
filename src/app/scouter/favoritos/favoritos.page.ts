import { Component, OnInit } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, where, query } from 'firebase/firestore';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: false,
})
export class FavoritosPage implements OnInit {
  favoritos: any[] = [];

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return;

    const scouterDoc = doc(this.firestore, `usuarios/${user.uid}`);
    const scouterSnap = await getDoc(scouterDoc);

    if (scouterSnap.exists()) {
      const data = scouterSnap.data();
      const favoritosIds: string[] = data['favoritos'] || [];

      if (favoritosIds.length > 0) {
        const jugadoresQuery = query(
          collection(this.firestore, 'usuarios'),
          where('uid', 'in', favoritosIds)
        );

        const snapshot = await getDocs(jugadoresQuery);
        this.favoritos = snapshot.docs.map(doc => doc.data());
      }
    }
  }
}
