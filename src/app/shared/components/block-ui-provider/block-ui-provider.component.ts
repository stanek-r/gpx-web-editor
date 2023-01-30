import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BlockUiInstance,
  BlockUiService,
} from '../../../services/block-ui.service';

@Component({
  selector: 'app-block-ui-provider',
  templateUrl: './block-ui-provider.component.html',
  styleUrls: ['block-ui-provider.component.scss'],
})
export class BlockUiProviderComponent implements OnInit {
  blocks$!: Observable<BlockUiInstance[]>;

  constructor(private readonly blockUiService: BlockUiService) {}

  ngOnInit(): void {
    this.blocks$ = this.blockUiService.getBlocks();
  }
}
