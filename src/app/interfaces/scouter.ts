export interface Scouter {   
    anosExperiencia?: number ;
    equipoActual?: string ;
    idiomas?: string[] ;
    especialidad?: string;         // Área en la que se enfoca (juvenil, profesional, etc.)
    clubActual?: string;           // Club/organización en la que trabaja actualmente
    jugadoresVistos?: number;      // Cantidad de jugadores evaluados o vistos
    regionesQueCubre?: string[];   // Zonas o regiones donde suele hacer scouting
    aceptaVideos?: boolean;        // ¿Acepta scouting remoto mediante videos?
    activo?: boolean;              // ¿Está activo en la plataforma actualmente?
    ratingPromedio?: number;       // Calificación promedio que recibe de jugadores u otros
    modoTrabajo?: 'Presencial' | 'Remoto' | 'Ambos';
    estadoActual?: 'Disponible' | 'Viendo jugadores' | 'Ocupado';
    favoritos?: string[];
}
