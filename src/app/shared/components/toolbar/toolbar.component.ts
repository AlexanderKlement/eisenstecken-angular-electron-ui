import {Component, HostListener, Input, OnInit} from '@angular/core';
import {NavigationService} from '../../navigation.service';

export interface CustomButton {
  name: string;
  navigate: VoidFunction;
}

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @Input() buttonList?: CustomButton[];
  @Input() beforeBackFunction?: (afterBackFunction: VoidFunction) => void;

  // @ts-ignore
  @HostListener('window:popstate', ['$event'])

  constructor(private navigation: NavigationService) { }

  onBrowserBackBtnClose(event: Event): void {
    event.preventDefault();
    this.navigation.backEvent();
    this.backClicked();
  }



  ngOnInit(): void {
  }

  backClicked(): void {
    if(this.beforeBackFunction != null){
      this.beforeBackFunction(() => {
        this.navigation.back();
      });
    } else {
      this.navigation.back();
    }
  }

  homeClicked(): void {
    this.navigation.home();
  }

}
