<template>
		<div class="calendar-wrapper">
			<div class="calendar__top calendar-top">
				<div class="calendar-top__nav">
					<div 
						class="calendar-top__arrow left"
						@click="prevMonth"
					></div>
					<div class="calendar-top__month">{{ localMonth }}, {{ localYear }}</div>
					<div 
						class="calendar-top__arrow right"
						@click="nextMonth"
					></div>
				</div>
			</div>
			<div class="calendar__main">
				<div class="calendar">
					<table class="calendar-date">
						<tr class="calendar-date__day-names">
							<td v-for="name in dayNames">
								{{ name }}
							</td>
						</tr>
						<tr
							class="calendar-date__week"
							v-for="week in days"
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
			<div 
				class="close-button"
				@click="$emit('close')"
			></div>
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
			localeFormat: null,
			
			days: [],
			currentDate: null,
			selectedOption: 'one',
			hovering: true
		}
	},
	props: {
		disableBefore: { type: Date, default: () => null },
		disableAfter: { type: Date, default: () => null},
		locale: { type: String, default: 'en'},
		topButtons: { type: Boolean, default: false},
		value: { type: [Object], default: null}

	},
	created() {
		this.currentDate = this.value;
		
		if (!isValidDate(this.value)) {
			this.localDate = this.currentDate.start;
		} else this.localDate = this.currentDate;
		this.localMonth = formatDate(this.localDate, 'MMM');
		if (this.value.end)
			this.selectedOption = "range";

		this.localYear = this.localDate.getFullYear()

		let after = this.disableAfter;
		let before = this.disableBefore;

		if (before && before.getTime() > this.localDate.getTime())
			this.currentDate.start = before;
		else if (after && after.getTime() < this.localDate.getTime())
			this.currentDate.start = after;

		import('dayjs/locale/' + this.locale)
			.then(data => {
				dayjs.locale(this.locale);
			})
			.then(() => {
				this.monthDays();
				this.handleDays((day) => {
					day.value.setHours(0, 0, 0, 0);
					day.isActive = day.value.getTime() === this.currentDate.start.getTime()
					|| this.currentDate.end && day.value.getTime() === this.currentDate.end.getTime()
				})
<<<<<<< HEAD

			})
	},
	methods: {
		chooseOption(option) {
			if (this.selectedOption !== option) {
				this.selectedOption = option;
				if (option === 'range') this.hovering = true;
				this.handleDays((day) => { 
					day.isActive = false;
					day.isHovered = false; 
				});
				this.currentDate = {
					start: this.value.start,
					end: null 
				}

				this.$emit('input', this.currentDate);
				this.monthDays();
			}
		}
	},
	methods: {
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

			let date = new Date();
			date.setMonth(month - 1);
			date.setFullYear(year);

			this.localDate = date;
			this.localMonth = (formatDate(
				date, 
				'MMM', 
				{ locale: this.localeFormat})
			);
			this.monthDays();
			this.getYear();
		},
		nextMonth() {
			let month = this.localDate.getMonth();
			let year = this.localDate.getFullYear();
			if (month === 11) {
				month = -1
				year += 1;
			}

			let date = new Date();

			date.setMonth(month + 1); 
			date.setFullYear(year);

			this.localDate = date;
			this.localMonth = (formatDate(
				this.localDate,
				'MMM', 
				{ locale: this.localeFormat})
			);
			this.monthDays();
			this.getYear();
		},
		monthDays() {
			this.days = [];
			let weekStart = this.locale !== 'en';
			let firstDay = startOfMonth(this.localDate);
			let prevLastDay = new Date(dayjs(firstDay).subtract(1, 'day'));
			let res = [
			...getDates(
				startOfWeek(
					(prevLastDay.getDay() 
					? prevLastDay 
					: firstDay 
				), 
				weekStart),
				endOfWeek(lastDayOfMonth(
					!this.isDouble ? firstDay : new Date(dayjs(firstDay).add(1, 'month'))
 				), weekStart)
			)].map(item => {

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
					isDisabled: checkDisabled,
					value: item
				};
			})
			for (var i = 0; i < res.length - 7; i+= 7)
				this.days.push(res.slice(i, i + 7))
			this.days.push(res.slice(i,))
		},
		checkDateDisabled(date) {
			let before = this.disableBefore;
			let after  = this.disableAfter;

			return before && before.getTime() > date.getTime()
			|| after
			&& after.getTime() < date.getTime()
		},
		getYear() {
			this.localYear = this.localDate.getFullYear();
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
				this.setOne(date);
			} else {
				this.currentDate.end = date;
				this.hovering = false;
				if (date.getTime() < start.getTime())
					[this.currentDate.end, this.currentDate.start] = [start, end];

				let [s, e] = [
					this.currentDate.start,
					this.currentDate.end
				]
				this.$emit('input', {start: s, end: e})
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
			else if (this.selectedOption === 'range')
				this.setRange(val);

			this.$emit('clear');
		}
	},
	computed: {
		dayNames() {
			if (this.locale === 'en')
				return  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
			return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
		}
	}
}
</script>
<style lang="scss">

$calendarBack: #fff;
$month: #202020;
$arrow: #7bb6db;
$buttonsColor: $arrow;
$shadow: 0px 0px 3px 2px #e3e4e9;

.calendar {
  padding: 10px 15px;
	background-color: $calendarBack;
	&-wrapper {
		width: max-content;
		padding: 20px 25px;
    box-shadow: $shadow; 
    position: relative;
	}
	&-buttons {
		margin-bottom: 15px;
		display: flex;
		align-items: center;
		justify-content: center;
		& > * {
			border: 1px solid $buttonsColor;
			padding: 5px; 
			cursor: pointer;
			&:first-child {
				border-top-left-radius: 5px;
				border-bottom-left-radius: 5px;
			}
			&:last-child {
				border-top-right-radius: 5px;
				border-bottom-right-radius: 5px;

			}
			&.active {
				background-color: $buttonsColor;
				color: white;
			}
		}
	}
	&__main {
		& > * { 
			display: inline-block;
	    vertical-align: top; 
		}
	}
	&-top {
		&__nav {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}
		&__arrow {
			// background-color: $arrow;
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
				margin-left: 10px;
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
				margin-right: 10px;
				transform: rotate(180deg);
				&::after {
					top: 60%;
				}
				&::before {
					top: 40%;
				}
			}
		}
		&__month {}
	}
	&-bottom {
		&__daycell {}
	}
	&-date {
		border-collapse: collapse;
		& td { 
			padding: 10px;
			vertical-align: middle;
			text-align: center;
		}
	}
	
}

.close-button {
	position: absolute;
  top: 15px;
  right: 25px;
  padding: 10px;
  cursor: pointer;
  &::after,
  &::before {
  	content: '';
    display: block;
    height: 15px;
    width: 2px;
    border-radius: 2px;
    position: absolute;
    background-color: black;
  }

  &::before {
  	transform: translate(-50%, -50%) rotate(45deg);
  }
	&::after {
  	transform: translate(-50%, -50%) rotate(-45deg);
	}
}
</style>