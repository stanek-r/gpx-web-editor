import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ImageService } from '../../../services/image.service';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
})
export class ImageComponent implements OnInit, OnDestroy {
  private isLoaded = false;
  loadBigImages$!: Observable<boolean>;

  imageUrl = '';
  storage?: string;

  private index = 0;

  @Input() lowUrl = '';
  @Input() highUrl?: string;

  @Input() alt = '';

  constructor(private readonly imageService: ImageService) {}

  ngOnInit(): void {
    this.index = this.imageService.addImage(this);
    this.loadBigImages$ = this.imageService.loadBigImages();
  }

  changeResolution(): void {
    if (this.highUrl) {
      this.imageUrl = this.storage + this.highUrl;
    }
  }

  showImage(): void {
    this.imageUrl = this.lowUrl;
    this.isLoaded = true;
    this.imageService.smallLoaded$.next();
  }

  isSmallLoaded(): boolean {
    return this.isLoaded;
  }

  ngOnDestroy(): void {
    this.imageService.removeImage(this.index);
  }
}
