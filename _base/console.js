// Module for Console Logging

// Color Codes
const reset = "\x1b[0m";
const red = "\x1b[31;1m";
const gray = "\x1b[90m";
const lightBlue = "\x1b[96m";    



function logInfo(message) {
    const t = new Date().toISOString()
    const logMessage = `${gray}${t} ${lightBlue}${message}`
    console.log(logMessage);
}

function logError(message) {
    const t = new Date().toISOString()
    const logMessage = `${gray}${t} ${red}${message}`
    console.log(logMessage);
}

module.exports = { logInfo, logError }