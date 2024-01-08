import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import zh from './lang/zh'
import zht from './lang/zht'
import en from './lang/en'
import korea from './lang/korea'
import VueClipboard from 'vue-clipboard2'
import axios from 'axios'
import 'lib-flexible'
import './assets/css/index.scss'
import 'element-ui/lib/theme-chalk/index.css'
import { Tooltip, Select, Button, Popover } from 'element-ui'
import vueBus from 'vue-bus'
import './utils/getWindowSourceFlag'
import './assets/font/iconfont.js'
import './utils/getBtcBalance.js'

Vue.use(vueBus)
Vue.use(Tooltip)
Vue.use(Select)
Vue.use(Button)
Vue.use(Popover)
// 引入的vant
import { Icon, Toast, Switch, Loading } from 'vant'
Vue.use(Icon)
Vue.use(Toast)
Vue.use(Switch)
Vue.use(Loading)
// 复制插件
Vue.use(VueClipboard)
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)
let lang = localStorage.getItem('lang')

if (!lang) {
  let language = navigator.language
  language = language.toLocaleLowerCase()
  lang = language.indexOf('zh') != '-1' ? 'zh' : 'en'
}
const i18n = new VueI18n({
  locale: lang, // 语言标识
  messages: {
    zh: zh, // 中文语言包
    zht: zht, // 中文繁体语言包
    en: en, // 英文语言包
    korea: korea, // 韩文语言包
  },
  silentTranslationWarn: true,
})
let isPC = window.matchMedia('(min-width: 500px)').matches
Vue.prototype.isPC = isPC
Vue.config.productionTip = false
Vue.prototype.$axios = axios
Vue.prototype.$formatNumber = function formatNumber(num) {
  if(!num){
    return 0
  }
  if(num == '--'){
    return '--'
  }
  num = Number(num).toFixed(6) - 0
  const parts = num.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}
new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app')
