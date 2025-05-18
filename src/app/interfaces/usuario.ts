import { Tutor } from "./tutor";

export interface Usuario {
    nombre?: string;           // Nombre del usuario
    rut?: string;              // RUT del usuario
    correo?: string;           // Correo electrónico del usuario
    contrasena?: string;       // Contraseña del usuario
    telefono?: string;         // Teléfono del usuario
    direccion?: string;        // Dirección del usuario
    ciudad?: string;           // Ciudad del usuario
    region?: string;           // Región del usuario
    pais?: string;             // País del usuario
    fechaNacimiento?: string;  // Fecha de nacimiento del usuario
    tutor?: Tutor;             // Tutor del usuario
    sexo?: string;             // Sexo del usuario
    contactoEmergencia?: string; // Contacto de emergencia del usuario
    nacionalidad?: string;     // Nacionalidad del usuario
    esJugador?: boolean;       // Indica si el usuario es jugador
    esScouter?: boolean;  // Indica si el usuario es cazatalentos
}