import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  title = 'firstApp';

  lat = 22.4064172;
  long = 69.0750171;
  zoom = 7;

  markLat = 21.1594627;
  markLng = 72.6822083;

  markerDragEnd($event: any): void {
    console.log($event);
    this.markLat = $event.coords.lat;
    this.markLng = $event.coords.lng;
  }

  printMarkerInfo(): void {
    console.log(this.markLat);
    console.log(this.markLng);
  }
}
