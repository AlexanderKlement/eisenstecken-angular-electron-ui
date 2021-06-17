import {Component, Input, OnInit} from '@angular/core';
import {DefaultService, Note, NoteCreate} from "eisenstecken-openapi-angular-library";
import {FormControl} from "@angular/forms";
import {Subscription} from "rxjs";
import {distinctUntilChanged} from "rxjs/operators";

@Component({
  selector: 'app-single-note',
  templateUrl: './single-note.component.html',
  styleUrls: ['./single-note.component.scss']
})
export class SingleNoteComponent implements OnInit {

  @Input() note: Note;
  noteVisible = true;

  public subscriptions = new Subscription();

  singleNoteTextArea = new FormControl();

  constructor(private api: DefaultService) { }

  ngOnInit(): void {
    this.singleNoteTextArea.setValue(this.note.text);

    this.subscriptions.add(this.singleNoteTextArea.valueChanges
      .pipe(distinctUntilChanged()) // makes sure the value has actually changed.
      .subscribe(data => {
        const noteCreate:NoteCreate = {text : data};
        this.api.updateNoteEntryNoteNoteIdPut(this.note.id, noteCreate).subscribe((event) => {
          console.info(event);
        });
      }));
  }


  public ngOnDestroy(): void
  {
    this.subscriptions.unsubscribe();
  }

  deleteNoteClicked() :void {
    this.api.deleteNoteEntryNoteNoteIdDelete(this.note.id).subscribe(() => {
      this.noteVisible = false; //TODO: if the spacing is uneven, maybe emit something to parent, remove the note and then rerender notes
    });
  }
}

