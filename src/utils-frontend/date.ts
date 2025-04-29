export function stringFormatDateTime(date?: string) {
    if (!date) return null;
    const [year, month, day] = date.split('-');
    const formattedDate = `${month}/${day}/${year}`;
    return formattedDate;
}
