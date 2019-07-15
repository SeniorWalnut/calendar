<template>
	<div 
		class="day-cell"
		:class="{ active: day.isActive, disabled: isDisabled }"
		@click="$emit('set-day', day.value)"
	>
		<div 
			class="day-cell__date"
		>{{ dayNum }}</div>
	</div>
</template>
<script>
export default {
	props: {
		day: { 
			type: Object, 
			default: () => {
				return {
		 			isActive: false,
					value: new Date()
				}
			}
		}
	},
	computed: {
		isDisabled() {
			let month = this.day.value.getMonth()
			return !this.day.isActive 
			&& month !== new Date().getMonth()
		},
		dayNum() {
			return this.day.value.getDate();
		}
	} 
}
</script>

<style lang="scss">
	.day-cell {
		&.active {}
		&__date {		}
	}
</style>