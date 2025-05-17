import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { getAuth } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}