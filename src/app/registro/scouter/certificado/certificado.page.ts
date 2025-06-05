import { Component } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Router } from '@angular/router';
import { getAuth } from 'firebase/auth';

@Component({
  selector: 'app-certificado',
  templateUrl: './certificado.page.html',
  styleUrls: ['./certificado.page.scss'],
  standalone: false,
})
export class CertificadoPage {
  uploadProgress: number | null = null;
  certificadoUrl: string | null = null;
  isUploading = false;
  errorMsg: string | null = null;

  constructor(
    private storageService: StorageService,
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    this.isUploading = true;
    this.uploadProgress = 0;
    this.errorMsg = null;
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('No autenticado');
      const userId = user.uid;
      const ext = file.name.split('.').pop();
      const path = `usuarios/${userId}/documents/certificado.${ext}`;
      const url = await this.storageService.uploadImageAndGetUrl(path, file, (progress) => {
        this.uploadProgress = progress;
      });
      this.certificadoUrl = url;
      // Opcional: guardar la URL en el perfil del scouter en Firestore
      await this.firebaseService.updateDocument(`usuarios/${userId}`, { 'scouter.certificadoUrl': url });
      this.isUploading = false;
      // Feedback visual
      alert('¡Certificado subido correctamente!');
      this.router.navigate(['registro/bienvenida']);
    } catch (err: any) {
      this.errorMsg = err.message || 'Error al subir el certificado';
      this.isUploading = false;
      alert(this.errorMsg);
    }
  }
}
