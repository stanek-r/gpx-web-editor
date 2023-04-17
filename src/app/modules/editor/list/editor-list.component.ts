import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FileInfo, FileStorageService } from '../../../services/file-storage.service';
import { nanoid } from 'nanoid';
import { GpxModel } from '../../../shared/models/gpx.model';
import { MatDialog } from '@angular/material/dialog';
import { UploadComponent } from '../../upload/components/upload/upload.component';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from '../../../shared/components/error-dialog/error-dialog.component';

@Component({
  selector: 'app-editor-list',
  templateUrl: './editor-list.component.html',
  styleUrls: ['./editor-list.component.scss'],
})
export class EditorListComponent implements OnInit {
  pointGroups$!: Observable<FileInfo[] | null>;
  sharedPointGroups$!: Observable<FileInfo[] | null>;

  constructor(
    private readonly storageService: FileStorageService,
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
    }, 200);
  }

  removeGroup(id: string): void {
    this.dialog
      .open(ConfirmationDialogComponent, {
        minWidth: '35%',
        data: { title: 'Smazat soubor?', confirmButtonText: 'Smazat' },
      })
      .afterClosed()
      .subscribe(async (value) => {
        if (value) {
          this.storageService.removeFile(id);
        }
      });
  }

  uploadFile(): void {
    this.dialog
      .open(UploadComponent, {
        minWidth: '400px',
      })
      .afterClosed()
      .subscribe(async (value: GpxModel | string) => {
        if (value) {
          if (typeof value === 'string') {
            this.dialog.open(ErrorDialogComponent, {
              minWidth: '35%',
              data: { title: 'Nahrání souboru se nezdařilo', subTitle: value, confirmButtonText: 'Ok' },
            });
          } else {
            const id = nanoid(10);
            await this.storageService.saveFile(id, value);
            setTimeout(() => {
              this.router.navigate(['/editor', id]);
            }, 200);
          }
        }
      });
  }

  async exportToFile(id: string): Promise<void> {
    await this.storageService.exportToFile(id);
  }
}
