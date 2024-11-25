export const isValidIsoDate = (date: string): boolean => {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
    return isoDateRegex.test(date) && !isNaN(Date.parse(date))
}

export const generateText = (length: number): string => {
    const characters = "ABCD EFGHIJ KLMNOPQRS TUVWXYZ abcdefg hijklm nopqrs tuvwxyz 0123456 789"
    let result = ""
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        result += characters.charAt(randomIndex)
    }
    return result.trim()
}