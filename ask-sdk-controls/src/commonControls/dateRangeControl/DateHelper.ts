/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

// transform date to yyyy-mm-dd dateToAlexaDateFormat
export function dateToAlexaDateFormat(date: Date): string {
    const mm = date.getMonth() + 1;
    const mmString: string = mm >= 10 ? `${mm}` : `0${mm}`;
    const dd = date.getDate();
    const ddString: string = dd >= 10 ? `${dd}` : `0${dd}`;
    return `${date.getFullYear()}-${mmString}-${ddString}`;
}

// transform yyyy-mm-dd to Date
// TODO: Handle all ALEXA.DATE format such as '2015-W49-WE'
export function alexaDateFormatToDate(date: string): Date {

    return new Date(date);
}

// Given a specific month and year, find the last date of that month
// E.G. given (2, 2020) returns 28
export function getDaysInMonth(m: number, y: number) {
    return new Date(y, m - 1, 0).getDate();
}

/**
 * Find Start / End date of the input date range
 * @param date - Alexa date format string input E.G. 2019 / 2019-04 / 2019-04-01
 * @param start - Flag to determine if the output should be the start / end of the input date range
 */
// TODO: Handle all ALEXA.DATE format such as '2015-W49-WE'
export function findEdgeDateOfDateRange(date: string, start: boolean): string {
    const yy = getYear(date);
    const mm = date.charAt(4) === '-' ? getMonth(date) : undefined;
    const dd = date.charAt(7) === '-' ? getDay(date) : undefined;
    if (mm === undefined) {
        return start ? `${yy}-01-01` : `${yy}-12-31`;
    } else if (dd === undefined) {
        const mmString: string = mm < 10 ? `0${mm}` : `${mm}`;
        return start ? `${yy}-${mmString}-01` : `${yy}-${mmString}-${getDaysInMonth(mm, yy)}`;
    }
    return date;
}

export function getYear(date: string): number {
    const yy = parseInt(date.substring(0, 4), 10);
    return yy;
}

export function getMonth(date: string): number {
    const mm = parseInt(date.substring(5, 7), 10);
    return mm;
}

export function getDay(date: string): number {
    const dd = parseInt(date.substring(8, 10), 10);
    return dd;
}

export function getEndDateOfRange(date: string): Date {
    return alexaDateFormatToDate(findEdgeDateOfDateRange(date, false));
}

export function getStartDateOfRange(date: string): Date {
    return alexaDateFormatToDate(findEdgeDateOfDateRange(date, true));
}

export function getUTCDate(date: Date): Date {
    // Get the offset between local time zone and UTC in minutes
    const offset: number = date.getTimezoneOffset();
    const utcTime = date.getTime() + offset * 60000;

    return new Date(utcTime);
}