import {Component, Input, OnInit} from '@angular/core';
import {MenuTileDetail} from '../menu-tile.settings';
import {Router} from '@angular/router';

@Component({
  selector: 'app-single-menu-tile',
  templateUrl: './single-menu-tile.component.html',
  styleUrls: ['./single-menu-tile.component.scss']
})
export class SingleMenuTileComponent implements OnInit {

  @Input() tile: MenuTileDetail;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onTileClicked(destination: string): void {
    this.router.navigateByUrl(destination);
  }


}
