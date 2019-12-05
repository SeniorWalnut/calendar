<template>
		<div class="calendar-wrapper">
			<div class="calendar__top calendar-top">
				<div
					class="calendar-buttons"
					v-if="topButtons"
				>
					<div
							class="calendar-buttons__one"
							@click="chooseOption('one')"
							:class="{active: selectedOption === 'one'}"
						> {{ buttonNames[0] }}
					</div>
					<div
							class="calendar-buttons__range"
							@click="chooseOption('range')"
							:class="{active: selectedOption === 'range'}"
						>{{ buttonNames[1] }}</div>
					</div>
			</div>
			<div class="calendar-main">
				<div class="calendar-main__calendars">
					<div
						class="calendar calendar-left"
					>
						<div class="calendar__selects">
							<option-select
								:cur-val="capitalLocalMonth"
								@click="monthWindow = $event; yearWindow  = false"
								@arrow-left="correlateMonths(true, '-')"
								@arrow-right="correlateMonths(true, '+')"
							/>
							<option-select
								:cur-val="localYear"
								@click="yearWindow = $event; monthWindow = false"
								@arrow-left="correlateYears(true, '-')"
								@arrow-right="correlateYears(true, '+')"
							/>
						</div>
						<template v-if="!checkSetWindow">
							<div
								class="calendar-date__day-names"
							>
								<div v-for="name in dayNames">
									{{ name }}
								</div>
							</div>
							<table
								class="calendar-date"
							>
								<tr
									class="calendar-date__week"
									v-for="week in days.slice(0, weekCount)"
								>
									<td v-for="day in week">
										<day-cell
										  :day="day"
										  @set-day="setDay"
										  @hovered="hoverRange"
										/>
									</td>
								</tr>
							</table>
						</template>
						<div
							class="calendar__set-windows"
							v-if="checkSetWindow"
						>
							<set-window
								:disabled="yearsToDisable"
								:values="currentWindow"
								:arrows="!monthWindow"
								:cur-val="currentWindowVal"
								@set-val="setWindowVal"
								@arrow-left="changeYears(-1)"
								@arrow-right="changeYears(1)"
							/>
						</div>
					</div>
					<div
						class="calendar calendar-right"
						v-if="isDouble"
					>
						<div
							class="calendar__selects"
							v-if="isDouble"
							:class="{'doubled-right': isDouble}"
						>
							<option-select
								@click="nextMonthWindow = $event; nextYearWindow = false"
								:cur-val="capitalNextMonth"
								@arrow-left="correlateMonths(false, '-')"
								@arrow-right="correlateMonths(false, '+')"
							/>
							<option-select
								@click="nextYearWindow = $event; nextMonthWindow = false"
								:cur-val="nextMonthYear"
								@arrow-left="correlateYears(false, '-')"
								@arrow-right="correlateYears(false, '+')"
							/>
						</div>
						<template v-if="!checkSecondSetWindow">
							<div
								class="calendar-date__day-names">
								<div v-for="name in dayNames">
									{{ name }}
								</div>
							</div>
							<table class="calendar-date">
								<tr
									class="calendar-date__week"
									v-for="week in days.slice(weekCount,)"
								>
									<td v-for="day in week">
										<day-cell
										  :day="day"
										  @set-day="setDay"
										  @hovered="hoverRange"
										/>
									</td>
								</tr>
							</table>
						</template>
						<div
						class="calendar__set-windows"
						v-if="isDouble && checkSecondSetWindow"
					>
						<set-window
							:disabled="yearsToDisable"
							:values="nextWindow"
							:arrows="!nextMonthWindow"
							:cur-val="nextWindowVal"
							@set-val="setNextWindowVal"
							@arrow-left="changeYears(-1)"
							@arrow-right="changeYears(1)"
						/>
					</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>

import DayCell from './DayCell';
import OptionSelect from "./OptionSelect";
import SetWindow from "./SetWindow";
import { getDates } from '../config/array-of-dates.js';
import dayjs from 'dayjs';
import {
	startOfWeek,
	endOfWeek,
	lastDayOfMonth,
	startOfMonth,
	isBetween,
	formatDate,
	isValidDate,
	capitalize
} from '../config/dates-helpers.js';

