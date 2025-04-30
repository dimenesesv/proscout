import { Injectable } from '@angular/core';
import { Usuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  private usuario: Partial<Usuario> = {};

  constructor() {}

  setNombre(name: string) {
    this.usuario.name = name;
  }
  setRut(rut: string) {
    this.usuario.rut = rut;
  }
  setEmail(email: string) {
    this.usuario.email = email;
  }
  setPassword(password: string) {
    this.usuario.password = password;
  }
  setPhone(phone: string) {
    this.usuario.phone = phone;
  }
  setAddress(address: string) {
    this.usuario.address = address;
  }
  setCity(city: string) {
    this.usuario.city = city;
  }
  setRegion(region: string) {
    this.usuario.region = region;
  }
  setCountry(country: string) {
    this.usuario.country = country;
  }
  setBirthDate(birthDate: string) {
    this.usuario.birthDate = birthDate;
  }
  setSex(sex: string) {
    this.usuario.sex = sex;
  }
  setTutor(tutor: any) {
    this.usuario.tutor = tutor;
  }
  setEmergencyContact(emergencyContact: string) {
    this.usuario.emergencyContact = emergencyContact;
  }
  setNacionality(nacionality: string) {
    this.usuario.nacionality = nacionality;
  }
  setIsPlayer(isplayer: boolean) {
    this.usuario.isplayer = isplayer;
  }
  setIsScouter(isscouter: boolean) {
    this.usuario.isscouter = isscouter;
  }
  setUsuario(usuario: Usuario) {
    this.usuario = usuario;
  }
  getNombre() {
    return this.usuario.name;
  }
  getRut() {
    return this.usuario.rut;
  }
  getEmail() {
    return this.usuario.email;
  }
  getPassword() {
    return this.usuario.password;
  }
  getPhone() {
    return this.usuario.phone;
  }
  getAddress() {
    return this.usuario.address;
  }
  getCity() {
    return this.usuario.city;
  }
  getRegion() {
    return this.usuario.region;
  }
  getCountry() {
    return this.usuario.country;
  }
  getBirthDate() {
    return this.usuario.birthDate;
  }
  getTutor() {
    return this.usuario.tutor;
  }
  getSex() {
    return this.usuario.sex;
  }
  getEmergencyContact() {
    return this.usuario.emergencyContact;
  }
  getNacionality() {
    return this.usuario.nacionality;
  }
  getIsPlayer() {
    return this.usuario.isplayer;
  }
  getIsScouter() {
    return this.usuario.isscouter;
  }

  getUsuario() {
    return this.usuario;
  }
}