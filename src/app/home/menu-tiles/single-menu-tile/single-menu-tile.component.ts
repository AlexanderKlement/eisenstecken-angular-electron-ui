import {Component, Input, OnInit} from '@angular/core';
import {MenuTileDetail} from "../menu-tile.settings";

@Component({
  selector: 'app-single-menu-tile',
  templateUrl: './single-menu-tile.component.html',
  styleUrls: ['./single-menu-tile.component.scss']
})
export class SingleMenuTileComponent implements OnInit {

  @Input() tile: MenuTileDetail;

  constructor() { }

  ngOnInit(): void {
  }


}
