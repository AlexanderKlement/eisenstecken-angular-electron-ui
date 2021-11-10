import {Component, ElementRef, Input, OnInit, Renderer2} from '@angular/core';
import {
    AdditionalWorkload, AdditionalWorkloadCreate,
    Car,
    DefaultService,
    Drive, DriveCreate,
    EatingPlace,
    Expense, ExpenseCreate, Job, JobSectionCreate,
    WorkDay, WorkDayCreate, WorkDayFinish, WorkDayStart, WorkDayStop, WorkDayUpdate, WorkPhase, WorkPhaseCreate
} from 'eisenstecken-openapi-angular-library';
import {first} from 'rxjs/operators';
import {forkJoin, Observable, ReplaySubject} from 'rxjs';
import {
    AbstractControl,
    FormArray,
    FormControl,
    FormGroup, ValidationErrors, ValidatorFn, Validators,
} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NgxMaterialTimepickerTheme} from 'ngx-material-timepicker';
import * as moment from 'moment';
import * as confetti from 'canvas-confetti';
import {StopwatchService} from './stopwatch/stopwatch.service';
import {AuthService} from '../../shared/services/auth.service';
import {Router} from '@angular/router';
import {minutesToDisplayableString} from '../../shared/date.util';
import {timepickerTheme} from '../../shared/themes/timepicker.theme';


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
        if (moment.duration(endTimeMoment.diff(startTimeMoment)).asMinutes() < 0) {
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
    @Input() userId?: number;

    workDayEditGroup: FormGroup;
    eatingPlaces$: Observable<EatingPlace[]>;

    cars$: ReplaySubject<Car[]>;

    minuteFormatFunction = minutesToDisplayableString;

    maxMinutes = 0;
    remainingMinutes = 0;

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
    canvas: any;
    timerShowing = true;
    showForm = false;


    primaryTheme = timepickerTheme;
    username = '';


    constructor(private api: DefaultService, private snackBar: MatSnackBar, private renderer2: Renderer2, private router: Router,
                private elementRef: ElementRef, private stopwatchService: StopwatchService, private authService: AuthService) {
    }

    startTimer(): void {
        this.stopwatchService.start();
    }

    stopTimer(): void {
        this.stopwatchService.stop();
    }

    ngOnInit(): void {
        this.initWorkDay();
        this.initConfetti();
    }

    initWorkDayEditSection(workDay?: WorkDay): void {

        this.cars$ = new ReplaySubject<Car[]>(1);
        this.api.getCarsCarGet().pipe(first()).subscribe((cars) => {
            this.cars$.next(cars);
        });

        this.eatingPlaces$ = this.api.getEatingPlacesEatingPlaceGet();

        this.authService.getCurrentUser().pipe(first()).subscribe((user) => {
            const jobsAccepted$ = this.api.readJobsJobGet(0, 1000, '', undefined, 'JOBSTATUS_ACCEPTED', true).pipe(first());
            const jobsCreated$ = this.api.readJobsJobGet(0, 1000, '', undefined, 'JOBSTATUS_CREATED', true).pipe(first());
            if (user.office) {
                forkJoin([jobsAccepted$, jobsCreated$]).subscribe(([jobsCreated, jobsAccepted]) => {
                    jobsCreated.concat(jobsAccepted);
                    this.pushJobsToJobSection(jobsCreated);
                });
            } else {
                jobsAccepted$.subscribe((jobs) => {
                    this.pushJobsToJobSection(jobs);
                });
            }
        });


        if (workDay !== undefined) {
            this.username = workDay.user.fullname;
            this.maxMinutes = workDay.length_minutes;

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

            for (const additionalWorkload of workDay.additional_workloads) {
                this.getAdditionalWorkloads().push(this.initAdditionalWorkload(additionalWorkload));
            }

            if (workDay.eating_place !== undefined && workDay.eating_place !== null) {
                this.workDayEditGroup.get('eating_place_id').setValue(workDay.eating_place.id);
            }


            if ((this.workDayError || this.workDayCompleted) && !this.admin) {
                console.warn('WorkDayGeneral: FormGroup is disabled');
                this.workDayEditGroup.disable();
                this.editDisabled = true;
            }
        } else {
            this.api.readUserUsersUserIdGet(this.userId).pipe(first()).subscribe(user => {
                this.username = user.fullname;
            });
            this.maxMinutes = 0;
            this.getWorkPhases().push(this.initWorkPhase());
            this.workDayEditGroup.get('date').setValue(new Date());
            this.getExpenses().push(this.initExpense());
            this.getDrives().push(this.initDrive());
            this.workDayEditGroup.get('eating_place_id').setValue(1);
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
            eating_place_id: new FormControl(0, Validators.required),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            additional_workloads: new FormArray([])
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
            if (checkout === undefined || checkout === null) {
                checkout = moment().format('LT');
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

    // eslint-disable-next-line @typescript-eslint/naming-convention
    initJobSectionManually(minutes: number, minutes_direction: number, jobId: number, name: string): FormGroup {
        return new FormGroup({
            minutes: new FormControl(minutes, Validators.pattern('^\\+?(0|[1-9]\\d*)$')),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            minutes_direction: new FormControl(minutes_direction, Validators.pattern('^\\+?(0|[1-9]\\d*)$')),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            job_id: new FormControl(jobId),
            name: new FormControl(name),
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

    initAdditionalWorkload(additionalWorkload?: AdditionalWorkload): FormGroup {
        if (!additionalWorkload) {
            return new FormGroup({
                minutes: new FormControl(0),
                description: new FormControl('')
            });
        } else {
            return new FormGroup({
                minutes: new FormControl(additionalWorkload.minutes),
                description: new FormControl(additionalWorkload.description)
            });
        }
    }

    getAdditionalWorkloads(): FormArray {
        return this.workDayEditGroup.get('additional_workloads') as FormArray;
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

    getJobSectionsMinutesAt(index: number): FormControl {
        return this.getJobSections().at(index).get('minutes') as FormControl;
    }

    getJobSectionsDirectionMinutesAt(index: number): FormControl {
        return this.getJobSections().at(index).get('minutes_direction') as FormControl;
    }

    getAdditionalWorkloadsAt(index: number): FormControl {
        return this.getAdditionalWorkloads().at(index).get('minutes') as FormControl;
    }

    getWorkPhases(): FormArray {
        return this.workDayEditGroup.get('work_phases') as FormArray;
    }

    onMinuteChange(index: number, direction: boolean): void {
        this.refreshRemainingMinutes();
        if (this.remainingMinutes < 0) {
            const currentMinutes = this.getMinutesAt(index, direction);
            this.setMinutesAt(index, this.maxMinutes - this.getMinutesSum() + currentMinutes, direction);
        }
        this.refreshRemainingMinutes();
    }

    onAdditionalMinuteChange(index: number): void {
        this.refreshRemainingMinutes();
        if (this.remainingMinutes < 0) {
            const currentMinutes = this.getAdditionalMinutesAt(index);
            this.setAdditionalMinutesAt(index, this.maxMinutes - this.getMinutesSum() + currentMinutes);
        }
        this.refreshRemainingMinutes();
    }

    setMinutesAt(index: number, value: number, direction: boolean) {
        let minuteString = 'minutes';
        if (direction) {
            minuteString = 'minute_direction';
        }
        this.getJobSections().at(index).get(minuteString).setValue(value.toString());
    }

    setAdditionalMinutesAt(index: number, value: number) {
        this.getAdditionalWorkloads().at(index).get('minutes').setValue(value.toString());
    }

    getMinutesAt(index: number, direction: boolean): number {
        let minuteString = 'minutes';
        if (direction) {
            minuteString = 'minute_direction';
        }
        return parseInt(this.getJobSections().at(index).get(minuteString).value, 10);
    }

    getAdditionalMinutesAt(index: number): number {
        return parseInt(this.getAdditionalWorkloadsAt(index).value, 10);
    }

    getMinutesSum(): number {
        let totalMinutes = 0;
        for (const jobSection of this.getJobSections().controls) {
            totalMinutes += parseInt(jobSection.get('minutes').value, 10);
            totalMinutes += parseInt(jobSection.get('minutes_direction').value, 10);
        }
        for (const additionalWorkload of this.getAdditionalWorkloads().controls) {
            totalMinutes += parseInt(additionalWorkload.get('minutes').value, 10);
        }
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
                    this.initWorkDay();
                    this.startTimer();
                }
            },
            (error) => {
                this.onError(error);
            });
    }

    onError(error: any) {
        this.submitted = false;
        console.error(error);
        this.snackBar.open('Fehler: Aktion konnte nicht ausgeführt werden', 'Ok', {
            duration: 10000
        });
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
                    //this.router.navigate([this.router.url])
                    this.initWorkDay();
                    this.stopTimer();
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

    onAddAdditionalMinutesClick(): void {
        this.getAdditionalWorkloads().push(this.initAdditionalWorkload());
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
        if (!this.minutesDistributed()) {
            return;
        }
        this.submitted = true;

        const jobSections: JobSectionCreate[] = [];
        //job_sections:
        this.getJobSections().controls.forEach((jobSectionControl) => {
            jobSections.push({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                job_id: jobSectionControl.get('job_id').value,
                minutes: parseInt(jobSectionControl.get('minutes').value, 10),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                minutes_direction: jobSectionControl.get('minutes_direction').value
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

        const additionalWorkloads: AdditionalWorkloadCreate[] = [];
        for (const additionalWorkload of this.getAdditionalWorkloads().controls) {
            additionalWorkloads.push({
                minutes: parseInt(additionalWorkload.get('minutes').value, 10),
                description: additionalWorkload.get('description').value
            });
        }

        const workDay: WorkDayFinish = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            eating_place_id: parseInt(this.workDayEditGroup.get('eating_place_id').value, 10),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            job_sections: jobSections,
            expenses,
            drives,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            additional_workloads: additionalWorkloads
        };


        //workday
        if (!this.admin) {
            this.api.finishWorkDayWorkDayFinishPost(workDay).pipe(first()).subscribe((newWorkDay) => {
                if (newWorkDay !== undefined) {
                    //this.router.navigate([this.router.url])
                    this.initWorkDay();
                    this.confetti();
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
                    date: date.format('YYYY-MM-DD'),
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    additional_workloads: additionalWorkloads
                };
                this.api.updateWorkDayWorkDayWorkDayIdPut(this.workDay.id, workDayUpdate).pipe(first()).subscribe(
                    (newWorkDay) => {
                        if (newWorkDay !== undefined) {
                            //this.router.navigate([this.router.url])
                            this.initWorkDay();
                        } else {
                            this.onError(newWorkDay);
                        }
                    }, (error) => {
                        this.onError(error);
                    });
            } else {
                const workDayCreate: WorkDayCreate = {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    eating_place_id: parseInt(this.workDayEditGroup.get('eating_place_id').value, 10),
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    job_sections: jobSections,
                    expenses,
                    drives,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    work_phases: workPhases,
                    date: date.format('YYYY-MM-DD'),
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    user_id: this.userId,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    additional_workloads: additionalWorkloads
                };
                this.api.createWorkDayWorkDayUserIdPost(this.userId, workDayCreate).pipe(first()).subscribe(
                    (newWorkDay) => {
                        if (newWorkDay !== undefined) {
                            this.router.navigateByUrl('/employee/' + this.userId.toString());
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

    refreshRemainingMinutes(): void {
        this.remainingMinutes = this.maxMinutes - this.getMinutesSum();
    }

    onRemoveWorkPhaseClick(i: number) {
        this.getWorkPhases().removeAt(i);
    }

    onAddWorkPhaseClick() {
        this.getWorkPhases().push(this.initWorkPhase());
    }

    onWorkPhaseChange() {
        this.refreshMaxMinutes();
        this.refreshRemainingMinutes();
    }

    initConfetti() {
        this.canvas = this.renderer2.createElement('canvas');
        this.renderer2.appendChild(this.elementRef.nativeElement, this.canvas);

    }

    confetti() {
        if (!this.canvas) {
            console.error('Canvas not initialized');
            return;
        }

        const myConfetti = confetti.create(this.canvas, {
            particleCount: 150,
            startVelocity: 30,
            spread: 360,
            resize: true,
            disableForReducedMotion: true
        });
        myConfetti();
    }

    finishWorkDayClicked() {
        this.showForm = true;
    }

    private pushJobsToJobSection(jobs: Job[]): void {
        for (const job of jobs) {
            this.getJobSections().push(this.initJobSectionManually(0, 0, job.id, job.displayable_name));
        }
        this.getJobSections().push(this.initJobSectionManually(0, 0, 0, 'Instandhaltung'));

        if (this.workDay !== undefined) {
            let found = false;
            for (const jobSection of this.workDay.job_sections) {
                found = false;
                console.log(jobSection);
                for (const jobSectionFormGroup of this.getJobSections().controls) {
                    console.log(jobSectionFormGroup);
                    if (parseInt(jobSectionFormGroup.get('job_id').value, 10) === 0 && !jobSection.job) {
                        jobSectionFormGroup.get('minutes').setValue(jobSection.minutes); //direction does not exist for those
                        found = true;
                    } else {
                        if (jobSection.job === undefined || jobSection.job === null) {
                            continue;
                        }
                        console.log(parseInt(jobSectionFormGroup.get('job_id').value, 10));
                        console.log(jobSection.job.id);
                        if (parseInt(jobSectionFormGroup.get('job_id').value, 10) === jobSection.job.id) {
                            jobSectionFormGroup.get('minutes').setValue(jobSection.minutes);
                            jobSectionFormGroup.get('minutes_direction').setValue(jobSection.minutes_direction);
                            found = true;
                        }
                    }
                }
                if (!found) {
                    this.api.readJobJobJobIdGet(jobSection.job.id).pipe(first()).subscribe((job) => {
                        this.getJobSections().push(this.initJobSectionManually(
                            jobSection.minutes,
                            jobSection.minutes_direction,
                            jobSection.job.id,
                            job.displayable_name
                        ));
                    });
                }
            }
        }
    }

    private minutesDistributed(): boolean {
        this.refreshRemainingMinutes();
        if (this.remainingMinutes > 0) {
            this.snackBar.open('Achtung: Die Arbeitszeit muss bis auf die letzte Minute aufgeteilt werden', 'OK', {
                duration: 10000
            });
            return false;
        }
        if (this.remainingMinutes < 0) {
            this.snackBar.open('Fehler: Arbeitszeiten konnten nicht aufgeteilt werden', 'OK', {
                duration: 10000
            });
            console.warn('WorkDayGeneral: Remaining minutes < 0 -> this should not be possible');
            return false;
        }
        return true;
    }

    private initWorkDay() {
        this.submitted = false;
        this.initWorkDayFinishGroup();
        if (this.admin) {
            this.workDayStartable = false;
            this.workDayFinishable = true;
            this.workDayStopable = false;
            this.workDayError = true;
            this.workDayCompleted = false;
            if (this.workDay === undefined) {
                if (this.userId === undefined || this.userId === null) {
                    console.error('WorkDayGeneral: Cannot create new workDay without user id');
                    return;
                }
                this.createMode = true;
                this.initWorkDayEditSection();
            } else {
                this.initWorkDayEditSection(this.workDay);
            }
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
}



