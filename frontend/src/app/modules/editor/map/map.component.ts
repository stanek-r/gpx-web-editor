import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MapData, TravelMode } from '../../../shared/models/map.model';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../services/storage.service';

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
  id!: string;

  @ViewChild('latitude') latInput!: ElementRef<HTMLInputElement>;
  @ViewChild('longtitude') lngInput!: ElementRef<HTMLInputElement>;

  constructor(
    private readonly storageService: StorageService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/editor']);
      return;
    } else {
      this.id = id;
    }
    const points = this.storageService.getPointsByGroupId(id);
    if (points.length > 0) {
      this.routes = this.convertPointsIntoRoutes(points);
    } else {
      this.routes = this.convertPointsIntoRoutes(this.getDefaultRoute());
      this.storageService.save(this.id, this.convertRoutesIntoPoints());
    }
    setInterval(
      () => this.storageService.save(this.id, this.convertRoutesIntoPoints()),
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
    if (this.routes.length > 0) {
      for (const route of this.routes) {
        points.push(route.start);
      }
      points.push(this.routes[this.routes.length - 1].end);
    }
    return points;
  }

  addPoint(): void {
    const newPoints = [
      {
        lat: +this.latInput.nativeElement.value,
        lng: +this.lngInput.nativeElement.value,
      },
    ];
    const oldPoints = this.convertRoutesIntoPoints();
    if (oldPoints.length === 0) {
      oldPoints.push(newPoints[0]);
    }
    this.routes = this.convertPointsIntoRoutes([...oldPoints, ...newPoints]);
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

  getDefaultRoute(): any {
    return [
      {
        lat: 49.84079607910464,
        lng: 18.280282526428223,
      },
      {
        lat: 49.83933753799882,
        lng: 18.28155267354127,
      },
    ];
  }

  save(): void {
    this.storageService.save(this.id, this.convertRoutesIntoPoints());
  }
}
