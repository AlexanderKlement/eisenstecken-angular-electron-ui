export function minutesToDisplayableString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours.toString() + ' Stunden und ' + remainingMinutes.toString() + ' Minuten';
}
