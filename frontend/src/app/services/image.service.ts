import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { ImageComponent } from '../shared/components/image/image.component';
import { AbstractComponent } from '../shared/components/abstract.component';

@Injectable({
  providedIn: 'root',
})
export class ImageService extends AbstractComponent {
  private bigImages$ = new ReplaySubject<boolean>(1);
  private images: ImageComponent[] = [];

  public readonly smallLoaded$ = new Subject();

  constructor() {
    super();
    this.smallLoaded$.pipe(this.untilDestroyed()).subscribe(() => {
      let areAllLoaded = true;
      this.images.forEach((image) => {
        if (image) {
          if (!image.isSmallLoaded()) {
            areAllLoaded = false;
          }
        }
      });
      if (areAllLoaded) {
        this.bigImages$.next(true);
      }
    });
  }

  loadBigImages(): Observable<boolean> {
    return this.bigImages$;
  }

  addImage(imageComponent: ImageComponent): number {
    return this.images.push(imageComponent);
  }

  removeImage(index: number): void {
    // @ts-ignore
    this.images[index] = null;
  }
}
