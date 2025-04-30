import { Tutor } from "./tutor";

export interface Usuario {
    name?: string;    // Nombre del usuario
    rut?: string;     // RUT del usuario
    email?: string;   // Correo electrónico del usuario
    password?: string; // Contraseña del usuario
    phone?: string;    // Teléfono del usuario
    address?: string;  // Dirección del usuario
    city?: string;     // Ciudad del usuario
    region?: string;   // Región del usuario
    country?: string;  // País del usuario
    birthDate?: string; // Fecha de nacimiento del usuario
    tutor?: Tutor; // Tutor del usuario
    sex?: string; // Sexo del usuario
    emergencyContact?: string; // Contacto de emergencia del usuario
    nacionality?: string; // Nacionalidad del usuario
    isplayer?: boolean; // Indica si el usuario es jugador
    isscouter?: boolean; // Indica si el usuario es cazatalentos
}