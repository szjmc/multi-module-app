<script setup>
import { ref, onMounted } from 'vue';
import { eventApi, pomodoroApi, timeTrackingApi } from '../services/api';

// 日历相关
const currentDate = ref(new Date());
const events = ref([]);
const showEventModal = ref(false);
const currentEvent = ref(null);

// 番茄钟相关
const timer = ref(25 * 60); // 25分钟，单位秒
const isRunning = ref(false);
const timerInterval = ref(null);
const pomodoros = ref([]);

// 时间追踪相关
const trackingDescription = ref('');
const trackingId = ref(null);
const isTracking = ref(false);
const timeTrackings = ref([]);

// 获取所有事件
const fetchEvents = async () => {
  try {
    const data = await eventApi.getAll();
    events.value = data;
  } catch (error) {
    console.error('获取事件失败:', error);
  }
};

// 获取所有番茄钟记录
const fetchPomodoros = async () => {
  try {
    const data = await pomodoroApi.getAll();
    pomodoros.value = data;
  } catch (error) {
    console.error('获取番茄钟记录失败:', error);
  }
};

// 获取所有时间追踪记录
const fetchTimeTrackings = async () => {
  try {
    const data = await timeTrackingApi.getAll();
    timeTrackings.value = data;
  } catch (error) {
    console.error('获取时间追踪记录失败:', error);
  }
};

// 初始化
onMounted(() => {
  fetchEvents();
  fetchPomodoros();
  fetchTimeTrackings();
});

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 开始番茄钟
const startTimer = () => {
  if (!isRunning.value) {
    isRunning.value = true;
    timerInterval.value = setInterval(() => {
      if (timer.value > 0) {
        timer.value--;
      } else {
        clearInterval(timerInterval.value);
        isRunning.value = false;
        // 保存番茄钟记录
        savePomodoro();
        // 播放提示音
        playNotificationSound();
      }
    }, 1000);
  }
};

// 暂停番茄钟
const pauseTimer = () => {
  if (isRunning.value) {
    clearInterval(timerInterval.value);
    isRunning.value = false;
  }
};

// 重置番茄钟
const resetTimer = () => {
  clearInterval(timerInterval.value);
  isRunning.value = false;
  timer.value = 25 * 60;
};

// 保存番茄钟记录
const savePomodoro = async () => {
  try {
    await pomodoroApi.create({
      duration: 25,
      completed: 1,
      start_time: new Date(Date.now() - (25 * 60 - timer.value) * 1000).toISOString(),
      end_time: new Date().toISOString()
    });
    await fetchPomodoros();
  } catch (error) {
    console.error('保存番茄钟记录失败:', error);
  }
};

// 播放通知声音
const playNotificationSound = () => {
  const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
  audio.play().catch(e => console.log('无法播放通知声音:', e));
};

// 开始时间追踪
const startTracking = async () => {
  if (!trackingDescription.value.trim()) {
    alert('请输入追踪描述');
    return;
  }
  
  try {
    const tracking = await timeTrackingApi.create({
      description: trackingDescription.value,
      start_time: new Date().toISOString()
    });
    trackingId.value = tracking.id;
    isTracking.value = true;
    trackingDescription.value = '';
    await fetchTimeTrackings();
  } catch (error) {
    console.error('开始时间追踪失败:', error);
  }
};

// 停止时间追踪
const stopTracking = async () => {
  if (trackingId.value) {
    try {
      await timeTrackingApi.stop(trackingId.value);
      isTracking.value = false;
      trackingId.value = null;
      await fetchTimeTrackings();
    } catch (error) {
      console.error('停止时间追踪失败:', error);
    }
  }
};

// 打开事件模态框
const openEventModal = (event = null) => {
  currentEvent.value = event || {
    title: '',
    description: '',
    start_time: new Date().toISOString().slice(0, 16),
    end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    location: '',
    color: '#3B82F6'
  };
  showEventModal.value = true;
};

// 关闭事件模态框
const closeEventModal = () => {
  showEventModal.value = false;
  currentEvent.value = null;
};

// 保存事件
const saveEvent = async () => {
  try {
    if (currentEvent.value.id) {
      await eventApi.update(currentEvent.value.id, currentEvent.value);
    } else {
      await eventApi.create(currentEvent.value);
    }
    await fetchEvents();
    closeEventModal();
  } catch (error) {
    console.error('保存事件失败:', error);
  }
};

// 删除事件
const deleteEvent = async (id) => {
  try {
    await eventApi.delete(id);
    await fetchEvents();
  } catch (error) {
    console.error('删除事件失败:', error);
  }
};
</script>

