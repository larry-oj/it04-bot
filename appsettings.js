import * as fs from 'fs';

export const as = JSON.parse(fs.readFileSync("./appsettings.json", 'utf-8'));