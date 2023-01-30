import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  PointGroupInfo,
  StorageService,
} from '../../../services/storage.service';
import { FirebaseService } from '../../../services/firebase.service';
import { GpxModel } from '../../../shared/models/gpx.model';
import { Project } from '../../../shared/models/project.model';
import { take } from 'rxjs/operators';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

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
    private readonly fb: FormBuilder
  ) {}

  async ngOnInit(): Promise<void> {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId) {
      return;
    }
    await this.storageService.waitUntilLoaded();
    this.firebaseService
      .getProject(projectId)
      .pipe(take(1))
      .subscribe(async (value) => {
        this.projectToShow = {
          id: value.id,
          name: value.name ?? '',
          description: value.description ?? '',
          gpxFileIds: value.gpxFileIds ?? [],
          userIds: value.userIds ?? [],
        };
        this.fg.controls.name.setValue(value.name);
        this.fg.setValue({
          name: value.name ?? '',
          description: value.description ?? '',
          userIds: value.userIds?.join(',') ?? [],
        });

        this.fg.valueChanges.subscribe(() => {
          if (
            this.fg.controls.name.dirty ||
            this.fg.controls.description.dirty ||
            this.fg.controls.userIds.dirty
          ) {
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
      !pointGroups
        ? null
        : pointGroups.filter(
            (spg) => !this.projectToShow?.gpxFileIds.includes(spg.id)
          )
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
    if (!this.projectToShow) {
      return;
    }
    if (this.addFileToProjectInput !== '') {
      this.projectToShow.gpxFileIds.push(this.addFileToProjectInput);
      this.fetchFiles();
      this.cancelChanges();
      this.saveChanges();
    }
    this.addFileToProjectInput = '';
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

  async exportToFile(id: string): Promise<void> {
    await this.storageService.exportToFile(id);
  }
}