export default {
	components: {
		DayCell,
		SetWindow,
		OptionSelect
	},
	data() {
		return {
			localDate: null,
			localMonth: null,
			localYear: null,
			days: [],
			currentDate: null,
			selectedOption: this.option,
			hovering: false,
			nextLocalMonth: null,
			nextMonthYear: null,
			weekCount: 0,
			monthWindow: false,
			yearWindow: false,
			nextDate: null,
			nextMonthWindow: false,
			nextYearWindow: false,
		}
	},
	props: {
		disableBefore: { type: Date, default: () => null },
		disableAfter: { type: Date, default: () => null},
		locale: { type: String, default: 'en'},
		topButtons: { type: Boolean, default: false},
		isDouble: { type: Boolean, default: false},
		value: { type: [Object], default: null},
		option: { type: String, default: 'one'},
		buttonNames: { type: Array, default: () => []}

	},
	watch: {
		locale(val) {
			this.changeLocale(val);
		}
	},
	created() {
		const after = this.disableAfter;
		const before = this.disableBefore;
		const locale = this.locale.toLowerCase();
		this.currentDate = this.value;

		if (!this.value || (!this.value.start && !this.value.end)) {
			this.localDate = new Date(new Date().setHours(0, 0, 0, 0));
			this.currentDate.start = this.localDate
		} else if (!isValidDate(this.value))
			this.localDate = this.currentDate.start;

		if (before && new Date(before.setHours(0, 0, 0, 0)).getTime() > this.currentDate.start.getTime()) {
			this.localDate = before;
			this.currentDate.start = before;
		}
		if (after && new Date(after.setHours(0, 0, 0, 0)).getTime() < this.currentDate.start.getTime()) {
			this.localDate = after;
			this.currentDate.start = after;
		}

		this.localMonth = capitalize(formatDate(
			this.localDate,
			'MMM',
			{ locale }
		));

		if (this.value.end)
			this.selectedOption = "range";

		this.localYear = this.localDate.getFullYear();

		let nextMonth = this.localDate.getMonth() + 1;
		this.nextLocalMonth = capitalize(formatDate(
			new Date(new Date().setMonth(nextMonth)),
			'MMM',
			{ locale }
		));

		const year = this.localDate.getFullYear();
		let nextYear = year;
		if (nextMonth === 12) {
			nextYear++;
			nextMonth = 0;
		}
		this.nextMonthYear = +formatDate(
			new Date(new Date().setFullYear(nextYear)),
			'YYYY',
			{ locale }
		);
		console.log(nextYear, nextMonth);
		this.nextDate = new Date(nextYear, nextMonth);

		this.currentDate.start = new Date(this.currentDate.start.setHours(0, 0, 0, 0));
		if (this.currentDate.end)
			this.currentDate.end = new Date(this.currentDate.end.setHours(0, 0, 0, 0));

		this.changeLocale(locale);
		this.$emit('set-option', this.selectedOption);
	},
	methods: {
		changeLocale(val) {
			const locale = val.toLowerCase();
			import('dayjs/locale/' + locale)
			.then(data => {
				dayjs.locale(locale);
			})
			.then(() => {
				this.localMonth = capitalize(formatDate(
				this.localDate,
					'MMM',
					{ locale }
				));

				if (this.isDouble) {
					this.nextLocalMonth = capitalize(formatDate(
						new Date(new Date().setMonth(this.localDate.getMonth() + 1)),
						'MMM',
						{ locale }
					));
				}
				this.monthDays();
				this.handleDays((day) => {
					day.value.setHours(0, 0, 0, 0);
					day.isActive = day.value.getTime() === this.currentDate.start.getTime()
					|| this.currentDate.end && day.value.getTime() === this.currentDate.end.getTime()
				});
			})
		},
 		handleDays(func = null) {
			this.days.forEach(week => {
				week.forEach(day => func(day))
			})
		},
		monthCondition(month) {
			return month === 12
				? 0
				: (month === -1 ? 11 : month);
		},
		yearCondition(month) {
			return month === 12
				? 1
				: (month === -1 ? -1 : 0);
		},
		correlateMonths(isLocal, action) {
			if (isLocal) {
				let month = this.getMonth(this.localDate) + (action === '+' ? 1 : -1);
				let year = this.getYear(this.localDate);

				let localMonth = this.monthCondition(month);
				let localYear = year + this.yearCondition(month);
				let nextMonth = localMonth + 1;

				this.setDate(localMonth, localYear);
				this.isDouble && this.setNextDate(
					 this.monthCondition(nextMonth),
					 localYear + this.yearCondition(nextMonth)
				);
			} else {
				let month = this.getMonth(this.nextDate);
				let year = this.getYear(this.nextDate);

				let nextMonth = this.monthCondition(month) + (action === '+' ? 1 : -1) ;
				let nextYear = year + this.yearCondition(month);

				this.isDouble && this.setNextDate(nextMonth, nextYear);
				this.setDate(
					this.monthCondition(nextMonth - 1),
					nextYear + this.yearCondition(nextMonth - 1)
				);
			}

			this.monthDays();
		},
		correlateYears(isLocal, action) {
			if (isLocal) {
				const month = this.getMonth(this.localDate);
				const nextMonth = this.getMonth(this.nextDate);
				let year = this.getYear(this.localDate) + (action === '+' ? 1 : -1);
				this.setDate(month, year);
				this.isDouble && this.setNextDate(nextMonth, year + (month === 11 ? 1 : 0));
			} else {
				const month = this.getMonth(this.localDate);
				const nextMonth = this.getMonth(this.nextDate);
				let year = this.getYear(this.nextDate) + (action === '+' ? 1 : -1);
				this.isDouble && this.setNextDate(nextMonth, year);
				this.setDate(month, year + (month - 1 === 0 ? -1 : 0));
			}
			this.monthDays();
		},
		setDate(month, year) {
			let date = new Date(year, month, 1, 0, 0, 0, 0);

			this.localDate = date;
			this.localMonth = capitalize(formatDate(
				date,
				'MMM',
				{ locale: this.locale})
			);
			this.localYear = this.getYear(date);
		},
		setNextDate(month, year) {
			let date = new Date(year, month, 1, 0, 0, 0, 0);

			this.nextDate = date;
			this.nextLocalMonth = capitalize(formatDate(
				date,
				'MMM',
				{ locale: this.locale})
			);
			this.nextMonthYear = this.getYear(date);
		},
		monthDays() {
			this.days = [];
			let firstDay = startOfMonth(this.localDate);
			let resCurMonth = this.mapDates([
			...getDates(
					startOfWeek(
						firstDay, true
					),
					endOfWeek(
						lastDayOfMonth(
							firstDay
						),true
					)
			)], firstDay);

			this.weekCount = resCurMonth.length / 7;

			if (this.isDouble) {
				let firstDayNext = startOfMonth(this.nextDate);
				let resNextMonth = this.mapDates([
					...getDates(
						startOfWeek(
							firstDayNext, true),
						endOfWeek(lastDayOfMonth(
							firstDayNext), true)
				)], firstDayNext);

				resCurMonth = resCurMonth.concat(resNextMonth);
			}


			for (var i = 0; i < resCurMonth.length - 7; i+= 7)
				this.days.push(resCurMonth.slice(i, i + 7))
			this.days.push(resCurMonth.slice(i,))
		},
		mapDates(dates, fDay) {
			return dates.map(item => {
				let {start, end} = this.currentDate;

				let checkActive = (
					start && item.getTime() === start.getTime()
					|| end && item.getTime() === end.getTime()
				);

				let checkHover = (
					start && end && isBetween(start, end)(item)
				);

				let checkDisabled = this.checkDateDisabled(item);
				return {
					isHovered: checkHover,
					isActive: checkActive,
					isDisabled: checkDisabled || fDay.getMonth() !== item.getMonth(),
					value: item
				};
			})
		},
		checkDateDisabled(date) {
			let before = this.disableBefore;
			let after  = this.disableAfter;

			return before && before.getTime() > date.getTime()
				|| after  && after.getTime() < date.getTime();
		},
		getMonth(date) {
			return date.getMonth();
		},
		getYear(date) {
			return date.getFullYear();
		},
		setOne(date) {
			this.handleDays((day) => {
				day.isActive = day.value.getTime() === date.getTime();
			});

			this.currentDate = {
				start: date,
				end: null
			};

			this.$emit('input', this.currentDate);
		},
		setRange(date) {
			let { start, end } = this.currentDate;

			if (start && end
				&& date.getTime() !== start.getTime()
				&& date.getTime() !== end.getTime()) {
				this.hovering = true;
				this.currentDate.start = null;
			}

			if (!this.currentDate.start){
				this.handleDays((day) => {
					day.isHovered = false;
				})
				this.setOne(date);
			} else {
				this.hovering = true;
				if (date.getTime() !== this.currentDate.start.getTime()) {
					this.currentDate.end = date;
					this.hovering = false;
					if (date.getTime() < start.getTime())
						[this.currentDate.end, this.currentDate.start] = [start, date];

					let [s, e] = [
						this.currentDate.start,
						this.currentDate.end
					]
					this.$emit('input', {start: s, end: e})
				}
			}
		},
		hoverRange(date) {
			let { start } = this.currentDate;
			if (this.selectedOption === 'range'
				&& start !== null && this.hovering) {
				this.handleDays((day) => {
					if (day.value.getTime() !== date.getTime()) {
						if (day.value.getTime() !== start.getTime())
							day.isActive = false;
					} else  {
						day.isActive = true;
						this.currentDate.end = day.value;
					}
				});

				this.handleDays((innerDay) => {
					let between = isBetween(start, date);
					innerDay.isHovered = between(innerDay.value);
				});
			}
		},
		setDay(val) {
			if (this.selectedOption === 'one')
				this.setOne(val);
			else if (this.selectedOption === 'range') {
				this.setRange(val);
			}
		},
		chooseOption(option) {
			if (this.selectedOption !== option) {
				this.selectedOption = option;
				this.$emit('set-option', option);
				if (option === 'range') this.hovering = true;
				this.handleDays((day) => {
					day.isActive = false;
					day.isHovered = false;
				});
				this.currentDate = {
					start: null,
					end: null
				}

				this.$emit('input', this.currentDate);
				this.monthDays();
			}
		},
		setWindowVal(val) {
			if (this.monthWindow)
				this.localMonth = val;
			else if (this.yearWindow)
				this.localYear = val;
			const month = this.generateLocaleMonths
				.findIndex(m => m === this.localMonth);
			this.setDate(this.monthCondition(month), this.localYear);
			this.isDouble && this.setNextDate(
				this.monthCondition(month + 1),
				this.localYear + this.yearCondition(month + 1)
			);
			this.monthDays();
			this.monthWindow = false;
			this.yearWindow = false;
		},
		setNextWindowVal(val) {
			if (this.nextMonthWindow)
				this.nextLocalMonth = val;
			else this.nextMonthYear = val;
			const month = this.generateLocaleMonths
				.findIndex(m => m === this.nextLocalMonth);
			this.setNextDate(this.monthCondition(month), this.nextMonthYear);
			this.setDate(
				this.monthCondition(month - 1),
				this.nextMonthYear + this.yearCondition(month - 1)
			);
			this.monthDays();
			this.nextMonthWindow = false;
			this.nextYearWindow = false;
		},
		changeYears(sign) {
			this.localYear += 12 * sign;
			this.nextMonthYear += 12 * sign;
			const month = this.getMonth(this.localDate);
			const nextMonth = this.getMonth(this.nextDate);
			this.setDate(
				this.monthCondition(month),
				this.localYear + this.yearCondition(month)
			);
			this.setNextDate(
				this.monthCondition(nextMonth),
				this.nextMonthYear + this.yearCondition(nextMonth)
			);
			this.monthDays();
		}
	},
	computed: {
		dayNames() {
		  if (this.locale === 'ru') {
        return ['Пн','Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
			}

		  const res = [];
		  for (let i = 0; i < 7; i++) {
		    res.push(
		      capitalize(
		        dayjs().locale(this.locale).day(i).format('dd')
					)
				)
			}
			// if (this.locale === 'en')
			// 	return  ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
			// return ['M','T', 'W', 'T', 'F', 'S', 'S'];
			return res;
		},
		generateLocaleMonths() {
			const res = [];
			for (let i = 0; i < 12; i++)
				res.push(
					capitalize(
						dayjs().locale(this.locale).month(i).format('MMM')
					)
				)
			return res;
		},
		generateYears() {
			const res = [];
			for (let i = this.localYear; i < this.localYear + 12; i++)
				res.push(i);
			return res;
		},
		checkSetWindow() {
			return this.monthWindow
				|| this.yearWindow
		},
		checkSecondSetWindow() {
			return this.nextMonthWindow
				|| this.nextYearWindow
		},
		currentWindow() {
			if (this.monthWindow)
				return this.generateLocaleMonths;
			else if (this.yearWindow)
				return this.generateYears;
		},
		nextWindow() {
			if (this.nextMonthWindow)
				return this.generateLocaleMonths;
			else if (this.nextYearWindow)
				return this.generateYears;
		},
		currentWindowVal() {
			if (this.monthWindow)
				return this.localMonth;
			else if (this.yearWindow)
				return this.localYear;
		},
		nextWindowVal() {
      if (this.nextWindow)
        return this.nextLocalMonth;
      else if (this.nextYearWindow)
        return this.nextMonthYear;
		},
		capitalLocalMonth() {
			return capitalize(this.localMonth);
		},
		capitalNextMonth() {
			return capitalize(this.nextLocalMonth);
		},
		yearsToDisable(type) {
			const res = [];
			const before = this.disableBefore;
			const after = this.disableAfter;

			if (before) {
				const year = this.getYear(before);
				for (let i = 0; i < this.generateYears.length; i++)
					if (this.generateYears[i] < year) res.push(this.generateYears[i]);
			}
			if (after) {
				const year = this.getYear(after);
				for (let i = 0; i < this.generateYears.length; i++)
					if (this.generateYears[i] > year) res.push(this.generateYears[i]);
			}

			return [...new Set(res)];
		}
	}
}
</script>
<style lang="scss">

$calendarBack: #fff;
$month: #2c2c2c;
$arrow: #7bb6db;
$buttonsColor: #ff8584;
$shadow: 0px 0px 3px 2px #e3e4e9;
$optimalWidth: 230px;

.calendar {
	background-color: $calendarBack;
	width: $optimalWidth;
	&__set-windows {
		margin-top: 25px;
	}
	&-wrapper {
		width: max-content;
		padding: 25px 30px;
    box-shadow: $shadow;
    position: relative;
	}
	&-buttons {
		margin-bottom: 15px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: $buttonsColor;
		& > * {
			border: 1px solid $buttonsColor;
	    padding: 5px;
	    cursor: pointer;
	    font-size: 14px;
	    line-height: 14px;
	    padding: 11px 3px;
	    border-radius: 2px;
	    min-width: 107px;
	    text-align: center;
			&:first-child {
				border-top-left-radius: 2px;
				border-bottom-left-radius: 2px;
			}
			&:last-child {
				border-top-right-radius: 2px;
				border-bottom-right-radius: 2px;

			}
			&.active {
				background-color: $buttonsColor;
				color: white;
			}
		}
	}
	&-main {
		& .calendar__month {
			font-size: 16px;
			color: $month;
			line-height: 25px;
			&.doubled-left {
		    margin-left: -80px;
			}

			&.doubled-right {
		    margin-right: -80px;
			}
		}

		&__calendars {
			display: flex;
		}

	}

	&__selects {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	&-right {
		margin-left: 19px;
	}
	&-top {
		&__nav {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}
	}
	&-date {
		border-collapse: collapse;
		width: 100%;
		& td {
			vertical-align: middle;
			text-align: center;
		}

		&__day-names {
			display: flex;
			justify-content: space-around;
			font-size: 12px;
			font-weight: 500;
			margin-bottom: 20px;
	    margin-top: 25px;
		}
	}

}

</style>