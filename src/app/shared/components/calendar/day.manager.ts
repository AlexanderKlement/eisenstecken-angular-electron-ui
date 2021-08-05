interface Days {
  value: string;
  viewValue: string;
}

export class DayManager {

  startDay: number;
  amountOfDays: number;
  amountOfDaysString: string;
  shownDayArray: number[];

  constructor(startDay: number, defaultAmountOfDays: number) {
    this.startDay = startDay;
    this.amountOfDays = defaultAmountOfDays;
    this.refreshAllDayVariables();
  }

  private selectableDays: Days[] = [
    {value: '2', viewValue: '2'},
    {value: '3', viewValue: '3'},
    {value: '5', viewValue: '5'},
    {value: '7', viewValue: '7'},
    {value: '10', viewValue: '10'},
  ];

  private refreshAllDayVariables(): void {
    this.amountOfDaysString = this.amountOfDays.toString();
    this.shownDayArray = Array.from({length: this.amountOfDays}, (_, i) => i + this.startDay);
  }

  getSelectableDays(): Days[] {
    return this.selectableDays;
  }

  getShownDayArray(): number[] {
    return this.shownDayArray;
  }

  getAmountOfDaysString(): string {
    return this.amountOfDaysString;
  }

  getStartDay(): number {
    return this.startDay;
  }

  setStartDay(startDay: number): void {
    this.startDay = startDay;
    this.refreshAllDayVariables();
  }

  setAmountOfDays(amountOfDays: number): void {
    this.amountOfDays = amountOfDays;
    this.refreshAllDayVariables();
  }

  moveStartDayRight(): void {
    this.startDay++;
    this.refreshAllDayVariables();
  }

  moveStartDayLeft(): void {
    this.startDay--;
    this.refreshAllDayVariables();
  }

}
