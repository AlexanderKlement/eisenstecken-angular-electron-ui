import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {BehaviorSubject} from 'rxjs';

interface Period {
    start: number;
    stop?: number;
}

export enum StopWatchAction {
    start,
    stop
}

@Injectable({
    providedIn: 'root'
})
export class StopwatchService {

    private readonly dayKey = 'stopwatch:day';
    private readonly timesKey = 'stopwatch:times';
    private readonly dayFormat = 'YYYYMMDD';
    private readonly timeDelimiter = ';';

    private day: moment.Moment;
    private periods: Period[];
    private readonly actionSubject: BehaviorSubject<StopWatchAction>;


    constructor() {
        this.load();
        if (this.periods.length === 0 || this.periods[this.periods.length - 1].stop) {
            this.actionSubject = new BehaviorSubject<StopWatchAction>(StopWatchAction.stop);
        } else {
            this.actionSubject = new BehaviorSubject<StopWatchAction>(StopWatchAction.start);
        }
    }

    public start(): void {
        if (this.periods.length > 0 && this.periods[this.periods.length - 1].stop === undefined) {
            console.error('Cannot start a new Period when last one has not ended');
            return;
        }
        this.periods.push({
            start: new Date().getTime()
        });
        this.save();
        this.actionSubject.next(StopWatchAction.start);
    }

    public stop(): void {
        if (this.periods.length === 0 || this.periods[this.periods.length - 1].stop) {
            console.error('Cannot stop a Period when none has been started');
            return;
        }
        this.periods[this.periods.length - 1].stop = new Date().getTime();
        this.save();
        this.actionSubject.next(StopWatchAction.stop);
    }

    public getTodaysMillis(): number {
        let totalMillis = 0;
        for (const period of this.periods) {
            let stop = period.stop;
            if (!stop) {
                stop = new Date().getTime();
            }
            totalMillis += stop - period.start;
        }
        return totalMillis;
    }

    public register(): BehaviorSubject<StopWatchAction> {
        return this.actionSubject;
    }

    private reset(): void {
        this.day = moment();
        this.periods = [];
        this.saveTimes();
        this.saveDay();
    }

    private save(): void {
        if (this.getDay().format(this.dayFormat) === moment().format(this.dayFormat)) {
            this.saveDay();
            this.saveTimes();
        } else {
            console.warn('Trying to save stopwatch on new day. Resetting before something happens');
            //TODO: add sentry here, too track if and when this happens
            this.reset();
        }
    }

    private load(): void {
        if (this.getDay().format(this.dayFormat) === moment().format(this.dayFormat)) {
            this.day = this.getDay();
            this.periods = this.getTimes();
        } else {
            console.warn('Trying to save stopwatch on new day. Resetting before something happens');
            //TODO: add sentry here, too track if and when this happens
            this.reset();
        }
    }

    private getDay(): moment.Moment {
        const dayString = localStorage.getItem(this.dayKey);
        if (dayString && dayString.length > 0) {
            const day = moment(dayString, this.dayFormat);
            if (day.isValid()){
                return day;
            }
        }
        const today = moment();
        this.setDay(today);
        return today;
    }

    private setDay(day: moment.Moment): void {
        localStorage.setItem(this.dayKey, day.format(this.dayFormat));
    }

    private saveDay(): void {
        this.setDay(this.day);
    }

    private getTimes(): Period[] {
        const periodString = localStorage.getItem(this.timesKey);
        if (!periodString || periodString.length === 0) {
            return [];
        }
        const periodSplit = periodString.split(this.timeDelimiter);
        const periods: Period[] = [];
        for (let i = 0; i < periodSplit.length; i = i + 2) {
            const periodStart = parseInt(periodSplit[i], 10);
            let periodStop = (i >= periodSplit.length) ? null : parseInt(periodSplit[i + 1], 10);
            if (isNaN(periodStop)) {
                periodStop = null;
            }
            periods.push({
                start: periodStart,
                stop: periodStop
            });
        }
        return periods;
    }

    private setTimes(periods: Period[]): void {
        const periodSplit: string[] = [];
        for (const period of periods) {
            periodSplit.push(period.start.toString());
            if (period.stop) {
                periodSplit.push(period.stop.toString());
            }
        }
        const periodString = periodSplit.join(this.timeDelimiter);
        localStorage.setItem(this.timesKey, periodString);
    }

    private saveTimes(): void {
        this.setTimes(this.periods);
    }

}
