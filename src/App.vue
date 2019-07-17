<template>
  <div id="app">
    <daterange 
      title="Дата рождения"
      placeholder="Выберите дату"
      v-model="date"
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
      date: '03.05.1998'
    }
  }
}
</script>

<style>
#app {
  font-family: 'Roboto', sans-serif;
}
</style>
