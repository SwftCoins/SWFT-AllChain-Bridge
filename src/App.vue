<template>
  <div id="app" :class="[isPC ? 'pc' : '',sourceFlag]">
    <router-view />
  </div>
</template>
<script>
export default {
  name: "App",
  data(){
    return {
      sourceFlag: ''
    }
  },
  created(){
    let loading = document.getElementById('Loading')
    if(loading !== null){
     document.body.removeChild(loading)
    }
    this.sourceFlag = localStorage.getItem('sourceFlag')
  }
};
</script>
<style lang="scss">
@import './assets/css/theme.scss';
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  position: relative;
}
.pc {
  max-width: 100% !important;
}
#nav {
  padding: 30px;
}

aside {
  z-index: 999;
}
</style>
