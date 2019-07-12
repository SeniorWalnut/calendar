<template>
  <div id="app">
    <daterange 
      title="Дата рождения"
      placeholder="Выберите дату"
      format="DD.MM.YYYY"
      v-model="currentDate"
      :range="myRange"
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
      currentDate: '',
      myRange: {
        start: new Date(2008, 8, 27),
        end: new Date(2010, 8, 27)
      }
    }
  }
}
</script>

<style>
#app {
  font-family: 'Roboto', sans-serif;
}
</style>
