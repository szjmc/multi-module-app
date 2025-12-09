<script setup>
import { ref, onMounted } from 'vue';
import { taskApi } from '../services/api';

const tasks = ref([]);
const currentDate = ref('');

// 设置当前日期
const setCurrentDate = () => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  currentDate.value = new Date().toLocaleDateString('zh-CN', options);
};

// 获取今日任务
const fetchTasks = async () => {
  try {
    const data = await taskApi.getAll();
    tasks.value = data;
  } catch (error) {
    console.error('获取任务失败:', error);
  }
};

// 初始化
onMounted(() => {
  setCurrentDate();
  fetchTasks();
});
</script>

<template>
  <div id="dashboard-page" class="page">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold">欢迎回来，John</h2>
        <p class="text-gray-600 dark:text-gray-400">今天是 <span id="current-date">{{ currentDate }}</span>，您有 <span class="font-medium text-primary">{{ tasks.length }}</span> 个待办任务</p>
      </div>
      <div class="flex space-x-2">
        <button class="btn-outline text-sm">
          <i class="fa fa-calendar-o mr-1" aria-hidden="true"></i>
          本月
        </button>
        <button class="btn-primary text-sm">
          <i class="fa fa-plus mr-1" aria-hidden="true"></i>
          新建
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">待办任务</p>
              <h3 class="text-2xl font-bold mt-1">{{ tasks.filter(t => t.status === 'pending').length }}</h3>
              <p class="text-gray-500 dark:text-gray-400 text-sm mt-2">
                共 {{ tasks.length }} 个任务
              </p>
            </div>
            <div class="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-primary">
              <i class="fa fa-check-square-o text-xl" aria-hidden="true"></i>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">今日专注时长</p>
              <h3 class="text-2xl font-bold mt-1">0 小时</h3>
              <p class="text-gray-500 dark:text-gray-400 text-sm mt-2">
                开始专注，记录你的时间
              </p>
            </div>
            <div class="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-secondary">
              <i class="fa fa-clock-o text-xl" aria-hidden="true"></i>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">已完成笔记</p>
              <h3 class="text-2xl font-bold mt-1">0</h3>
              <p class="text-gray-500 dark:text-gray-400 text-sm mt-2">
                开始创建，记录你的想法
              </p>
            </div>
            <div class="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-accent">
              <i class="fa fa-book text-xl" aria-hidden="true"></i>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">健康目标</p>
              <h3 class="text-2xl font-bold mt-1">0%</h3>
              <p class="text-gray-500 dark:text-gray-400 text-sm mt-2">
                设置目标，追踪你的进度
              </p>
            </div>
            <div class="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-500">
              <i class="fa fa-heartbeat text-xl" aria-hidden="true"></i>
            </div>
          </div>
        </div>
    </div>

    <!-- 图表和任务列表 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 效率图表 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 lg:col-span-2 card-transition hover:shadow-card-hover">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-lg">本周效率趋势</h3>
          <div class="flex space-x-2">
            <button class="px-3 py-1 text-sm rounded-lg bg-primary bg-opacity-10 text-primary">周</button>
            <button class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">月</button>
            <button class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">年</button>
          </div>
        </div>
        <div class="h-64">
          <canvas id="efficiency-chart"></canvas>
        </div>
      </div>

      <!-- 今日任务 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-lg">今日任务</h3>
          <router-link to="/tasks" class="text-primary text-sm hover:underline">查看全部</router-link>
        </div>
        <ul class="space-y-4">
          <li v-for="task in tasks.slice(0, 4)" :key="task.id" class="flex items-start space-x-3">
            <div class="mt-1">
              <input type="checkbox" class="task-checkbox h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary">
            </div>
            <div>
              <p class="font-medium">{{ task.title }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ task.due_date ? new Date(task.due_date).toLocaleDateString() : '无截止日期' }}</p>
            </div>
            <div class="ml-auto">
              <span :class="{
                'badge badge-priority-high': task.priority === 'high',
                'badge badge-priority-medium': task.priority === 'medium',
                'badge badge-priority-low': task.priority === 'low'
              }">{{ task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级' }}</span>
            </div>
          </li>
        </ul>
        <button class="mt-6 w-full btn-outline text-sm">
          <i class="fa fa-plus mr-1" aria-hidden="true"></i>
          添加任务
        </button>
      </div>
    </div>

    <!-- 模块快捷入口 -->
    <div class="mt-8">
      <h3 class="font-bold text-lg mb-6">功能模块</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <router-link to="/tasks" class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 text-center card-transition hover:shadow-card-hover">
          <div class="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-primary">
            <i class="fa fa-check-square-o text-2xl"></i>
          </div>
          <h4 class="font-medium">任务管理</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">创建和跟踪任务</p>
        </router-link>
        <router-link to="/calendar" class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 text-center card-transition hover:shadow-card-hover">
          <div class="h-16 w-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-secondary">
            <i class="fa fa-calendar text-2xl"></i>
          </div>
          <h4 class="font-medium">时间管理</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">日历和时间跟踪</p>
        </router-link>
        <router-link to="/notes" class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 text-center card-transition hover:shadow-card-hover">
          <div class="h-16 w-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-accent">
            <i class="fa fa-book text-2xl"></i>
          </div>
          <h4 class="font-medium">笔记管理</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">创建和组织笔记</p>
        </router-link>
        <router-link to="/health" class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 text-center card-transition hover:shadow-card-hover">
          <div class="h-16 w-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-500">
            <i class="fa fa-heartbeat text-2xl"></i>
          </div>
          <h4 class="font-medium">健康管理</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">跟踪健康目标</p>
        </router-link>
        <router-link to="/finance" class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 text-center card-transition hover:shadow-card-hover">
          <div class="h-16 w-16 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-500">
            <i class="fa fa-money text-2xl"></i>
          </div>
          <h4 class="font-medium">财务管理</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">管理收支记录</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
// 引入Chart.js
import Chart from 'chart.js/auto';

export default {
  mounted() {
    // 初始化效率图表
    this.initEfficiencyChart();
  },
  methods: {
    initEfficiencyChart() {
      const ctx = document.getElementById('efficiency-chart');
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            datasets: [{
              label: '效率',
              data: [65, 78, 52, 91, 85, 68, 73],
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        });
      }
    }
  }
};
</script>