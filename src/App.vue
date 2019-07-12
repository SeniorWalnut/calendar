<template>
  <div id="app">
    <daterange 
      title="Дата рождения"
      placeholder="Выберите дату"
      v-model="currentDate"
    />
  </div>
</template>

<script>
import Daterange from './components/Daterange';
export default {
  name: 'app',
  components: {
    Daterange
  },
  data() {
    return {
      currentDate: ''
    }
  }
}
</script>

<style>
#app {
  font-family: 'Roboto', sans-serif;
}
</style>
