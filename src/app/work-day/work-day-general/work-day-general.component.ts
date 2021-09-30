import {Component, Input, OnInit} from '@angular/core';
import {
    Car,
    DefaultService,
    Drive, DriveCreate,
    EatingPlace,
    Expense, ExpenseCreate, JobSection, JobSectionCreate,
    WorkDay, WorkDayFinish, WorkDayStart, WorkDayStop, WorkDayUpdate, WorkPhase, WorkPhaseCreate
} from 'eisenstecken-openapi-angular-library';
import {first} from 'rxjs/operators';
import {Observable, ReplaySubject} from 'rxjs';
import {
    AbstractControl,
    FormArray,
    FormControl,
    FormGroup, ValidationErrors, ValidatorFn, Validators,
} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NgxMaterialTimepickerTheme} from 'ngx-material-timepicker';
import * as moment from 'moment';


export const timeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    let valid = true;
    for (const workPhase of (control.get('work_phases') as FormArray).controls) {
        const exampleDate = '07.07.1993';
        const startTime = workPhase.get('checkin').value;
        const endTime = workPhase.get('checkout').value;
        if (startTime.length < 5 || endTime.length < 5) {
            return {timeValid: false};
        }
        const startTimeMoment = moment(exampleDate + ' ' + startTime, 'DD.MM.YYYY HH:mm');
        const endTimeMoment = moment(exampleDate + ' ' + endTime, 'DD.MM.YYYY HH:mm');
        if (!startTimeMoment.isValid() || !endTimeMoment.isValid()) {
            return {timeValid: false};
        }
        if (moment.duration(endTimeMoment.diff(startTimeMoment)).asMinutes() <= 0) {
            valid = false;
        }
    }
    return valid ? null : {timeValid: false};
};


@Component({
    selector: 'app-work-day-general',
    templateUrl: './work-day-general.component.html',
    styleUrls: ['./work-day-general.component.scss']
})
export class WorkDayGeneralComponent implements OnInit {

    @Input() workDay: WorkDay = undefined;
    @Input() admin = false;

    workDayEditGroup: FormGroup;
    eatingPlaces$: Observable<EatingPlace[]>;

    cars$: ReplaySubject<Car[]>;

    maxMinutes = 0;

    workDayStartable = false;
    workDayStopable = false;
    workDayFinishable = false;
    workDayError: boolean;
    workDayCompleted: boolean;

    lengthString?: string = undefined;

    submitted = false;
    createMode = false;
    editDisabled = false;

    buttonText = 'Arbeitstag abschließen';


    primaryTheme: NgxMaterialTimepickerTheme = { // TODO : move this and calendar thingy to more prominent location
        dial: {
            dialBackgroundColor: '#fdc400',
        },
        clockFace: {
            clockHandColor: '#fdc400',
        }
    };


    constructor(private api: DefaultService, private snackBar: MatSnackBar) {
    }

    ngOnInit(): void {
        this.initWorkDayFinishGroup();
        if (this.admin) {
            if (this.workDay === undefined) {
                console.error('WorkDayGeneral: You have to provide a workday if you load this component in admin mode');
                return;
            }
            this.workDayStartable = false;
            this.workDayFinishable = true;
            this.workDayStopable = false;
            this.workDayError = true;
            this.workDayCompleted = false;
            this.initWorkDayEditSection(this.workDay);
            this.buttonText = 'Arbeitstag speichern';
        } else {
            this.api.getAvailableWorkDayActionsWorkDayAvailableActionsGet().pipe(first())
                .subscribe((actions) => {
                    if (actions.error) {
                        this.workDayStartable = false;
                        this.workDayFinishable = false;
                        this.workDayStopable = false;
                        this.workDayError = true;
                        this.workDayCompleted = false;
                    } else {
                        this.workDayStartable = actions.startable;
                        this.workDayStopable = actions.stopable;
                        this.workDayFinishable = actions.finishable;
                        this.workDayCompleted = actions.completed;
                    }
                    if (this.workDayCompleted) {
                        this.api.getFinishedWorkDayWorkDayFinishedGet().pipe(first()).subscribe((workDay) => {
                            this.workDay = workDay;
                            this.initWorkDayEditSection(workDay);
                        });
                    } else if (this.workDayFinishable || this.workDayError) {
                        this.api.getCurrentWorkDayWorkDayCurrentGet().pipe(first()).subscribe((workDay) => {
                            this.workDay = workDay;
                            this.initWorkDayEditSection(workDay);
                        });
                    }
                });
        }
    }

