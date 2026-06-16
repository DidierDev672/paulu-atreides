import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import './style.css'
import App from './App.vue'
import router from '@/presentation/router'

const app = createApp(App)

app.use(createPinia())
app.use(MotionPlugin)
app.use(router)

app.mount('#app')
