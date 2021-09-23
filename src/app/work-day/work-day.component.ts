import {Component, OnInit} from '@angular/core';
import {
    Car,
    DefaultService,
    Drive,
    EatingPlace,
    Expense, JobSection,
    WorkDay, WorkDayStart
} from 'eisenstecken-openapi-angular-library';
import {first, skip,} from 'rxjs/operators';
import {Observable, ReplaySubject} from 'rxjs';
import {
    FormArray,
    FormControl,
    FormGroup, Validators,
} from '@angular/forms';


@Component({
    selector: 'app-work-day',
    templateUrl: './work-day.component.html',
    styleUrls: ['./work-day.component.scss']
})
export class WorkDayComponent implements OnInit {
    buttons: [];
    workDayStarted: boolean;
    workDay: WorkDay;

    workDayFinishGroup: FormGroup;
    eatingPlaces$: Observable<EatingPlace[]>;

    cars$: ReplaySubject<Car[]>;

    maxMinutes = 0;

    constructor(private api: DefaultService) {
    }

    ngOnInit(): void {
        this.initWorkDayFinishGroup();
        this.api.getCurrentWorkDayWorkDayCurrentGet().pipe(first()).subscribe((workDay) => {
            if (workDay !== undefined) {
                this.workDay = workDay;
                if (workDay.finished) {
                    console.log('Finished');
                } else {
                    this.initWorkDayFinishSection(workDay);
                }
            }
            this.workDayStarted = (workDay !== undefined);
        });
    }

    initWorkDayFinishSection(workDay: WorkDay): void {
        this.maxMinutes = workDay.length_minutes;

        this.cars$ = new ReplaySubject<Car[]>(1);
        this.api.getCarsCarGet().pipe(first()).subscribe((cars) => {
            this.cars$.next(cars);
        });

        this.eatingPlaces$ = this.api.getEatingPlacesEatingPlaceGet();
        this.api.getJobsByStatusJobStatusJobStatusGet('JOBSTATUS_ACCEPTED').pipe(first())
            .subscribe((jobs) => {
                for (const job of jobs) {
                    this.getWorkSections().push(this.initWorkSectionManually(0, job.id, job.displayable_name));
                }
                this.getWorkSections().push(this.initWorkSectionManually(workDay.length_minutes, 0, 'Instandhaltung'));
            });
    }

    initWorkDayFinishGroup(): void {
        this.workDayFinishGroup = new FormGroup({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            work_sections: new FormArray([]),
            expenses: new FormArray([
                this.initExpense()
            ]),
            drives: new FormArray([
                //this.initDrive()
            ])
        });
    }

    initWorkSection(workSection: JobSection): FormGroup {
        return this.initWorkSectionManually(workSection.minutes,
            workSection.job === undefined ? 0 : workSection.job.id,
            workSection.job === undefined ? 'Instandhaltung' : workSection.job.displayable_name);
    }

    initWorkSectionManually(minutes: number, jobId: number, name: string): FormGroup {
        return new FormGroup({
            minutes: new FormControl(minutes, Validators.pattern('^\\+?(0|[1-9]\\d*)$')),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            job_id: new FormControl(jobId),
            name: new FormControl(name),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            readable_time: new FormControl(this.minutesToDisplayableString(minutes)),
        });
    }


    initExpense(expense?: Expense): FormGroup {
        if (expense === undefined) {
            return new FormGroup({
                name: new FormControl(''),
                amount: new FormControl(0)
            });
        } else {
            return new FormGroup({
                name: new FormControl(expense.name),
                amount: new FormControl(expense.amount)
            });
        }
    }

    initDrive(drive?: Drive): FormGroup {
        if (drive === undefined) {
            return new FormGroup({
                km: new FormControl(0.0),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                car_id: new FormControl(1)
            });
        } else {
            return new FormGroup({
                km: new FormControl(drive.km),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                car_id: new FormControl(drive.id)
            });
        }
    }

    getDrives(): FormArray {
        return this.workDayFinishGroup.get('drives') as FormArray;
    }

    getExpenses(): FormArray {
        return this.workDayFinishGroup.get('expenses') as FormArray;
    }

    getWorkSections(): FormArray {
        return this.workDayFinishGroup.get('work_sections') as FormArray;
    }

    onWorkDayStartClick() {
        const workDayStart: WorkDayStart = {
            code : 'TEST'
        };
        this.api.startWorkPhaseWorkDayStartPost(workDayStart).pipe(first()).subscribe((workDay) => {
            if (workDay === undefined) {
                console.error('Could not start workday, maybe it was already started elsewhere');
            } else {
                window.location.reload();
            }
        });
    }

    onMinuteChange(index: number): void {
        this.distributeMinutes(index);
        this.checkMinutes();
        this.refreshDisplayableMinutes();
    }


    minutesToDisplayableString(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return hours.toString() + ' Stunden und ' + remainingMinutes.toString() + ' Minuten';
    }

    calculateTimeDisplay(index: number): void {
        const currentMinutes = this.getMinutesAt(index);
        const hourString = this.minutesToDisplayableString(currentMinutes);
        this.getWorkSections().at(index).get('readable_time').setValue(hourString);
    }

    distributeMinutes(index: number): void {
        const actualTotalMinutes = this.getMinutesSum();

        const minutesAvailable = this.maxMinutes - actualTotalMinutes;
        if (this.getMinutesAtLast() + minutesAvailable > 0) {
            this.setMinutesAtLast(this.getMinutesAtLast() + minutesAvailable);
            return;
        }
        this.setMinutesAtLast(0);
        this.setMinutesAt(index, this.maxMinutes - this.getMinutesSum(index));
    }

    checkMinutes(): void {
        if (this.getMinutesSum() !== this.maxMinutes) {
            console.error('WorkDayComponent: The distributed Minutes do not correspond with the total available minutes -> RESET');
            this.resetMinutes();
        }
        this.getWorkSections().controls.forEach((_, index) => {
            if (this.getMinutesAt(index) < 0) {
                console.error('WorkDayComponent: There is at least 1 negative minute amount present -> RESET');
                this.resetMinutes();
            }
        });
    }

    refreshDisplayableMinutes(): void {
        this.getWorkSections().controls.forEach((_, index) => {
            this.calculateTimeDisplay(index);
        });
    }

    resetMinutes(): void {
        this.getWorkSections().controls.forEach((_, index) => {
            this.setMinutesAt(index, 0);
        });
        this.setMinutesAtLast(this.maxMinutes);
    }

    setMinutesAt(index: number, value: number) {
        this.getWorkSections().at(index).get('minutes').setValue(value.toString(), {emitEvent: false});
    }

    getMinutesAt(index: number):
        number {
        return parseInt(this.getWorkSections().at(index).get('minutes').value, 10);
    }

    getMinutesAtLast(): number {
        const length = this.getWorkSections().controls.length;
        return this.getMinutesAt(length - 1);
    }

    setMinutesAtLast(value: number):
        void {
        const length = this.getWorkSections().controls.length;
        console.log('Setting minutes at last: ' + value.toString());
        this.setMinutesAt(length - 1, value);
    }

    getMinutesSum(skipIndex?: number): number {
        let totalMinutes = 0;
        this.getWorkSections().controls.forEach((element, index) => {
            if (skipIndex !== undefined && skipIndex === index) {
                return;
            }
            totalMinutes += parseInt(element.get('minutes').value, 10);
        });
        return totalMinutes;
    }
}
