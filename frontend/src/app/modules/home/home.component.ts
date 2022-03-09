import { Component, OnInit } from '@angular/core';
import { google } from '@agm/core/services/google-maps-types';

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
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  title = 'firstApp';

  lat = 49.83815;
  long = 18.2838842;
  zoom = 1;

  points: google.maps.LatLngLiteral[] = [
    {
      lat: 49.8292228,
      lng: 18.2772325,
    },
    {
      lat: 49.83815,
      lng: 18.2838842,
    },
    {
      lat: 49.8375106,
      lng: 18.2963386,
    },
    {
      lat: 49.8315278,
      lng: 18.3043842,
    },
  ];

  routes: MapData[] = [];

  markerOptions = {
    origin: {
      opacity: 1.0,
      draggable: true,
    },
    destination: {
      opacity: 1.0,
      draggable: true,
    },
  };

  renderOptions = {
    suppressMarkers: true,
  };

  travelMode: any = TravelMode.WALKING;

  ngOnInit(): void {
    let tmp = this.points[0];
    for (let i = 1; i < this.points.length; i++) {
      this.routes.push({
        start: tmp,
        end: this.points[i],
      });
      tmp = this.points[i];
    }
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
  printTrace(): void {
    console.log(this.routes);
  }
}
