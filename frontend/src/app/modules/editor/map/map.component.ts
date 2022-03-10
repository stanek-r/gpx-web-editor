import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { google } from '@agm/core/services/google-maps-types';
import { isNil } from '@angular/fire/database/utils';

export interface MapData {
  start: google.maps.LatLngLiteral;
  end: google.maps.LatLngLiteral;
}

enum TravelMode {
  BICYCLING = 'BICYCLING',
  DRIVING = 'DRIVING',
  TRANSIT = 'TRANSIT',
  TWO_WHEELER = 'TWO_WHEELER',
  WALKING = 'WALKING',
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  readonly lat = 49.83815;
  readonly long = 18.2838842;
  readonly zoom = 10;
  readonly markerOptions = {
    origin: {
      opacity: 1.0,
      draggable: true,
    },
    destination: {
      opacity: 1.0,
      draggable: true,
    },
  };
  readonly renderOptions = {
    suppressMarkers: true,
  };
  readonly travelMode = TravelMode.WALKING;

  routes: MapData[] = [];

  @ViewChild('latitude') latInput!: ElementRef<HTMLInputElement>;
  @ViewChild('longtitude') lngInput!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.routes = this.convertPointsIntoRoutes(
      this.getPointsFromLocalStorage()
    );
    setInterval(
      () => this.savePointsToLocalStorage(this.convertRoutesIntoPoints()),
      5000
    );
  }

  markerDragStart($event: any, index: number): void {
    const lat: number = $event.lat();
    const lng: number = $event.lng();

    this.routes[index].start = { lat, lng };
    if (index > 0) {
      this.routes[index - 1].end = { lat, lng };
    }
  }

  markerDragEnd($event: any, index: number): void {
    const lat: number = $event.lat();
    const lng: number = $event.lng();

    this.routes[index].end = { lat, lng };
    if (index < this.routes.length - 1) {
      this.routes[index + 1].start = { lat, lng };
    }
  }

  getPointsFromLocalStorage(): google.maps.LatLngLiteral[] {
    return JSON.parse(localStorage.getItem('gpx_points') ?? '[]');
  }

  savePointsToLocalStorage(points: google.maps.LatLngLiteral[]): void {
    localStorage.setItem('gpx_points', JSON.stringify(points));
  }

  convertPointsIntoRoutes(points: google.maps.LatLngLiteral[]): MapData[] {
    const routes: MapData[] = [];
    let tmp = points[0];
    for (let i = 1; i < points.length; i++) {
      routes.push({
        start: tmp,
        end: points[i],
      });
      tmp = points[i];
    }
    return routes;
  }

  convertRoutesIntoPoints(): google.maps.LatLngLiteral[] {
    const points: google.maps.LatLngLiteral[] = [];
    for (const route of this.routes) {
      points.push(route.start);
    }
    points.push(this.routes[this.routes.length - 1].end);
    return points;
  }

  addPoint(): void {
    const newPoints = [
      {
        lat: +this.latInput.nativeElement.value,
        lng: +this.lngInput.nativeElement.value,
      },
    ];
    this.routes = this.convertPointsIntoRoutes([
      ...this.convertRoutesIntoPoints(),
      ...newPoints,
    ]);
  }

  removePoint(index?: number): void {
    const oldPoints = this.convertRoutesIntoPoints();
    if (index) {
      oldPoints.splice(index, 1);
    } else {
      oldPoints.pop();
    }
    this.routes = this.convertPointsIntoRoutes(oldPoints);
  }
}
