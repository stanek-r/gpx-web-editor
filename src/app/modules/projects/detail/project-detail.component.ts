import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PointGroupInfo, StorageService } from '../../../services/storage.service';
import { FirebaseService } from '../../../services/firebase.service';
import { GpxModel } from '../../../shared/models/gpx.model';
import { Project } from '../../../shared/models/project.model';
import { take } from 'rxjs/operators';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { UploadComponent } from '../../upload/components/upload/upload.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
})
export class ProjectDetailComponent implements OnInit {
  projectToShow?: Project;
  gpxFiles: GpxModel[] = [];

  pointGroups$ = new BehaviorSubject<PointGroupInfo[] | null>(null);

  fg = this.fb.group({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl(''),
    userIds: new FormControl(''),
  });
  changed = false;

  addFileToProjectInput = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly storageService: StorageService,
    private readonly firebaseService: FirebaseService,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly fb: FormBuilder
  ) {}

  async ngOnInit(): Promise<void> {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId) {
      this.router.navigate(['/projects']);
      return;
    }
    await this.storageService.waitUntilLoaded();
    this.firebaseService
      .getProject(projectId)
      .pipe(take(1))
      .subscribe(async (project) => {
        if (!project) {
          this.router.navigate(['/projects']);
          return;
        }
        this.projectToShow = {
          id: project.id,
          name: project.name ?? '',
          description: project.description ?? '',
          gpxFileIds: project.gpxFileIds ?? [],
          userIds: project.userIds ?? [],
        };
        this.fg.controls.name.setValue(project.name);
        this.fg.setValue({
          name: project.name ?? '',
          description: project.description ?? '',
          userIds: project.userIds?.join(',') ?? [],
        });

        this.fg.valueChanges.subscribe(() => {
          if (this.fg.controls.name.dirty || this.fg.controls.description.dirty || this.fg.controls.userIds.dirty) {
            this.changed = true;
          }
        });

        this.fetchFiles();
      });
  }

  async fetchFiles(): Promise<void> {
    this.gpxFiles = [];
    if (!this.projectToShow) {
      return;
    }
    const newFiles = [];
    for (const gpxFileId of this.projectToShow.gpxFileIds) {
      const file = await this.storageService.getFile(gpxFileId);
      if (file) {
        this.gpxFiles?.push(file);
        newFiles.push(gpxFileId);
      }
    }
    this.projectToShow.gpxFileIds = newFiles;
    await this.saveChanges();
    this.fetchPointGroups();
  }

  fetchPointGroups(): void {
    const pointGroups = this.storageService.getListOfFilesValue();
    this.pointGroups$.next(
      !pointGroups ? null : pointGroups.filter((spg) => !this.projectToShow?.gpxFileIds.includes(spg.id))
    );
  }

  async saveChanges(): Promise<void> {
    if (!this.projectToShow) {
      return;
    }
    this.changed = false;
    await this.firebaseService.saveProject(this.projectToShow.id, {
      id: this.projectToShow.id,
      name: this.fg.value.name ?? '',
      description: this.fg.value.description ?? '',
      userIds: this.projectToShow.userIds, // TODO: adding of users
      gpxFileIds: this.projectToShow.gpxFileIds,
    });
    // @ts-ignore
    this.projectToShow = {
      ...this.projectToShow,
      ...{
        name: this.fg.value.name,
        userIds: this.projectToShow.userIds,
      },
    };
  }

  cancelChanges(): void {
    if (!this.projectToShow) {
      return;
    }
    this.fg.setValue({
      name: this.projectToShow.name,
      description: this.projectToShow.description,
      userIds: this.projectToShow.userIds.join(','),
    });
  }

  addToProject(): void {
    if (this.addFileToProjectInput !== '') {
      this.addFileToProject(this.addFileToProjectInput);
    }
    this.addFileToProjectInput = '';
  }

  async addFileToProject(fileId: string): Promise<void> {
    if (!this.projectToShow) {
      return;
    }
    this.projectToShow.gpxFileIds.push(fileId);
    await this.fetchFiles();
    this.cancelChanges();
    await this.saveChanges();
  }

  async removeFromProject(id: string): Promise<void> {
    if (!this.projectToShow) {
      return;
    }
    const index = this.projectToShow.gpxFileIds.indexOf(id);
    if (index !== -1) {
      this.projectToShow.gpxFileIds.splice(index, 1);
      this.gpxFiles.splice(index, 1);
      this.cancelChanges();
      await this.saveChanges();
      this.fetchPointGroups();
    }
  }

  async deleteFile(id: string): Promise<void> {
    this.dialog
      .open(ConfirmationDialogComponent, {
        minWidth: '35%',
        data: { title: 'Smazat soubor?', confirmButtonText: 'Smazat' },
      })
      .afterClosed()
      .subscribe(async (value) => {
        if (value) {
          await this.removeFromProject(id);
          this.storageService.removeFile(id);
        }
      });
  }

  async exportToFile(id: string): Promise<void> {
    await this.storageService.exportToFile(id);
  }

  async exportAllToFile(): Promise<void> {
    if (!this.projectToShow) {
      return;
    }
    await this.storageService.exportProjectToFile(this.projectToShow);
  }

  uploadFile(): void {
    this.dialog
      .open(UploadComponent, {
        minWidth: '400px',
      })
      .afterClosed()
      .subscribe(async (value) => {
        if (value) {
          await this.addFileToProject(value);
        }
      });
  }

  async deleteProject(): Promise<void> {
    this.dialog
      .open(ConfirmationDialogComponent, {
        minWidth: '35%',
        data: { title: 'Smazat projekt?', confirmButtonText: 'Smazat' },
      })
      .afterClosed()
      .subscribe(async (value) => {
        if (value && this.projectToShow) {
          await this.firebaseService.deleteProject(this.projectToShow.id);
          this.router.navigate(['/projects']);
        }
      });
  }
}
