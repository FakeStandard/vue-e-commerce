import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
import router from './router'

import axios from 'axios'
// 配置 API 請求根路徑
axios.defaults.baseURL = 'https://localhost:8080/'
// axios 請求攔截器
axios.interceptors.request.use(config => {
  console.log(config)
  // 為請求對象添加 token 驗證的 Authorization 字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最後必須返回 config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
