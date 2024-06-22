import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import '@/libs/heart.js';
import '@/libs/sakura.js';
import { pinia } from '@/stores';
import router from '@/router';

import XmSvgIcon from '~virtual/svg-component';

const app = createApp(App);
app.use(pinia).use(router);
app.component(XmSvgIcon.name || 'unknown', XmSvgIcon);

app.mount('#app');
