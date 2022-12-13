import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {
  PointGroupInfo,
  StorageV2Service,
} from '../../../services/storageV2.service';
import { nanoid } from 'nanoid';
import { GpxModel } from '../../../shared/models/gpx.model';

// @ts-ignore
import createGpx from 'gps-to-gpx';
import { MatDialog } from '@angular/material/dialog';
import { UploadComponent } from '../../upload/components/upload/upload.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editor-list',
  templateUrl: './editor-list.component.html',
  styleUrls: ['./editor-list.component.scss'],
})
export class EditorListComponent implements OnInit {
  pointGroups$!: Observable<PointGroupInfo[] | null>;
  sharedPointGroups$!: Observable<PointGroupInfo[] | null>;

  constructor(
    private readonly storageService: StorageV2Service,
    private readonly dialog: MatDialog,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.pointGroups$ = this.storageService.getListOfFiles();
    this.sharedPointGroups$ = this.storageService.getListOfSharedFiles();
  }

  async addNewGroup(): Promise<void> {
    const id = nanoid(10);
    // @ts-ignore
    await this.storageService.saveFile(id, {
      permissionData: {},
      metadata: {
        name: 'Soubor ' + id,
        link: null,
        desc: null,
        time: new Date(),
        author: null,
      },
      routes: [],
      tracks: [],
      waypoints: [],
    } as GpxModel);

    setTimeout(() => {
      this.router.navigate(['/editor', id]);
    }, 100);
  }

  removeGroup(id: string): void {
    this.storageService.removeFile(id);
  }

  uploadFile(): void {
    this.dialog
      .open(UploadComponent, {
        width: '400px',
      })
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.router.navigate(['/editor', value]);
        }
      });
  }

  async exportToFile(id: string): Promise<void> {
    await this.storageService.exportToFile(id);
  }
}
