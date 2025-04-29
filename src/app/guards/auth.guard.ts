import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      take(1),
      map(user => !!user), // true si hay usuario, false si no
      tap(isLoggedIn => {
        if (!isLoggedIn) {
          console.log('Usuario no logueado → redirigiendo al login');
          this.router.navigate(['/login']);
        }
      })
    );
  }
}