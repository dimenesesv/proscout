export interface AutocompleteResult {
  description: string;
  place_id: string;
}

export function getGoogleAutocompleteService(): any | null {
  if ((window as any).google && (window as any).google.maps) {
    return new (window as any).google.maps.places.AutocompleteService();
  }
  return null;
}

export function getGooglePlaceService(): any | null {
  if ((window as any).google && (window as any).google.maps) {
    const map = document.createElement('div');
    return new (window as any).google.maps.places.PlacesService(map);
  }
  return null;
}

export function autocompletarDireccion(
  input: string,
  callback: (suggestions: AutocompleteResult[]) => void,
  country: string = 'cl'
) {
  const autocompleteService = getGoogleAutocompleteService();
  if (input && input.length > 2 && autocompleteService) {
    autocompleteService.getPlacePredictions({
      input,
      componentRestrictions: { country },
      types: ['address']
    }, (predictions: any[], status: any) => {
      if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
        callback(predictions.map(p => ({ description: p.description, place_id: p.place_id })));
      } else {
        callback([]);
      }
    });
  } else {
    callback([]);
  }
}

export function obtenerDetallesDireccion(
  placeId: string,
  callback: (result: { comuna: string; city: string; region: string }) => void
) {
  const placeService = getGooglePlaceService();
  if (placeService) {
    placeService.getDetails({ placeId }, (place: any, status: any) => {
      let comuna = '';
      let city = '';
      let region = '';
      if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place && place.address_components) {
        for (const comp of place.address_components) {
          if (comp.types.includes('locality')) comuna = comp.long_name;
          if (comp.types.includes('administrative_area_level_2')) city = comp.long_name;
          if (comp.types.includes('administrative_area_level_1')) region = comp.long_name;
        }
      }
      callback({ comuna, city, region });
    });
  } else {
    callback({ comuna: '', city: '', region: '' });
  }
}