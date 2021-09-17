import {Component, OnInit} from '@angular/core';
import {DefaultService} from 'eisenstecken-openapi-angular-library';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {matchRightsToMenuTiles, MenuTileDetail} from './menu-tile.settings';

@Component({
  selector: 'app-menu-tiles',
  templateUrl: './menu-tiles.component.html',
  styleUrls: ['./menu-tiles.component.scss']
})
export class MenuTilesComponent implements OnInit {

  menuTiles$: Observable<MenuTileDetail[]>;

  now: number;

  constructor(private api: DefaultService) {
    this.now = ((new Date()).getMonth() * 100) + (new Date()).getDate();
  }

  ngOnInit(): void {
    const userObservable = this.api.readUsersMeUsersMeGet();
    this.menuTiles$ = userObservable.pipe(
      map(user => matchRightsToMenuTiles(user.rights))
    );
  }
}
