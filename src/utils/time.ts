export function sumHours(hoursArray: any) {
    const totalMinutes = hoursArray.reduce((total: any, time: any) => {
        const [hours, minutes] = time.split(':').map(Number);
        return total + hours * 60 + minutes;
    }, 0);

    let totalHours = Math.floor(totalMinutes / 60);
    let remainingMinutes = totalMinutes % 60;

    //@ts-ignore
    totalHours = totalHours.toString().padStart(2, '0');

    //@ts-ignore
    remainingMinutes = remainingMinutes.toString().padStart(2, '0');

    return `${totalHours}:${remainingMinutes}`;
}