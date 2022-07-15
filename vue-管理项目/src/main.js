import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue'
import axios from "axios";
//商品管理-商品分类中的树形列表引入的第三方库
import ZKTable from "vue-table-with-tree-grid"
import "./assets/fonts/iconfont.css"
import "./assets/css/global.css"
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 导入 NProgress 包对应的JS和CSS
//在发送网络请求的时候展示进度条，结束的时候将进度条进行隐藏
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import router from "@/router/router";
Vue.config.productionTip = false
//使用elementUI和vue-table-tree插件
Vue.use(ElementUI)
Vue.component('tree-table', ZKTable)
// 将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor)
//对axios进行一些默认的配置选项，挂在到vm中
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'
//挂载一个请求拦截器，给服务器传递token
axios.interceptors.request.use(config => {
  // console.log(config)
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})
// 在 response 拦截器中，隐藏进度条 NProgress.done()
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
//定义全局过滤器
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
Vue.prototype.$http=axios
new Vue({
  router,
  render: h => h(App),

}).$mount('#app')
