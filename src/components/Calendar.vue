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
				<div class="calendar-main__top">
					<div 
						class="calendar__arrow left"
						@click="prevMonth"
					></div>
					<div 
						class="calendar__month"
						:class="{'doubled-left': isDouble}"
					>{{ localMonth }}, {{ localYear }}</div>
					<div 
						v-if="isDouble" 
						class="calendar__month"
						:class="{'doubled-right': isDouble}"
					>{{ nextLocalMonth }}, {{ nextMonthYear }}</div>
					<div 
					class="calendar__arrow right"
					@click="nextMonth"
				></div>
				</div>
				<div class="calendar-main__calendars">
					<div class="calendar calendar-left">
						<div class="calendar-date__day-names">
							<div v-for="name in dayNames">
								{{ name }}
							</div>
						</div>
						<table class="calendar-date">
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
					</div>
					<div 
						class="calendar calendar-right"
						v-if="isDouble"
					>
						<div class="calendar-date__day-names">
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
					</div>
				</div>
			</div>
	</div>
</template>
<script>

import DayCell from './DayCell';
import { months } from '../config/calendar-assets.js';
import { getDates } from '../config/array-of-dates.js';
import dayjs from 'dayjs';
import { 
	startOfWeek,
	endOfWeek,
	lastDayOfMonth,
	startOfMonth,
	isBetween,
	formatDate,
	isValidDate
} from '../config/dates-helpers.js';

export default {
	components: { DayCell },
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
			weekCount: 0
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
		else if (after && new Date(after.setHours(0, 0, 0, 0)).getTime() < this.currentDate.start.getTime()) {
			this.localDate = after;
			this.currentDate.start = after;
		}
		
		this.localMonth = formatDate(
			this.localDate, 
			'MMMM',
			{ locale }
		);

		if (this.value.end)
			this.selectedOption = "range";

		this.localYear = this.localDate.getFullYear()

		this.nextLocalMonth = formatDate(
				new Date(new Date().setMonth(this.localDate.getMonth() + 1)), 
				'MMMM',
				{ locale }
		);
		this.nextMonthYear = formatDate(this.localDate, 'YYYY');

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
				this.localMonth = formatDate(
				this.localDate, 
					'MMMM',
					{ locale }
				);

				if (this.isDouble) {
					this.nextLocalMonth = formatDate(
						new Date(new Date().setMonth(this.localDate.getMonth() + 1)), 
						'MMMM',
						{ locale }
					);
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
		prevMonth() {
			let month = this.localDate.getMonth();
			let year = this.localDate.getFullYear();
			if (month === 0) {
				month = 12;
				year -= 1;
			}

			if (this.isDouble) {
				this.nextLocalMonth = this.localMonth;
				this.nextMonthYear = this.localYear;
			}
			
			let date = new Date(year, month, 1, 0, 0, 0, 0);
			date.setMonth(month - 1);
			date.setFullYear(year);

			this.localDate = date;
			this.localMonth = (formatDate(
				date, 
				'MMMM', 
				{ locale: this.locale})
			);
			this.localYear = this.getYear(date);


			this.monthDays();
			this.getYear(this.localDate);
		},
		nextMonth() {
			let month = this.localDate.getMonth();
			let year = this.localDate.getFullYear();
			if (month === 11) {
				month = -1
				year += 1;
			}

			let date = new Date(year, month, 1, 0, 0, 0, 0);
			date.setMonth(month + 1); 
			date.setFullYear(year);

			this.localDate = date;
			this.localMonth = (formatDate(
				this.localDate,
				'MMMM', 
				{ locale: this.locale})
			);
			this.localYear = this.getYear(date);

			if (this.isDouble) {
				this.nextLocalMonth = formatDate(new Date(new Date().setMonth(date.getMonth() + 1)), 'MMMM');
				this.nextMonthYear = formatDate(
					date.getMonth() === 11 ? 
					new Date(new Date().setFullYear(date.getFullYear() + 1)) :
					date
				, 'YYYY');
			}

			this.monthDays();
			this.getYear(this.localDate);
		},
		monthDays() {
			this.days = [];
			let weekStart = this.locale !== 'en';
			let firstDay = startOfMonth(this.localDate);
			let resCurMonth = this.mapDates([
			...getDates(
					startOfWeek(
						firstDay, weekStart
					),
					endOfWeek(
						lastDayOfMonth(
							firstDay
						),weekStart
					)
			)], firstDay);

			this.weekCount = resCurMonth.length / 7;

			if (this.isDouble) {
				let firstDayNext = startOfMonth(new Date(dayjs(firstDay).add(1, 'month')));
				let resNextMonth = this.mapDates([
					...getDates(
						startOfWeek(
							firstDayNext, weekStart),
						endOfWeek(lastDayOfMonth(
							firstDayNext), weekStart)
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
				|| after  && after.getTime() < date.getTime()
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
		}
	},
	computed: {
		dayNames() {
			if (this.locale === 'en')
				return  ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
			return ['M','T', 'W', 'T', 'F', 'S', 'S'];
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

.calendar {
	background-color: $calendarBack;
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
			margin-top: 20px;
			display: flex;
		}

		&__top {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
	}
	&__arrow {
	padding: 14px;
	position: relative;
	cursor: pointer;
	&:hover {
		box-shadow: $shadow;
		transition: box-shadow .3s;
	}
	&::after,
	&::before {
		content: '';
		display: block;
		background-color: $month;
		height: 9px;
		width: 2px;
		position: absolute;
		top: 50%; left: 50%;
	}
	&::before {
		transform: translate(-50%, -50%) rotate(45deg);
	}
	&::after {
		transform: translate(-50%, -50%) rotate(-45deg);
	}
	&.left {
		&::before {
			top: 40%;
    	left: calc(50% - 2px);
		}
		&::after {
			top: 60%;
    	left: calc(50% - 2px);
		}
	}
	&.right {
		transform: rotate(180deg);
		&::after {
			top: 60%;
		}
		&::before {
			top: 40%;
		}
	}
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
		}
	}
	
}

</style>