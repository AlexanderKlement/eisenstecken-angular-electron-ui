import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-minute-hour',
    templateUrl: './minute-hour.component.html',
    styleUrls: ['./minute-hour.component.scss']
})
export class MinuteHourComponent implements OnInit, OnDestroy {
    @Input() minuteControl: FormControl;
    @Input() editDisabled = false;
    @Input() title = '';
    @Output() minutesChanged = new EventEmitter<number>();
    minuteHourGroup: FormGroup;
    private subscriptions: Subscription = new Subscription();

    constructor() {
    }

    ngOnInit(): void {
        this.minuteHourGroup = new FormGroup({
            hours: new FormControl(0),
            minutes: new FormControl(0)
        });
        if (!this.minuteControl) {
            console.error('MinuteHourComponent: Cannot bootstrap without an external FormControl');
            return;
        }
        this.subscriptions.add(this.minuteControl.valueChanges.subscribe(() => {
            this.refreshInternalValues();
        }));
        this.subscriptions.add(this.minuteHourGroup.get('hours').valueChanges.subscribe(() => {
            this.refreshExternalValues();
        }));
        this.subscriptions.add(this.minuteHourGroup.get('minutes').valueChanges.subscribe(() => {
            this.refreshExternalValues();
        }));
        this.refreshInternalValues();
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    focusLost(): void {
        this.minutesChanged.emit(0);
    }

    private refreshInternalValues() {
        const totalMinutes = parseInt(this.minuteControl.value, 10);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        this.minuteHourGroup.get('hours').setValue(hours, {
            emitEvent: false,
        });
        this.minuteHourGroup.get('minutes').setValue(minutes, {
            emitEvent: false,
        });
    }

    private refreshExternalValues() {
        const hours = parseInt(this.minuteHourGroup.get('hours').value, 10);
        const minutes = parseInt(this.minuteHourGroup.get('minutes').value, 10);
        const totalMinutes = hours * 60 + minutes;
        this.minuteControl.setValue(totalMinutes, {
            emitEvent: false
        });
    }


}
