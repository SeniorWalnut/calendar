<template>
	<div 
		class="day-cell"
		:class="{ active: day.isActive }"
	>
		<div 
			class="day-cell__date"
		>{{ day.dayCell }}</div>
	</div>
</template>
<script>
export default {
	props: {
		day: { type: Object, default: () => {}}
	}
}
</script>

<style lang="scss">
	.day-cell {
		&.active {}
		&__date {}
	}
</style>