import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login.vue'
import Home from '@/components/Home.vue'
import Welcome from '@/components/Welcome.vue'

// 導入全局樣式
import '../assets/css/global.css'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 掛載路由導航守衛
router.beforeEach((to, from, next) => {
  // to 要訪問的路徑
  // from 代表從哪個路徑跳轉而來
  // next 是一個表示放行的函數
  //       next() 放行、next('/login') 強制跳轉
  if (to.path === '/login') return next()
  // 獲取 token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
