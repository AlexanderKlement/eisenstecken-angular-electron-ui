import { Component, OnInit } from '@angular/core';
import {DefaultService, Right} from "eisenstecken-openapi-angular-library";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {matchRightsToMenuTiles, MenuTileDetail} from "./menu-tile.settings";

@Component({
  selector: 'app-menu-tiles',
  templateUrl: './menu-tiles.component.html',
  styleUrls: ['./menu-tiles.component.scss']
})
export class MenuTilesComponent implements OnInit {

  menuTiles$: Observable<MenuTileDetail[]>;

  constructor(private api: DefaultService) { }

  ngOnInit(): void {
    const userObservable = this.api.readUsersMeUsersMeGet();
    this.menuTiles$ = userObservable.pipe(
      map( user => matchRightsToMenuTiles(user.rights))
    );
  }
}
