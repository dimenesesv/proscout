export interface Notificacion {
    id: string;  // ID único de la notificación
    tipo: 'mensaje' | 'alerta' | 'recordatorio'| 'tarea'| 'actividad';  // Tipo de notificación
    contenido: string;  // Contenido de la notificación
    fecha: Date;  // Fecha de creación de la notificación
    leida: boolean;  // Indica si la notificación ha sido leída
    remitenteId?: string;  // ID del remitente (opcional, si aplica)
    destinatarioId?: string;  // ID del destinatario (opcional, si aplica)
    prioridad?: 'baja' | 'media' | 'alta';  // Prioridad de la notificación (opcional)
};