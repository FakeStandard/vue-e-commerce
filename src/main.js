import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
import router from './router'

import axios from 'axios'
// 配置 API 請求根路徑
axios.defaults.baseURL = 'http://localhost:3000/'
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
