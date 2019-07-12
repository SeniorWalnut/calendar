<template>
	<div class="calendar">
		<div class="calendar__top calendar-top">
			<div class="calendar-top__arrow left"><-</div>
			<div class="calendar-top__month">{{ month }}</div>
			<div class="calendar-top__arrow right">-></div>
		</div>
		<div class="calendar__bottom calendar-bottom">
			<div class="calendar-bottom__daycell">
				<day-cell 
				  v-for="day in days"
				  :day="day"
				/> 
			</div>
		</div>
	</div>
</template>
<script>
import DayCell from './DayCell'
export default {
	components: { DayCell },
	data() {
		return {
			days: [],
			month: ''
		}
	},
	mounted() {},
	methods: {},
	computed: {
		currentMonth() {
			return new Date().getMonth();
		},

	}
}
</script>
<style lang="scss">
$calendarBack: #fff;
$month: #202020;
$arrow: #45effe;
.calendar {
	padding: 10px 15px;
	background-color: $calendarBack;
	&-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		&__arrow {
			&.left {
				margin-left: 10px;
			}
			&.right {
				margin-right: 10px;
			}
		}
		&__month {}
	}
	&-bottom {
		&__daycell {}
	}
}
</style>