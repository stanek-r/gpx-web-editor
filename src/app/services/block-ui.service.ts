import { Injectable } from '@angular/core';
import { BehaviorSubject, defer, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

export interface BlockUiOptions {
  text: string;
}

export interface BlockUiInstance {
  id: number;
  text: string;
  unblock?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class BlockUiService {
  lastId = 0;
  activeBlocks = new BehaviorSubject<BlockUiInstance[]>([]);

  getBlocks(): Observable<BlockUiInstance[]> {
    return this.activeBlocks;
  }

  block(options?: Partial<BlockUiOptions>): BlockUiInstance {
    const blockUiInstance: BlockUiInstance = {
      id: this.lastId,
      text: options?.text ? options.text : 'Načítání...!',
    };
    this.lastId++;
    blockUiInstance.unblock = () => {
      this.unblock(blockUiInstance);
    };
    this.activeBlocks.next([...this.activeBlocks.value, blockUiInstance]);
    return blockUiInstance;
  }

  unblock(blockUiInstance: BlockUiInstance): void {
    const activeBlocks = [...this.activeBlocks.value];
    const index = activeBlocks.indexOf(blockUiInstance);
    activeBlocks.splice(index, 1);
    this.activeBlocks.next(activeBlocks);
  }

  unblockAll(): void {
    this.activeBlocks.next([]);
  }

  blockPipe(options?: Partial<BlockUiOptions>): <T>(source: Observable<T>) => Observable<T> {
    return blockUi(this, options);
  }
}

export function blockUi<T>(
  blockUiService: BlockUiService,
  options?: Partial<BlockUiOptions>
): (source: Observable<T>) => Observable<T> {
  return <K>(source: Observable<K>) =>
    defer(() => {
      const block = blockUiService.block(options);
      // @ts-ignore
      return source.pipe(finalize(() => block.unblock()));
    });
}
