export function clockFields(now, timezone) {
    const date = new Date(now);
    return [
        { name: 'day', value: date.getDate(), min: 1, max: 31, pad: 2 },
        { name: 'month', value: date.getMonth() + 1, min: 1, max: 12, pad: 2 },
        { name: 'year', value: date.getFullYear(), min: 2000, max: 2099, pad: 4 },
        { name: 'hour', value: date.getHours(), min: 0, max: 23, pad: 2 },
        { name: 'minute', value: date.getMinutes(), min: 0, max: 59, pad: 2 },
        { name: 'timezone', value: timezone, min: -720, max: 840, step: 15 },
    ];
}
export function adjustField(field, direction) {
    const next = field.value + direction * (field.step || 1);
    field.value = next > field.max ? field.min : next < field.min ? field.max : next;
}
export function fieldValues(fields) {
    return Object.fromEntries(fields.map(field => [field.name, field.value]));
}
export function validDate({ day, month, year }) {
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
export function timezoneText(minutes) {
    return (minutes < 0 ? '-' : '+') + String(Math.floor(Math.abs(minutes) / 60)) + ':' + String(Math.abs(minutes) % 60).padStart(2, '0');
}
