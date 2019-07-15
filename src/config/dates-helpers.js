const lastDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const startOfMonth = (date, mondayFirst = false) => new Date(date.getFullYear(), date.getMonth(), 1 );

const startOfWeek = (d) => {
  d = new Date(d);
  let day = d.getDay(),
      diff = d.getDate() - day + (day === 0 ? -6 : 1); // add when sunday
  return new Date(d.setDate(diff));
}

// const endOfWeek = (d) => {
// 	return new Date(d.setDate(startOfWeek(d) + 6));
// }

export {
	startOfWeek,
	// endOfWeek,
	lastDayOfMonth,
	startOfMonth
};