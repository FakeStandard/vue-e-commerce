import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
import router from './router'

// 導入套件
import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'
// 配置 API 請求根路徑
// axios.defaults.baseURL = 'http://localhost:3000/'
axios.defaults.baseURL = 'https://localhost:44379/api/'
// axios 請求攔截器
axios.interceptors.request.use(config => {
  // console.log(config)
  // 為請求對象添加 token 驗證的 Authorization 字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最後必須返回 config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 註冊為全局可用的套件
Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
