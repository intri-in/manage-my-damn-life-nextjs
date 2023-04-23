export function getICS(obj)
{
    var icalToolkit = require('ical-toolkit');
    var builder = icalToolkit.createIcsFileBuilder();
    builder.spacers = false; //Add space in ICS file, better human reading. Default: true
    builder.NEWLINE_CHAR = '\n'; //Newline char to use.
    builder.throwError = true; //If true throws errors, else returns error when you do .toString() to generate the file contents.
    builder.ignoreTZIDMismatch = true; //If TZID is invalid, ignore or not to ignore!

    builder.method = '';
    builder.events.push(obj)
    var icsFileContent = builder.toString();

    return icsFileContent
}