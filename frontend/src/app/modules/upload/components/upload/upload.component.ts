import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import firebase from 'firebase';
import User = firebase.User;
import gpxParser from 'gpxparser';
import { Router } from '@angular/router';
import { StorageV2Service } from '../../../../services/storageV2.service';
import { FirebaseV2Service } from '../../../../services/firebaseV2.service';
import { GpxModel } from '../../../../shared/models/gpx.model';
import { nanoid } from 'nanoid';
import {
  mapToGpxMetadata,
  mapToGpxTrackOrRoute,
  mapToGpxWaypoint,
} from '../../../../shared/gpx.mapper';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnInit {
  user$?: Observable<User | null>;

  constructor(
    private readonly router: Router,
    private readonly firebaseService: FirebaseV2Service,
    private readonly storageService: StorageV2Service
  ) {}

  ngOnInit(): void {
    this.user$ = this.firebaseService.getFireUser();
  }

  async onFileSelected(event: any): Promise<void> {
    if (event.target?.files.length > 0) {
      const file = event.target.files[0];
      const fileString = await this.readTextFile(file);
      if (fileString) {
        const gpxFileData = this.importFromFile(fileString);
        const id = nanoid(10);
        await this.storageService.saveFile(id, gpxFileData);
        this.router.navigate(['/editor']);
      }
    }
  }

  async readTextFile(file: any): Promise<string | undefined> {
    return new Promise<string | undefined>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = reader.result?.toString().trim();
        resolve(text);
      };
      reader.readAsText(file);
    });
  }

  importFromFile(fileString: string): GpxModel {
    const gpx = new gpxParser();
    gpx.parse(fileString);

    const routes = gpx.routes.map((r) => mapToGpxTrackOrRoute(r));
    const tracks = gpx.tracks.map((t) => mapToGpxTrackOrRoute(t));

    return {
      metadata: mapToGpxMetadata(gpx.metadata),
      waypoints: gpx.waypoints.map((w) => mapToGpxWaypoint(w)),
      routes,
      tracks,
    };
  }
}
