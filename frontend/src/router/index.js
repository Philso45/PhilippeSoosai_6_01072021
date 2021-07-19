/* Import des différentes routes du CRUD */
import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'



Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../views/Signup.vue')
  },
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
