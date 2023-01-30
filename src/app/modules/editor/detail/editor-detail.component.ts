import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../../services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GpxModel } from '../../../shared/models/gpx.model';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-editor-detail',
  templateUrl: 'editor-detail.component.html',
  styleUrls: ['editor-detail.component.scss'],
})
export class EditorDetailComponent implements OnInit {
  id: string | null = null;
  fileData: GpxModel | null = null;
  backProject: string | null = null;

  changed = false;

  fg = this.fb.group({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    desc: new FormControl(),
    sharing: new FormControl(),
  });

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly storageService: StorageService,
    private readonly fb: FormBuilder
  ) {}

  async ngOnInit(): Promise<void> {
    this.backProject = this.route.snapshot.queryParamMap.get('backProject');

    this.id = this.route.snapshot.paramMap.get('id');
    if (!this.id) {
      this.router.navigate(['/editor']);
      return;
    }
    await this.storageService.waitUntilLoaded();
    this.fileData = await this.storageService.getFile(this.id);
    if (!this.fileData) {
      this.router.navigate(['/editor']);
      return;
    }
    this.fg.setValue({
      name: this.fileData.metadata.name ?? '',
      desc: this.fileData.metadata.desc ?? '',
      sharing: Object.keys(this.fileData.permissionData).join(','),
    });
    this.fg.valueChanges.subscribe(() => {
      if (
        this.fg.controls.name.dirty ||
        this.fg.controls.desc.dirty ||
        this.fg.controls.sharing.dirty
      ) {
        this.changed = true;
      }
    });
  }

  saveChanges(): void {
    if (!this.fileData || !this.id) {
      return;
    }
    this.fileData.metadata = {
      ...this.fileData.metadata,
      name: this.fg.value.name ?? '',
      desc: this.fg.value.desc,
    };
    this.fileData.permissionData = {} as any;
    if (this.fg.value.sharing.length > 0) {
      for (const parsedElement of this.fg.value.sharing.split(',')) {
        // @ts-ignore
        this.fileData.permissionData[parsedElement] = true;
      }
    }
    this.changed = false;
    this.storageService.saveFile(this.id, this.fileData);
  }

  cancelChanges(): void {
    this.fg.setValue({
      name: this.fileData?.metadata.name ?? '',
      desc: this.fileData?.metadata.desc ?? '',
      sharing: Object.keys(this.fileData?.permissionData ?? {}).join(','),
    });
    this.changed = false;
  }

  removeGroup(id: string): void {
    this.storageService.removeFile(id);
    this.router.navigate(['/editor']);
  }

  async exportToFile(id: string): Promise<void> {
    await this.storageService.exportToFile(id);
  }
}