    initWorkDayEditSection(workDay: WorkDay): void {
        this.maxMinutes = workDay.length_minutes;

        this.cars$ = new ReplaySubject<Car[]>(1);
        this.api.getCarsCarGet().pipe(first()).subscribe((cars) => {
            this.cars$.next(cars);
        });

        this.eatingPlaces$ = this.api.getEatingPlacesEatingPlaceGet();
        this.api.getJobsByStatusJobStatusJobStatusGet('JOBSTATUS_ACCEPTED').pipe(first())
            .subscribe((jobs) => {
                for (const job of jobs) {
                    if (job.is_main) { //TODO: change this to get only main from start
                        this.getJobSections().push(this.initJobSectionManually(0, job.id, job.displayable_name));
                    }
                }
                this.getJobSections().push(this.initJobSectionManually(workDay.length_minutes, 0, 'Instandhaltung'));
            });

        for (const workPhase of workDay.work_phases) {
            this.getWorkPhases().push(this.initWorkPhase(workPhase));
            if (!this.admin) {
                this.getWorkPhases().disable();
            }
        }

        this.workDayEditGroup.get('date').setValue(workDay.date);
        if (!this.admin) {
            this.workDayEditGroup.get('date').disable();
        }

        if (workDay.expenses.length === 0) {
            this.getExpenses().push(this.initExpense());
        } else {
            for (const expense of workDay.expenses) {
                this.getExpenses().push(this.initExpense(expense));
            }
        }

        if (workDay.drives.length === 0) {
            this.getDrives().push(this.initDrive());
        } else {
            for (const drive of workDay.drives) {
                this.getDrives().push(this.initDrive(drive));
            }
        }

        if (workDay.eating_place !== undefined && workDay.eating_place !== null) { //TODO: check why eating_place is null
            this.workDayEditGroup.get('eating_place_id').setValue(workDay.eating_place.id);
        }

        if ((this.workDayError || this.workDayCompleted) && !this.admin) {
            console.warn('WorkDayGeneral: FormGroup is disabled');
            this.workDayEditGroup.disable();
            this.editDisabled = true;
        }
    }

    initWorkDayFinishGroup(): void {
        this.workDayEditGroup = new FormGroup({
            date: new FormControl(),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            work_phases: new FormArray([]),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            job_sections: new FormArray([]),
            expenses: new FormArray([]),
            drives: new FormArray([]),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            eating_place_id: new FormControl(1)
        }, {validators: timeValidator});
    }

    initWorkPhase(workPhase?: WorkPhase): FormGroup {
        if (workPhase === undefined) {
            return new FormGroup({
                checkin: new FormControl(''),
                checkout: new FormControl(''),
            });
        } else {
            let checkout = workPhase.checkout;
            let checkin = workPhase.checkin;
            if (checkout === undefined) {
                checkout = checkin;
            }
            if (checkin.length >= 5) {
                checkin = checkin.substr(0, 5);
            }
            if (checkout.length >= 5) {
                checkout = checkout.substr(0, 5);
            }
            return new FormGroup({
                checkin: new FormControl(checkin),
                checkout: new FormControl(checkout)
            });
        }
    }

    initJobSection(workSection: JobSection): FormGroup {
        return this.initJobSectionManually(workSection.minutes,
            workSection.job === undefined ? 0 : workSection.job.id,
            workSection.job === undefined ? 'Instandhaltung' : workSection.job.displayable_name);
    }

    initJobSectionManually(minutes: number, jobId: number, name: string): FormGroup {
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
                amount: new FormControl('')
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
        return this.workDayEditGroup.get('drives') as FormArray;
    }

    getExpenses(): FormArray {
        return this.workDayEditGroup.get('expenses') as FormArray;
    }

    getJobSections(): FormArray {
        return this.workDayEditGroup.get('job_sections') as FormArray;
    }

    getWorkPhases(): FormArray {
        return this.workDayEditGroup.get('work_phases') as FormArray;
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
        this.getJobSections().at(index).get('readable_time').setValue(hourString);
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
        this.getJobSections().controls.forEach((_, index) => {
            if (this.getMinutesAt(index) < 0) {
                console.error('WorkDayComponent: There is at least 1 negative minute amount present -> RESET');
                this.resetMinutes();
            }
        });
    }

    refreshDisplayableMinutes(): void {
        this.getJobSections().controls.forEach((_, index) => {
            this.calculateTimeDisplay(index);
        });
    }

    resetMinutes(): void {
        this.getJobSections().controls.forEach((_, index) => {
            this.setMinutesAt(index, 0);
        });
        this.setMinutesAtLast(this.maxMinutes);
    }

    setMinutesAt(index: number, value: number) {
        this.getJobSections().at(index).get('minutes').setValue(value.toString(), {emitEvent: false});
    }

    getMinutesAt(index: number):
        number {
        return parseInt(this.getJobSections().at(index).get('minutes').value, 10);
    }

    getMinutesAtLast(): number {
        const length = this.getJobSections().controls.length;
        return this.getMinutesAt(length - 1);
    }

    setMinutesAtLast(value: number): void {
        const length = this.getJobSections().controls.length;
        this.setMinutesAt(length - 1, value);
    }

    getMinutesSum(skipIndex?: number): number {
        let totalMinutes = 0;
        this.getJobSections().controls.forEach((element, index) => {
            if (skipIndex !== undefined && skipIndex === index) {
                return;
            }
            totalMinutes += parseInt(element.get('minutes').value, 10);
        });
        return totalMinutes;
    }

