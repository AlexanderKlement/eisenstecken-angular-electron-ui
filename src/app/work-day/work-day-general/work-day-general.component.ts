import {Component, Input, OnInit} from '@angular/core';
import {
    Car,
    DefaultService,
    Drive, DriveCreate,
    EatingPlace,
    Expense, ExpenseCreate, JobSection, JobSectionCreate,
    WorkDay, WorkDayFinish, WorkDayStart, WorkDayStop, WorkPhase
} from 'eisenstecken-openapi-angular-library';
import {first} from 'rxjs/operators';
import {Observable, ReplaySubject} from 'rxjs';
import {
    FormArray,
    FormControl,
    FormGroup, Validators,
} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {CustomButton} from '../../shared/components/toolbar/toolbar.component';


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

    editDisabled = false;


    constructor(private api: DefaultService, private snackBar: MatSnackBar, private router: Router) {
    }

    ngOnInit(): void {
        this.initWorkDayFinishGroup();
        if (this.admin) {
            if (this.workDay === undefined) {
                console.error('WorkDayGeneral: You have to provide a workday if you load this component in admin mode');
                return;
            }
            this.initWorkDayEditSection(this.workDay);
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

        if (workDay.eating_place !== undefined) {
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
            // eslint-disable-next-line @typescript-eslint/naming-convention
            work_phases: new FormArray([]),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            job_sections: new FormArray([]),
            expenses: new FormArray([]),
            drives: new FormArray([]),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            eating_place_id: new FormControl(1)
        },);
    }

    initWorkPhase(workPhase?: WorkPhase): FormGroup {
        if (workPhase === undefined) {
            return new FormGroup({
                checkin: new FormControl(''),
                checkout: new FormControl(''),
            });
        } else {
            let checkout = workPhase.checkout;
            if (checkout === undefined) {
                checkout = workPhase.checkin;
            }
            return new FormGroup({
                checkin: new FormControl(workPhase.checkin),
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

    setMinutesAtLast(value: number):
        void {
        const length = this.getJobSections().controls.length;
        console.log('Setting minutes at last: ' + value.toString());
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

        this.api.finishWorkDayWorkDayFinishPost(workDay).pipe(first()).subscribe((newWorkDay) => {
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
