export function validarRut(control: any) {
  let rut = control.value;
  if (!rut) return null;
  rut = rut.replace(/\s+/g, '').replace(/-/g, '');
  const rutPattern = /^\d{7,8}[0-9kK]$/;
  if (!rutPattern.test(rut)) {
    return { rutInvalido: true };
  }
  const rutSinDV = rut.slice(0, -1);
  const dv = rut.slice(-1).toUpperCase();
  let suma = 0;
  let multiplicador = 2;
  for (let i = rutSinDV.length - 1; i >= 0; i--) {
    suma += parseInt(rutSinDV[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const dvCalculado = 11 - (suma % 11);
  const dvEsperado = dvCalculado === 10 ? 'K' : dvCalculado === 11 ? '0' : dvCalculado.toString();
  if (dv !== dvEsperado) {
    return { rutInvalido: true };
  }
  return null;
}