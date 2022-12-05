import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  PointGroupInfo,
  StorageV2Service,
} from '../../../services/storageV2.service';
import { parse } from 'js2xmlparser';

// @ts-ignore
import createGpx from 'gps-to-gpx';
import { mapToGpxExport } from '../../../shared/gpx.mapper';

@Component({
  selector: 'app-editor-list',
  templateUrl: './editor-list.component.html',
  styleUrls: ['./editor-list.component.scss'],
})
export class EditorListComponent implements OnInit {
  pointGroups$!: Observable<PointGroupInfo[] | null>;

  constructor(
    private readonly storageService: StorageV2Service
  ) {}

  ngOnInit(): void {
    this.pointGroups$ = this.storageService.getListOfFiles();
  }

  addNewGroup(): void {
    // this.router.navigate(['/editor', nanoid(10)]);
  }

  removeGroup(id: string): void {
    this.storageService.removeFile(id);
  }

  async exportToFile(id: string): Promise<void> {
    const file = await this.storageService.getFile(id);
    if (!file) {
      return;
    }
    const exportedFileString = parse('gpx', mapToGpxExport(file));
    const blob = new Blob([exportedFileString], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.download = file.metadata.name + '.gpx';
    anchor.href = url;
    anchor.click();
  }
}
