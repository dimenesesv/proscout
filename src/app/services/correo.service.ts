import { Injectable } from '@angular/core';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

@Injectable({ providedIn: 'root' })
export class CorreoService {
  async enviarCorreoContacto(destinatario: string, asunto: string, mensaje: string): Promise<any> {
    console.log('[CorreoService] Preparando envío de correo:', { destinatario, asunto, mensaje });
    const functions = getFunctions(getApp());
    const enviarCorreo = httpsCallable(functions, 'enviarCorreoContacto');
    try {
      const result = await enviarCorreo({ destinatario, asunto, mensaje });
      console.log('[CorreoService] Correo enviado correctamente:', result.data);
      return result.data;
    } catch (error: any) {
      console.error('[CorreoService] Error al enviar correo:', error);
      throw error;
    }
  }
}
