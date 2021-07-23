/* Import des différentes routes du CRUD */
import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Posts from '../views/Posts.vue'
import User from '../views/User.vue'


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
 {
    path: '/posts',
    name: 'posts',
    component: Posts
  },
  {
    path: '/user/:id',
    name: 'user',
    component: User
  },
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
