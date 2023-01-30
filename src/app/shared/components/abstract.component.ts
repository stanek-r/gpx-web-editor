import { Directive, OnDestroy } from '@angular/core';
import { MonoTypeOperatorFunction, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class AbstractComponent implements OnDestroy {
  protected readonly destroyedSubject = new Subject<boolean>();

  ngOnDestroy(): void {
    this.destroyedSubject.next(true);
    this.destroyedSubject.complete();
  }

  untilDestroyed<T>(): MonoTypeOperatorFunction<T> {
    return takeUntil(this.destroyedSubject);
  }
}