<template>
  <div id="calendar-page" class="page">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold">时间管理</h2>
        <p class="text-gray-600 dark:text-gray-400">管理您的日历、番茄钟和时间追踪</p>
      </div>
      <div class="flex space-x-2">
        <button class="btn-primary" @click="openEventModal">
          <i class="fa fa-plus mr-1" aria-hidden="true"></i>
          新建事件
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">今日事件</p>
            <h3 class="text-2xl font-bold mt-1">{{ events.length }}</h3>
            <p class="text-green-500 text-sm mt-2 flex items-center">
              <i class="fa fa-calendar mr-1" aria-hidden="true"></i>
              今日安排
            </p>
          </div>
          <div class="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-primary">
            <i class="fa fa-calendar text-xl" aria-hidden="true"></i>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">番茄钟记录</p>
            <h3 class="text-2xl font-bold mt-1">{{ pomodoros.length }}</h3>
            <p class="text-green-500 text-sm mt-2 flex items-center">
              <i class="fa fa-clock-o mr-1" aria-hidden="true"></i>
              专注时长
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
            <p class="text-gray-500 dark:text-gray-400 text-sm">时间追踪</p>
            <h3 class="text-2xl font-bold mt-1">{{ timeTrackings.length }}</h3>
            <p class="text-green-500 text-sm mt-2 flex items-center">
              <i class="fa fa-hourglass-half mr-1" aria-hidden="true"></i>
              工作时长
            </p>
          </div>
          <div class="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-accent">
            <i class="fa fa-hourglass-half text-xl" aria-hidden="true"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧：日历视图 -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-lg">日历</h3>
          <div class="flex space-x-2">
            <button class="btn-outline text-sm">
              <i class="fa fa-chevron-left mr-1" aria-hidden="true"></i>
              上月
            </button>
            <button class="btn-outline text-sm">
              <i class="fa fa-chevron-right mr-1" aria-hidden="true"></i>
              下月
            </button>
          </div>
        </div>
        
        <!-- 日历网格 -->
        <div class="grid grid-cols-7 gap-2">
          <!-- 星期标题 -->
          <div class="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">日</div>
          <div class="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">一</div>
          <div class="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">二</div>
          <div class="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">三</div>
          <div class="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">四</div>
          <div class="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">五</div>
          <div class="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">六</div>
          
          <!-- 日期单元格 -->
          <div v-for="i in 35" :key="i" class="border border-gray-200 dark:border-gray-700 rounded-lg p-2 min-h-[100px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div class="text-right text-sm font-medium">{{ i }}</div>
            <!-- 事件列表 -->
            <div class="mt-2 space-y-1">
              <div v-for="event in events.slice(0, 2)" :key="event.id" class="text-xs p-1 rounded truncate" :style="{ backgroundColor: event.color, color: '#fff' }">
                {{ event.title }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧：番茄钟和时间追踪 -->
      <div class="space-y-6">
        <!-- 番茄钟 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-lg">番茄钟</h3>
          </div>
          
          <!-- 番茄钟计时器 -->
          <div class="text-center mb-6">
            <div class="text-5xl font-bold mb-4">{{ formatTime(timer) }}</div>
            <div class="flex justify-center space-x-2">
              <button class="btn-primary" @click="startTimer" :disabled="isRunning">
                <i class="fa fa-play mr-1" aria-hidden="true"></i>
                开始
              </button>
              <button class="btn-outline" @click="pauseTimer" :disabled="!isRunning">
                <i class="fa fa-pause mr-1" aria-hidden="true"></i>
                暂停
              </button>
              <button class="btn-outline" @click="resetTimer">
                <i class="fa fa-refresh mr-1" aria-hidden="true"></i>
                重置
              </button>
            </div>
          </div>
          
          <!-- 番茄钟记录 -->
          <div>
            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">最近记录</h4>
            <ul class="space-y-2 max-h-40 overflow-y-auto">
              <li v-for="pomodoro in pomodoros.slice(0, 5)" :key="pomodoro.id" class="flex items-center justify-between text-sm">
                <span>{{ new Date(pomodoro.start_time).toLocaleString() }}</span>
                <span class="text-green-500">{{ pomodoro.completed ? '已完成' : '未完成' }}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- 时间追踪 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-lg">时间追踪</h3>
          </div>
          
          <!-- 时间追踪表单 -->
          <div class="mb-6">
            <input 
              type="text" 
              v-model="trackingDescription" 
              placeholder="输入追踪描述..." 
              class="input-field mb-3"
              :disabled="isTracking"
            >
            <div class="flex space-x-2">
              <button class="btn-primary flex-1" @click="startTracking" :disabled="isTracking || !trackingDescription.trim()">
                <i class="fa fa-play mr-1" aria-hidden="true"></i>
                {{ isTracking ? '追踪中...' : '开始追踪' }}
              </button>
              <button class="btn-outline" @click="stopTracking" :disabled="!isTracking">
                <i class="fa fa-stop mr-1" aria-hidden="true"></i>
                停止
              </button>
            </div>
          </div>
          
          <!-- 时间追踪记录 -->
          <div>
            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">最近记录</h4>
            <ul class="space-y-2 max-h-40 overflow-y-auto">
              <li v-for="tracking in timeTrackings.slice(0, 5)" :key="tracking.id" class="text-sm">
                <div class="flex justify-between items-center">
                  <span class="font-medium">{{ tracking.description }}</span>
                  <span class="text-green-500">{{ tracking.duration ? Math.floor(tracking.duration / 60) + '分钟' : '进行中' }}</span>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ new Date(tracking.start_time).toLocaleString() }} - {{ tracking.end_time ? new Date(tracking.end_time).toLocaleString() : '进行中' }}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 事件模态框 -->
    <div v-if="showEventModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in">
        <h3 class="text-xl font-bold mb-6">{{ currentEvent.id ? '编辑事件' : '新建事件' }}</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">标题</label>
            <input type="text" v-model="currentEvent.title" class="input-field" placeholder="事件标题">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述</label>
            <textarea v-model="currentEvent.description" class="input-field" rows="3" placeholder="事件描述"></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">开始时间</label>
              <input type="datetime-local" v-model="currentEvent.start_time" class="input-field">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">结束时间</label>
              <input type="datetime-local" v-model="currentEvent.end_time" class="input-field">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">地点</label>
            <input type="text" v-model="currentEvent.location" class="input-field" placeholder="事件地点">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">颜色</label>
            <input type="color" v-model="currentEvent.color" class="w-full h-10 rounded-lg cursor-pointer">
          </div>
        </div>
        
        <div class="flex justify-end space-x-2 mt-6">
          <button class="btn-outline" @click="closeEventModal">取消</button>
          <button class="btn-primary" @click="saveEvent">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>