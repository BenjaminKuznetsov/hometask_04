export const isValidIsoDate = (date: string): boolean => {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
    return isoDateRegex.test(date) && !isNaN(Date.parse(date))
}