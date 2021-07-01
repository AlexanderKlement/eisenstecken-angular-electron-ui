import {Component, Input, OnInit} from '@angular/core';
import {NavigationService} from "../../nagivation.service";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @Input() buttonList?: [[string, VoidFunction]];

  constructor(private navigation: NavigationService) { }

  ngOnInit(): void {
  }

  backClicked(): void {
    this.navigation.back();
  }

}
