import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);


const lastDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const startOfWeek = (d, weekStart = 0) => {
  d = new Date(d);
  let day = d.getDay(),
      diff = (day < weekStart ? 7 : 0) + day - weekStart // add when sunday
  return new Date(d.setDate(d.getDate() - diff));
}

const endOfWeek = (d, weekStart = 0) => {
	let day = d.getDay(),
		 diff = (day < weekStart ? -7 : 0) + 6 - (day - weekStart)
	return new Date(d.setDate(d.getDate() + diff));
}

const isBetween = (d1, d2) => {
	let [min, max] = [
		Math.min(d1.getTime(), d2.getTime()), 
		Math.max(d1.getTime(), d2.getTime())
	];
	
	return (curDate) => {
		return min < curDate.getTime() && max > curDate.getTime();
	}
}
 
const isValidDateFormat = (dateString) => {
    // First check for the pattern
    if(!/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split(".");
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
}

const isValidDate = (date) => {
  return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
}

const parseDate = (str, format) => {
	if (str) {
		if (str.getDate !== undefined)
			return str; // String is actually a Date
		else if (isValidDateFormat(str)) {
			return new Date(dayjs(str, format));
		}
	}
	return null;
}

const capitalize = (str) => {
	return str[0].toUpperCase() + str.slice(1, );
}

const formatDate = (date, format) => {
	return dayjs(date).format(format);
}

export {
	startOfWeek,
	endOfWeek,
	lastDayOfMonth,
	startOfMonth,
	isBetween,
	parseDate,
	formatDate,
	isValidDate,
	capitalize
};