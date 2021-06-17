import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DefaultService, Note, NoteCreate} from "eisenstecken-openapi-angular-library";

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit {

  notes: Note[] = [];

  constructor(private api: DefaultService) {

  }

  ngOnInit(): void {
    const noteObservable = this.api.readNoteEntriesNoteGet();
    noteObservable.subscribe((notes) => {
      this.notes = notes;
    });
  }

  @ViewChild('noteBox') noteBox: ElementRef;

  public scrollToBottom(): void {
    try {
      this.noteBox.nativeElement.scrollTop = this.noteBox.nativeElement.scrollHeight;
    } catch (e) {
      console.error(e);
    }
  }

  public newNoteClicked(): void {
    const noteCreate:NoteCreate = {text: ""};
    const newNoteObservable = this.api.createNoteEntryNotePost(noteCreate);
    newNoteObservable.subscribe((note) => {
      this.notes.push(note);
    });
  }
}
