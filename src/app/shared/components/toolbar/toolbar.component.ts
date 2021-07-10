import {Component, HostListener, Input, OnInit} from '@angular/core';
import {NavigationService} from "../../navigation.service";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @Input() buttonList?: [[string, VoidFunction]];
  @Input() beforeBackFunction?: (afterBackFunction: VoidFunction) => void;

  @HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose(event: Event): void {
    console.info('back button pressed');
    event.preventDefault();
    this.navigation.backEvent();
    this.backClicked();
  }

  constructor(private navigation: NavigationService) { }

  ngOnInit(): void {
  }

  backClicked(): void { // TODO: bind back button clicked here
    if(this.beforeBackFunction != null){
      this.beforeBackFunction(() => {
        this.navigation.back();
      });
    } else {
      this.navigation.back();
    }
  }

}