    onWorkDayStartClick() {
        this.submitted = true;
        const workDayStart: WorkDayStart = {
            code: 'TEST'
        };
        this.api.startWorkPhaseWorkDayStartPost(workDayStart).pipe(first()).subscribe((workDay) => {
                if (workDay === undefined) {
                    this.onError('Could not start workday, maybe it was already started elsewhere');
                } else {
                    window.location.reload();
                }
            },
            (error) => {
                this.onError(error);
            });
    }

    onError(error: any) {
        this.submitted = false;
        console.error(error);
        this.snackBar.open('Fehler: Aktion konnte nicht ausgeführt werden');
    }

    onWorkDayStopClick() {
        this.submitted = true;
        const workDayStop: WorkDayStop = {
            code: 'TEST'
        };
        this.api.stopWorkPhaseWorkDayStopPost(workDayStop).pipe(first()).subscribe((workDay) => {
                if (workDay === undefined) {
                    this.onError('Could not stop workday, maybe it was already stopped somewhere else');
                } else {
                    window.location.reload();
                }
            },
            (error) => {
                this.onError(error);
            });
    }

    onRemoveExpenseClick(index: number): void {
        this.getExpenses().removeAt(index);
    }

    onAddExpenseClick(): void {
        this.getExpenses().push(this.initExpense());
    }

    expenseRemovable(): boolean {
        return this.getExpenses().length !== 0;
    }

    driveRemovable(): boolean {
        return this.getDrives().length !== 0;
    }

    onRemoveDriveClick(i: number): void {
        this.getDrives().removeAt(i);
    }

    onAddCarClick(): void {
        this.getDrives().push(this.initDrive());
    }

    onWorkDayFinishSubmit(): void {
        this.submitted = true;

        const jobSections: JobSectionCreate[] = [];
        //job_sections:
        this.getJobSections().controls.forEach((jobSectionControl) => {
            jobSections.push({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                job_id: jobSectionControl.get('job_id').value,
                minutes: parseInt(jobSectionControl.get('minutes').value, 10),
            });
        });

        //expenses:
        const expenses: ExpenseCreate[] = [];
        this.getExpenses().controls.forEach((expenseControl) => {
            if (parseFloat(expenseControl.get('amount').value) > 0) {
                expenses.push({
                    name: expenseControl.get('name').value,
                    amount: parseFloat(expenseControl.get('amount').value),
                });
            }
        });
        //drives

        const drives: DriveCreate[] = [];
        this.getDrives().controls.forEach((driveControl) => {
            if (parseFloat(driveControl.get('km').value) > 0) {
                drives.push({
                    km: parseFloat(driveControl.get('km').value),
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    car_id: parseInt(driveControl.get('car_id').value, 10),
                });
            }
        });

        const workDay: WorkDayFinish = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            eating_place_id: parseInt(this.workDayEditGroup.get('eating_place_id').value, 10),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            job_sections: jobSections,
            expenses,
            drives,
        };


        //workday
        if (!this.admin) {
            this.api.finishWorkDayWorkDayFinishPost(workDay).pipe(first()).subscribe((newWorkDay) => {
                if (newWorkDay !== undefined) {
                    window.location.reload();
                } else {
                    this.onError(newWorkDay);
                }
            }, (error) => {
                this.onError(error);
            });
        } else {
            const workPhases: WorkPhaseCreate[] = [];
            this.getWorkPhases().controls.forEach((workPhaseControl) => {
                workPhases.push({
                    checkin: workPhaseControl.get('checkin').value,
                    checkout: workPhaseControl.get('checkout').value,
                });
            });

            const date = moment(this.workDayEditGroup.get('date').value);

            if (!this.createMode) {
                const workDayUpdate: WorkDayUpdate = {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    eating_place_id: parseInt(this.workDayEditGroup.get('eating_place_id').value, 10),
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    job_sections: jobSections,
                    expenses,
                    drives,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    work_phases: workPhases,
                    date: date.format('YYYY-MM-DD')
                };
                this.api.createWorkDayWorkDayWorkDayIdPut(this.workDay.id, workDayUpdate).pipe(first()).subscribe(
                    (newWorkDay) => {
                        if (newWorkDay !== undefined) {
                            window.location.reload();
                        } else {
                            this.onError(newWorkDay);
                        }
                    }, (error) => {
                        this.onError(error);
                    });
            }
        }
    }

    refreshMaxMinutes(): void {
        let minutes = 0;
        const exampleDate = '07.07.1993';
        for (const workPhase of this.getWorkPhases().controls) {
            const start = moment(exampleDate + ' ' + workPhase.get('checkin').value, 'DD.MM.YYYY HH:mm');
            const stop = moment(exampleDate + ' ' + workPhase.get('checkout').value, 'DD.MM.YYYY HH:mm');
            const duration = moment.duration(stop.diff(start)).asMinutes();
            if (duration > 0) {
                minutes += duration;
            }
        }
        this.maxMinutes = minutes;
    }

    onRemoveWorkPhaseClick(i: number) {
        this.getWorkPhases().removeAt(i);
    }

    onAddWorkPhaseClick() {
        this.getWorkPhases().push(this.initWorkPhase());
    }

    onWorkPhaseChange() {
        this.refreshMaxMinutes();
        this.onMinuteChange(this.getJobSections().length - 1);
    }
}
