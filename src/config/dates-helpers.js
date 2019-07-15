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

export {
	startOfWeek,
	endOfWeek,
	lastDayOfMonth,
	startOfMonth
};