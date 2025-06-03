import { Injectable } from '@angular/core';
import { Usuario } from '../interfaces/usuario';
import { GeoPoint } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  private usuario: Partial<Usuario> = {};

  constructor() {
    // Todos los usuarios nuevos quedan inactivos hasta verificación
    this.usuario.activo = false;
  }

  // Setters
  setNombre(nombre: string) {
    this.usuario.nombre = nombre;
  }
  setRut(rut: string) {
    this.usuario.rut = rut;
  }
  setCorreo(correo: string) {
    this.usuario.correo = correo;
  }
  setContrasena(contrasena: string) {
    this.usuario.contrasena = contrasena;
  }
  setTelefono(telefono: string) {
    this.usuario.telefono = telefono;
  }
  setDireccion(direccion: string) {
    this.usuario.direccion = direccion;
  }
  setCiudad(ciudad: string) {
    this.usuario.ciudad = ciudad;
  }
  setRegion(region: string) {
    this.usuario.region = region;
  }
  setPais(pais: string) {
    this.usuario.pais = pais;
  }
  setFechaNacimiento(fechaNacimiento: string) {
    this.usuario.fechaNacimiento = fechaNacimiento;
  }
  setSexo(sexo: string) {
    this.usuario.sexo = sexo;
  }
  setTutor(tutor: any) {
    // Asegura que los nombres de las propiedades estén en español y país sea 'Chile' por defecto
    this.usuario.tutor = {
      nombre: tutor.name || tutor.nombre || '',
      rut: tutor.rut,
      correo: tutor.email || tutor.correo || '',
      telefono: tutor.phone || tutor.telefono || '',
      direccion: tutor.address || tutor.direccion || '',
      comuna: tutor.comuna,
      ciudad: tutor.city || tutor.ciudad || '',
      region: tutor.region,
      pais: 'Chile',
      parentesco: tutor.parentesco || ''
    };
  }
  setContactoEmergencia(contactoEmergencia: string) {
    this.usuario.contactoEmergencia = contactoEmergencia;
  }
  setNacionalidad(nacionalidad: string) {
    this.usuario.nacionalidad = nacionalidad;
  }
  setEsJugador(esJugador: boolean) {
    this.usuario.esJugador = esJugador;
  }
  setEsScouter(esScouter: boolean) {
    this.usuario.esScouter = esScouter;
  }
  setUsuario(usuario: Usuario) {
    this.usuario = usuario;
  }
  setActivo(activo: boolean) {
    this.usuario.activo = activo;
  }

  // Getters
  getNombre() {
    return this.usuario.nombre;
  }
  getRut() {
    return this.usuario.rut;
  }
  getCorreo() {
    return this.usuario.correo;
  }
  getContrasena() {
    return this.usuario.contrasena;
  }
  getTelefono() {
    return this.usuario.telefono;
  }
  getDireccion() {
    return this.usuario.direccion;
  }
  getCiudad() {
    return this.usuario.ciudad;
  }
  getRegion() {
    return this.usuario.region;
  }
  getPais() {
    return this.usuario.pais;
  }
  getFechaNacimiento() {
    return this.usuario.fechaNacimiento;
  }
  getSexo() {
    return this.usuario.sexo;
  }
  getTutor() {
    return this.usuario.tutor;
  }
  getContactoEmergencia() {
    return this.usuario.contactoEmergencia;
  }
  getNacionalidad() {
    return this.usuario.nacionalidad;
  }
  getEsJugador() {
    return this.usuario.esJugador;
  }
  getEsScouter() {
    return this.usuario.esScouter;
  }
  getUsuario() {
    return this.usuario;
  }
  getUbicacion() {
    return this.usuario.ubicacion;
  }
  setUbicacion(latitud: number, longitud: number) {
    // Guarda la ubicación como un objeto GeoPoint de Firestore
    this.usuario.ubicacion = new GeoPoint(latitud, longitud);
  }
  getFotoPerfil() {
    return this.usuario.fotoPerfil;
  }
  setFotoPerfil(fotoPerfil: string) {
    this.usuario.fotoPerfil = fotoPerfil;
  }
  getGaleria() {
    return this.usuario.galeria;
  }
  getActivo() {
    return this.usuario.activo;
  }

}