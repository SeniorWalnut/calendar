import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);


const lastDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const startOfMonth = (date, mondayFirst = false) => new Date(date.getFullYear(), date.getMonth(), 1 );

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

const parseDate = (str, format) => {
	if (str) {
		if (str.getDate !== undefined)
			return str; // String is actually a Date
		return new Date(dayjs(str, format));
	}
	return null;
}

const isValidDate = (date) => {
  return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
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
	isValidDate
};