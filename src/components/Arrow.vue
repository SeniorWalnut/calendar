<template>
	<div 
		class="arrow"
		:class="'arrow__' + arrowType"
		@click="$emit('arrow-click')"
	></div>
</template>
<script>
export default {
	props: {
		arrowType: {
			type: String,
			default: 'left'
		}
	}
}
</script>
<style lang="scss">
// $shadow: 0px 0px 3px 2px #e3e4e9;
$arrow_color: #8c96ab;
.arrow {
	padding: 12px;
	position: relative;
	cursor: pointer;
	// &:hover {
	// 	box-shadow: $shadow;
	// 	transition: box-shadow .3s;
	// }
	&::after,
	&::before {
		content: '';
		display: block;
		background-color: $arrow_color;
		opacity: .25; 
		height: 7px;
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
	&__left {
		&::before {
			top: 40%;
    	left: calc(50% - 2px);
		}
		&::after {
			top: 60%;
    	left: calc(50% - 2px);
		}
	}
	&__right {
		transform: rotate(180deg);
		&::after {
			top: 60%;
		}
		&::before {
			top: 40%;
		}
	}
}
</style>