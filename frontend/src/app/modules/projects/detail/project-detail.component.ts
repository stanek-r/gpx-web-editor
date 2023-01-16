import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from '../../../services/storage.service';
import { FirebaseService } from '../../../services/firebase.service';
import { GpxModel } from '../../../shared/models/gpx.model';
import { Project } from '../../../shared/models/project.model';
import { take } from 'rxjs/operators';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
})
export class ProjectDetailComponent implements OnInit {
  projectToShow?: Project;
  gpxFiles: GpxModel[] = [];

  fg = this.fb.group({
    name: new FormControl('', Validators.required),
    gpxFileIds: new FormControl(''),
    userIds: new FormControl(''),
  });
  changed = false;

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
        this.projectToShow = value;
        this.fg.controls.name.setValue(value.name);
        this.fg.setValue({
          name: value.name ?? '',
          gpxFileIds: value.gpxFileIds?.join(',') ?? [],
          userIds: value.userIds?.join(',') ?? [],
        });

        this.fg.valueChanges.subscribe(() => {
          if (
            this.fg.controls.name.dirty ||
            this.fg.controls.gpxFileIds.dirty ||
            this.fg.controls.userIds.dirty
          ) {
            this.changed = true;
          }
        });

        for (const gpxFileId of value.gpxFileIds) {
          const file = await this.storageService.getFile(gpxFileId);
          if (file) {
            this.gpxFiles?.push(file);
          }
        }
      });
  }

  saveChanges(): void {
    if (this.projectToShow) {
      const gpxFiles = this.fg.value.gpxFileIds.split(',');

      this.firebaseService.saveProject(this.projectToShow.id, {
        id: this.projectToShow.id,
        name: this.fg.value.name,
        userIds: this.projectToShow.userIds, // TODO: adding of users
        gpxFileIds: gpxFiles,
      });
    }
  }

  cancelChanges(): void {
    this.fg.setValue({
      name: this.projectToShow?.name ?? '',
      gpxFileIds: this.projectToShow?.gpxFileIds?.join(',') ?? [],
      userIds: this.projectToShow?.userIds?.join(',') ?? [],
    });
  }
}
