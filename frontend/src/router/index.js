/**
 * Vue Router 配置
 * 负责管理应用的路由
 */

import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Tasks from '../views/Tasks.vue';
import Calendar from '../views/Calendar.vue';
import Notes from '../views/Notes.vue';
import Health from '../views/Health.vue';
import Finance from '../views/Finance.vue';
import Shortcuts from '../views/Shortcuts.vue';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: Tasks
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: Calendar
  },
  {
    path: '/notes',
    name: 'Notes',
    component: Notes
  },
  {
    path: '/health',
    name: 'Health',
    component: Health
  },
  {
    path: '/finance',
    name: 'Finance',
    component: Finance
  },
  {
    path: '/shortcuts',
    name: 'Shortcuts',
    component: Shortcuts
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;