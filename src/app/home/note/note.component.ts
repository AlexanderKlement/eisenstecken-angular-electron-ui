import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DefaultService, Note, NoteCreate} from 'eisenstecken-openapi-angular-library';
import {first} from 'rxjs/operators';

@Component({
    selector: 'app-note',
    templateUrl: './note.component.html',
    styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit {

    @ViewChild('noteBox') noteBox: ElementRef;

    notes: Note[] = [];
    maxNotes = 4;

    constructor(private api: DefaultService) {

    }

    ngOnInit(): void {
        const noteObservable = this.api.readNoteEntriesNoteGet();
        noteObservable.pipe(first()).subscribe((notes) => {
            this.notes = notes;
            if (this.notes.length === 0) {
                this.newNoteClicked();
            }
        });
    }

    public scrollToBottom(): void {
        try {
            this.noteBox.nativeElement.scrollTop = this.noteBox.nativeElement.scrollHeight;
        } catch (e) {
            console.error(e);
        }
    }

    public newNoteClicked(): void {
        const noteCreate: NoteCreate = {text: ''};
        const newNoteObservable = this.api.createNoteEntryNotePost(noteCreate);
        newNoteObservable.pipe(first()).subscribe((note) => {
            this.notes.push(note);
        });
    }

    public addNoteAvailable(): boolean {
        return this.notes.length < this.maxNotes;
    }

    deleteNote(note: Note) {
        this.notes.forEach((element, index) => {
            if (element.id === note.id) {
                this.notes.splice(index, 1);
            }
        });
    }
}
