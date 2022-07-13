import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../components/Home.vue'
import Tutorials from '../components/Tutorials.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/Tutorials',
    name: 'Tutorials',
    component: Tutorials
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
