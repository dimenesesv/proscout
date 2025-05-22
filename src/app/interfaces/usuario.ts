import { Info } from "./info";
import { Stats } from "./stats";
import { Tutor } from "./tutor";
import { Scouter } from "./scouter";
import { GeoPoint } from 'firebase/firestore';

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
    ubicacion?: GeoPoint; // Ubicación georreferenciada en Firestore
    fotoPerfil?: string;      // URL de la foto de perfil del usuario
    galeria?: string[];      // Galería de fotos del usuario
    info?: Info;          // Información adicional del usuario
    stats?: Stats | undefined;         // Estadísticas del usuario
    scouter?: Scouter | undefined;         // Información del usuario como cazatalentos
}