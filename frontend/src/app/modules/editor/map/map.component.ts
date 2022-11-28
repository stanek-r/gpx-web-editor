import {
  Component,
  OnInit,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {StorageV2Service} from "../../../services/storageV2.service";
import {GpxModel} from "../../../shared/models/gpx.model";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {

  fileToShow?: GpxModel;

  constructor(private readonly route: ActivatedRoute, private readonly storageService: StorageV2Service, private readonly router: Router,) {
  }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/editor']);
      return;
    }
    const file = await this.storageService.getFile(id);
    if (!file) {
      this.router.navigate(['/editor']);
      return;
    }
    this.fileToShow = file;
  }

  // readonly lat = 49.83815;
  // readonly long = 18.2838842;
  // readonly zoom = 10;
  // readonly markerOptions = {
  //   origin: {
  //     opacity: 1.0,
  //     draggable: true,
  //   },
  //   destination: {
  //     opacity: 1.0,
  //     draggable: true,
  //   },
  // };
  // readonly renderOptions = {
  //   suppressMarkers: true,
  // };
  // travelMode: TravelMode | undefined;
  //
  // routes: MapData[] = [];
  // id!: string;
  //
  // private interval: any;
  // private changed = false;
  //
  // backProject: string | null = null;
  //
  // @ViewChild('latitude') latInput!: ElementRef<HTMLInputElement>;
  // @ViewChild('longtitude') lngInput!: ElementRef<HTMLInputElement>;
  //
  // constructor(
  //   private readonly storageService: StorageService,
  //   private readonly route: ActivatedRoute,
  //   private readonly router: Router,
  // ) {}
  //
  // async ngOnInit(): Promise<void> {
  //   const id = this.route.snapshot.paramMap.get('id');
  //   this.backProject = this.route.snapshot.queryParamMap.get('backProject');
  //   if (!id) {
  //     this.router.navigate(['/editor']);
  //     return;
  //   } else {
  //     this.id = id;
  //   }
  //   const points = await this.storageService.getPointsByGroupId(id);
  //   if (points.length > 0) {
  //     this.routes = this.convertPointsIntoRoutes(points);
  //   } else {
  //     this.routes = this.convertPointsIntoRoutes(this.getDefaultRoute());
  //     this.storageService.save(this.id, this.convertRoutesIntoPoints());
  //   }
  //   this.interval = setInterval(() => {
  //     if (this.changed) {
  //       this.storageService.save(this.id, this.convertRoutesIntoPoints());
  //       this.changed = false;
  //     }
  //   }, 1000);
  // }
  //
  // ngOnDestroy(): void {
  //   clearInterval(this.interval);
  // }
  //
  // markerDragStart($event: any, index: number): void {
  //   const lat: number = $event.coords.lat;
  //   const lng: number = $event.coords.lng;
  //
  //   this.routes[index].start = { lat, lng };
  //   if (index > 0) {
  //     this.routes[index - 1].end = { lat, lng };
  //   }
  //   this.changed = true;
  // }
  //
  // markerDragEnd($event: any, index: number): void {
  //   const lat: number = $event.coords.lat;
  //   const lng: number = $event.coords.lng;
  //
  //   this.routes[index].end = { lat, lng };
  //   if (index < this.routes.length - 1) {
  //     this.routes[index + 1].start = { lat, lng };
  //   }
  //   this.changed = true;
  // }
  //
  // convertPointsIntoRoutes(points: google.maps.LatLngLiteral[]): MapData[] {
  //   const routes: MapData[] = [];
  //   let tmp = points[0];
  //   for (let i = 1; i < points.length; i++) {
  //     routes.push({
  //       start: tmp,
  //       end: points[i],
  //     });
  //     tmp = points[i];
  //   }
  //   return routes;
  // }
  //
  // convertRoutesIntoPoints(): google.maps.LatLngLiteral[] {
  //   const points: google.maps.LatLngLiteral[] = [];
  //   if (this.routes.length > 0) {
  //     for (const route of this.routes) {
  //       points.push(route.start);
  //     }
  //     points.push(this.routes[this.routes.length - 1].end);
  //   }
  //   return points;
  // }
  //
  // addPoint(): void {
  //   const newPoints = [
  //     {
  //       lat: +this.latInput.nativeElement.value,
  //       lng: +this.lngInput.nativeElement.value,
  //     },
  //   ];
  //   const oldPoints = this.convertRoutesIntoPoints();
  //   if (oldPoints.length === 0) {
  //     oldPoints.push(newPoints[0]);
  //   }
  //   this.routes = this.convertPointsIntoRoutes([...oldPoints, ...newPoints]);
  //   this.changed = true;
  // }
  //
  // removePoint(index?: number): void {
  //   const oldPoints = this.convertRoutesIntoPoints();
  //   if (index) {
  //     oldPoints.splice(index, 1);
  //   } else {
  //     oldPoints.pop();
  //   }
  //   this.routes = this.convertPointsIntoRoutes(oldPoints);
  //   this.changed = true;
  // }
  //
  // getDefaultRoute(): any {
  //   return [
  //     {
  //       lat: 49.84079607910464,
  //       lng: 18.280282526428223,
  //     },
  //     {
  //       lat: 49.83933753799882,
  //       lng: 18.28155267354127,
  //     },
  //   ];
  // }
  //
  // save(): void {
  //   this.storageService.save(this.id, this.convertRoutesIntoPoints());
  // }
}
