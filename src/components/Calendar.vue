<template>
	<div class="calendar">
		<div class="calendar__top calendar-top">
			<div class="calendar-top__arrow"></div>
			<div class="calendar-top__month">{{ month }}</div>
			<div class="calendar-top__arrow"></div>
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
		}
	}
}
</script>
<style lang="scss">
.calendar {
	&-top {
		&__arrow {}
		&__month {}
	}
	&-bottom {
		&__daycell {}
	}
}
</style>