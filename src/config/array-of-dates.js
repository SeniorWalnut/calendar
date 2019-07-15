const addDays = (d, days) => {
	let date = new Date(d);
	date.setDate(date.getDate() + days);
	return date;
}

const getDates = (startDate, stopDate) => {
    let dateArray = new Array();
    let currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(new Date (currentDate));
        currentDate = addDays(currentDate, 1);
    }
    return dateArray;
}

export { getDates }; 