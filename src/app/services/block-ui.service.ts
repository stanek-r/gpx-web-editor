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

  // tslint:disable-next-line:typedef
  blockPipe(options?: Partial<BlockUiOptions>) {
    return blockUi(this, options);
  }
}

/**
 * Pipe operator for UI blocking during async requests.
 * @param blockUiService UI blocking service
 * @param options Settings for ui block
 */
// tslint:disable-next-line:typedef
export function blockUi(
  blockUiService: BlockUiService,
  options?: Partial<BlockUiOptions>
) {
  return <T>(source: Observable<T>) =>
    defer(() => {
      const block = blockUiService.block(options);
      // @ts-ignore
      return source.pipe(finalize(() => block.unblock()));
    });
}
