import { google } from '@agm/core/services/google-maps-types';

export interface MapData {
  start: google.maps.LatLngLiteral;
  end: google.maps.LatLngLiteral;
}

export enum TravelMode {
  BICYCLING = 'BICYCLING',
  DRIVING = 'DRIVING',
  TRANSIT = 'TRANSIT',
  TWO_WHEELER = 'TWO_WHEELER',
  WALKING = 'WALKING',
}
