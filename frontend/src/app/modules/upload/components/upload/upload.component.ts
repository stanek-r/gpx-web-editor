import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {
  FirebaseService,
} from '../../../../services/firebase.service';
import firebase from 'firebase';
import User = firebase.User;
import { StorageService } from '../../../../services/storage.service';
import gpxParser from 'gpxparser';
import {MapData} from "../../../../shared/models/map.model";
import {nanoid} from "nanoid";
import {Router} from "@angular/router";

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnInit {
  uploading$?: Observable<number | undefined>;
  files$?: Observable<any[]>;
  user$?: Observable<User | null>;

  constructor(
    private readonly storageService: StorageService,
    private readonly firebaseService: FirebaseService,
    private readonly router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    this.user$ = this.firebaseService.getFireUser();
    // this.files$ = this.firebaseService.getFiles();
  }

  async onFileSelected(event: any): Promise<void> {
    // if (event.target?.files.length > 0) {
    //   const file = event.target.files[0];
    //   this.uploading$ = this.firebaseService.pushFileToStorage(file);
    // }
    if (event.target?.files.length > 0) {
      const file = event.target.files[0];
      const fileString = await this.readTextFile(file);
      if (fileString) {
        const waypoints = this.importFromFile(fileString);
        const id = nanoid(10);
        this.storageService.save(id, waypoints);
        alert('Saved');
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

  importFromFile(fileString: string): google.maps.LatLngLiteral[] {
    const gpx = new gpxParser();
    gpx.parse(fileString);

    console.log(gpx);

    return gpx.tracks[0].points.map((point) => {
      return {
        lat: point.lat,
        lng: point.lon,
      } as google.maps.LatLngLiteral;
    });
  }
}
