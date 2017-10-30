export function calculateLevel(value, hundred, levelStep) {
    const perc = Math.ceil(value * 100 / hundred);
    const lv = Math.max(0, Math.min(9, Math.round(perc/levelStep)));
    return {
        percentage : perc,
        level : lv
    }
}

export function isNullOrUndefined(val) {
    return val === undefined || val === null;
}