import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      take(1), // Tomar solo el primer valor
      map((user) => !!user), // Convertir el estado del usuario en un booleano
      tap((isLoggedIn) => {
        if (!isLoggedIn) {
          this.router.navigate(['/login']); // Redirigir al login si no está autenticado
        }
      })
    );
  }
}