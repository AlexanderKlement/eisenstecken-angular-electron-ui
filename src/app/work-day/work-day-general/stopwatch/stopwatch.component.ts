import {Component, OnDestroy, OnInit} from '@angular/core';
import {StopWatchAction, StopwatchService} from './stopwatch.service';
import {Subscription} from 'rxjs';


@Component({
    selector: 'app-stopwatch',
    templateUrl: './stopwatch.component.html',
    styleUrls: ['./stopwatch.component.scss']
})
export class StopwatchComponent implements OnInit, OnDestroy {

    hh: number;
    mm: number;
    ss: number;
    ms: number;
    silentMS: number;
    private counterTimeout: NodeJS.Timeout;
    private actionSubscription: Subscription;


    constructor(private stopwatchService: StopwatchService) {
        this.mm = 0;
        this.ss = 0;
        this.ms = 0;
        this.hh = 0;
        this.silentMS = 0;
    }

    ngOnInit(): void {
        this.actionSubscription = this.stopwatchService.register().subscribe(action => {
            if (action === StopWatchAction.start) {
                this.startTimer();
            } else if (action === StopWatchAction.stop) {
                this.stopTimer();
            }
        });
        this.fillWithMillis();
    }

    ngOnDestroy(): void {
        this.actionSubscription.unsubscribe();
        clearInterval(this.counterTimeout);
    }


    format(num: number) {
        return (num + '').length === 1 ? '0' + num : num + '';
    }

    private startTimer() {
        this.counterTimeout = setInterval(
            () => {
                this.fillWithMillis();
            }, 10
        );
    }


    private stopTimer() {
        clearInterval(this.counterTimeout);
    }

    private fillWithMillis() {
        let millis = this.stopwatchService.getTodaysMillis();
        this.hh = Math.floor(millis / (60 * 60 * 1000));
        millis = millis % (60 * 60 * 1000);
        this.mm = Math.floor(millis / (60 * 1000));
        millis = millis % (60 * 1000);
        this.ss = Math.floor(millis / 1000);
        millis = millis % 1000;
        this.ms = Math.floor(millis / 10);
    }

}
