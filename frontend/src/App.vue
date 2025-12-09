<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const currentDate = ref('');

// UI 组件状态
const showNotifications = ref(false);
const showUserMenu = ref(false);
const showFavorites = ref(false);
const showRecent = ref(false);
const favoritesSearch = ref('');
const favoritesFilter = ref('all');
// 侧边栏收缩状态
const isSidebarCollapsed = ref(false);

// 切换侧边栏收缩状态
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

// 通知数据 - 添加了跳转URL和更详细的分类信息
const notifications = ref([
  {
    id: 1,
    type: 'task',
    title: '任务截止提醒',
    message: '您有1个任务即将截止',
    url: '/tasks?id=1',
    icon: 'fa-tasks',
    color: 'blue',
    read: false,
    created_at: new Date(Date.now() - 7200000).toISOString() // 2小时前
  },
  {
    id: 2,
    type: 'calendar',
    title: '日程提醒',
    message: '明天有一个重要会议',
    url: '/calendar',
    icon: 'fa-calendar',
    color: 'green',
    read: false,
    created_at: new Date(Date.now() - 18000000).toISOString() // 5小时前
  },
  {
    id: 3,
    type: 'system',
    title: '系统通知',
    message: '应用已更新到最新版本',
    url: '/settings',
    icon: 'fa-bell',
    color: 'purple',
    read: false,
    created_at: new Date(Date.now() - 86400000).toISOString() // 1天前
  }
]);

// 收藏数据
const favorites = ref([
  {
    id: 1,
    title: '完成项目文档',
    type: 'task',
    category: '工作',
    url: '/tasks',
    icon: 'fa-check-square-o',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: '健康饮食计划',
    type: 'health',
    category: '健康',
    url: '/health',
    icon: 'fa-heartbeat',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 3,
    title: '2025年度预算',
    type: 'finance',
    category: '财务',
    url: '/finance',
    icon: 'fa-money',
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
]);

// 最近访问数据
const recentVisits = ref([
  {
    id: 1,
    title: '任务管理',
    type: 'page',
    url: '/tasks',
    icon: 'fa-check-square-o',
    visited_at: new Date().toISOString()
  },
  {
    id: 2,
    title: '健康管理',
    type: 'page',
    url: '/health',
    icon: 'fa-heartbeat',
    visited_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 3,
    title: '财务管理',
    type: 'page',
    url: '/finance',
    icon: 'fa-money',
    visited_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 4,
    title: '笔记管理',
    type: 'page',
    url: '/notes',
    icon: 'fa-book',
    visited_at: new Date(Date.now() - 10800000).toISOString()
  }
]);

// 推荐内容数据
const recommendedContent = ref([
  {
    id: 1,
    title: '如何提高工作效率',
    type: 'article',
    url: '/articles/1',
    icon: 'fa-file-text-o',
    reason: '基于您的工作任务收藏推荐'
  },
  {
    id: 2,
    title: '健康饮食指南',
    type: 'article',
    url: '/articles/2',
    icon: 'fa-cutlery',
    reason: '基于您的健康管理访问推荐'
  }
]);

// 未读通知数量
const unreadNotificationsCount = computed(() => {
  return notifications.value.filter(notification => !notification.read).length;
});

// 按类型分组的通知
const groupedNotifications = computed(() => {
  return {
    task: notifications.value.filter(n => n.type === 'task'),
    calendar: notifications.value.filter(n => n.type === 'calendar'),
    system: notifications.value.filter(n => n.type === 'system')
  };
});

// 分类数据
const categories = ref(['all', '工作', '健康', '财务', '学习', '生活']);

// 设置当前日期
const setCurrentDate = () => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  currentDate.value = new Date().toLocaleDateString('zh-CN', options);
};

// 初始化主题
const initTheme = () => {
  if (localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
};

// 切换主题
const toggleTheme = () => {
  document.documentElement.classList.toggle('dark');
  
  if (document.documentElement.classList.contains('dark')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
};

// 通知按钮点击事件
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showUserMenu.value) {
    showUserMenu.value = false;
  }
  if (showFavorites.value) {
    showFavorites.value = false;
  }
  if (showRecent.value) {
    showRecent.value = false;
  }
};

// 用户菜单按钮点击事件
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
  if (showNotifications.value) {
    showNotifications.value = false;
  }
  if (showFavorites.value) {
    showFavorites.value = false;
  }
  if (showRecent.value) {
    showRecent.value = false;
  }
};

// 收藏菜单点击事件
const toggleFavorites = () => {
  showFavorites.value = !showFavorites.value;
  if (showNotifications.value) {
    showNotifications.value = false;
  }
  if (showUserMenu.value) {
    showUserMenu.value = false;
  }
  if (showRecent.value) {
    showRecent.value = false;
  }
};

// 最近访问菜单点击事件
const toggleRecent = () => {
  showRecent.value = !showRecent.value;
  if (showNotifications.value) {
    showNotifications.value = false;
  }
  if (showUserMenu.value) {
    showUserMenu.value = false;
  }
  if (showFavorites.value) {
    showFavorites.value = false;
  }
};

// 关闭所有弹出菜单
const closeAllMenus = () => {
  showNotifications.value = false;
  showUserMenu.value = false;
  showFavorites.value = false;
  showRecent.value = false;
};

// 过滤后的收藏
const filteredFavorites = computed(() => {
  let result = favorites.value;
  
  // 搜索过滤
  if (favoritesSearch.value) {
    const query = favoritesSearch.value.toLowerCase();
    result = result.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query)
    );
  }
  
  // 分类过滤
  if (favoritesFilter.value !== 'all') {
    result = result.filter(item => item.category === favoritesFilter.value);
  }
  
  return result;
});

// 添加到收藏
const addToFavorites = (item) => {
  const existing = favorites.value.find(fav => fav.id === item.id);
  if (!existing) {
    favorites.value.push({
      ...item,
      created_at: new Date().toISOString()
    });
    // 模拟数据同步
    syncFavorites();
  }
};

// 从收藏中删除
const removeFromFavorites = (id) => {
  const index = favorites.value.findIndex(item => item.id === id);
  if (index > -1) {
    favorites.value.splice(index, 1);
    // 模拟数据同步
    syncFavorites();
  }
};

// 清除最近访问
const clearRecentVisits = () => {
  recentVisits.value = [];
  // 模拟数据同步
  syncRecentVisits();
};

// 数据同步模拟
const syncFavorites = () => {
  console.log('同步收藏数据到服务器...');
  // 实际实现中，这里会调用 API 同步数据
};

const syncRecentVisits = () => {
  console.log('同步最近访问数据到服务器...');
  // 实际实现中，这里会调用 API 同步数据
};

// 导航到收藏项目
const navigateToFavorite = (favorite) => {
  router.push(favorite.url);
  closeAllMenus();
};

// 导航到最近访问项目
const navigateToRecent = (recent) => {
  router.push(recent.url);
  closeAllMenus();
};

// 导航到推荐内容
const navigateToRecommended = (recommended) => {
  router.push(recommended.url);
  closeAllMenus();
};

// 自动记录访问历史
const recordVisit = (title, type, url, icon) => {
  // 检查是否已存在
  const existingIndex = recentVisits.value.findIndex(item => item.url === url);
  if (existingIndex > -1) {
    // 更新时间
    recentVisits.value[existingIndex].visited_at = new Date().toISOString();
  } else {
    // 添加新记录
    recentVisits.value.unshift({
      id: Date.now(),
      title,
      type,
      url,
      icon,
      visited_at: new Date().toISOString()
    });
    // 限制最近访问数量为10条
    if (recentVisits.value.length > 10) {
      recentVisits.value.pop();
    }
  }
  // 模拟数据同步
  syncRecentVisits();
};

// 监听路由变化，记录访问历史
router.beforeEach((to, from, next) => {
  const pageTitles = {
    '/': '仪表盘',
    '/tasks': '任务管理',
    '/calendar': '时间管理',
    '/notes': '笔记管理',
    '/health': '健康管理',
    '/finance': '财务管理',
    '/shortcuts': '全局快捷'
  };
  
  const pageIcons = {
    '/': 'fa-tachometer',
    '/tasks': 'fa-check-square-o',
    '/calendar': 'fa-calendar',
    '/notes': 'fa-book',
    '/health': 'fa-heartbeat',
    '/finance': 'fa-money',
    '/shortcuts': 'fa-cubes'
  };
  
  if (pageTitles[to.path]) {
    recordVisit(pageTitles[to.path], 'page', to.path, pageIcons[to.path]);
  }
  next();
});

// 分类图标映射
const getCategoryIcon = (category) => {
  const iconMap = {
    '工作': 'fa-briefcase',
    '健康': 'fa-heartbeat',
    '财务': 'fa-money',
    '学习': 'fa-book',
    '生活': 'fa-home'
  };
  return iconMap[category] || 'fa-tag';
};

// 日期格式化
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // 今天
    return `今天 ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    // 昨天
    return `昨天 ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    // 一周内
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${days[date.getDay()]} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    // 超过一周
    return date.toLocaleDateString();
  }
};

// 跳转到新建任务
const goToNewTask = () => {
  router.push('/tasks?new=true');
};

// 初始化
onMounted(() => {
  setCurrentDate();
  initTheme();
  
  // 点击外部关闭菜单
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!target.closest('#notification-btn') && !target.closest('#notifications-menu')) {
      showNotifications.value = false;
    }
    if (!target.closest('#user-menu-btn') && !target.closest('#user-menu')) {
      showUserMenu.value = false;
    }
    if (!target.closest('#favorites-btn') && !target.closest('#favorites-menu')) {
      showFavorites.value = false;
    }
    if (!target.closest('#recent-btn') && !target.closest('#recent-menu')) {
      showRecent.value = false;
    }
  });
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
    <!-- 背景图案 -->
    <div class="fixed inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none">
      <img src="https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/3b87a3ce3c2844ff8aa199194c7c7734~tplv-a9rns2rl98-image.image?rcl=202512011155538D5B8BF7480212D9B9F0&amp;rk3s=8e244e95&amp;rrcfp=f06b921b&amp;x-expires=1767153428&amp;x-signature=vHYyvHoMhIAo37%2BuduQbze9yPt0%3D" alt="Background" class="w-full h-full object-cover">
    </div>

    <!-- 顶部导航栏 -->
    <header class="fixed top-0 left-0 right-0 z-50 h-16 bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80 backdrop-blur-md shadow-sm flex items-center">
      <div class="container mx-auto px-4 flex items-center justify-between w-full">
        <!-- Logo -->
        <div class="flex items-center space-x-3">
          <img src="https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/774d6094055a426fabf4134c1b6438b7~tplv-a9rns2rl98-image.image?rcl=202512011155538D5B8BF7480212D9B9F0&amp;rk3s=8e244e95&amp;rrcfp=f06b921b&amp;x-expires=1767153412&amp;x-signature=t5D0IUvcayfmdHdd%2FrMGDVm3C70%3D" alt="FlowSync Logo" class="h-10 w-auto">
          <h1 class="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:block">FlowSync</h1>
        </div>

        <!-- 搜索框 -->
        <div class="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div class="relative w-full">
            <input type="text" placeholder="搜索任务、笔记、日程..." class="input-field pl-3 bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70">
          </div>
        </div>

        <!-- 右侧工具栏 -->
        <div class="flex items-center space-x-4">
          <!-- 主题切换按钮 -->
          <button id="theme-toggle" @click="toggleTheme" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <i class="fa fa-moon-o dark:hidden" aria-hidden="true"></i>
            <i class="fa fa-sun-o hidden dark:block text-yellow-300" aria-hidden="true"></i>
          </button>

          <!-- 通知按钮 -->
          <div class="relative">
            <button 
              id="notification-btn" 
              class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              @click="toggleNotifications"
            >
              <i class="fa fa-bell-o" aria-hidden="true"></i>
              <span v-if="unreadNotificationsCount > 0" class="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">{{ unreadNotificationsCount }}</span>
            </button>
            
            <!-- 通知菜单 -->
            <div 
              id="notifications-menu"
              v-if="showNotifications"
              class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 z-50 animate-fade-in transition-all duration-300"
            >
              <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <h3 class="font-medium">通知</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ unreadNotificationsCount }}条未读通知</p>
              </div>
              <div class="max-h-60 overflow-y-auto">
                <!-- 任务通知 -->
                <div v-if="groupedNotifications.task.length > 0" class="mt-2">
                  <div class="px-4 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">任务通知</div>
                  <div 
                    v-for="notification in groupedNotifications.task" 
                    :key="notification.id"
                    class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-750 cursor-pointer transition-all duration-200"
                    @click="() => { router.push(notification.url); notification.read = true; showNotifications.value = false; }"
                  >
                    <div class="flex items-start space-x-3">
                      <div class="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-primary">
                        <i :class="notification.icon"></i>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium">{{ notification.title }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ notification.message }}</p>
                        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ formatDate(notification.created_at) }}</p>
                      </div>
                      <div v-if="!notification.read" class="h-2 w-2 rounded-full bg-red-500 mt-2"></div>
                    </div>
                  </div>
                </div>
                
                <!-- 日程通知 -->
                <div v-if="groupedNotifications.calendar.length > 0" class="mt-2">
                  <div class="px-4 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">日程通知</div>
                  <div 
                    v-for="notification in groupedNotifications.calendar" 
                    :key="notification.id"
                    class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-750 cursor-pointer transition-all duration-200"
                    @click="() => { router.push(notification.url); notification.read = true; showNotifications.value = false; }"
                  >
                    <div class="flex items-start space-x-3">
                      <div class="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-secondary">
                        <i :class="notification.icon"></i>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium">{{ notification.title }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ notification.message }}</p>
                        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ formatDate(notification.created_at) }}</p>
                      </div>
                      <div v-if="!notification.read" class="h-2 w-2 rounded-full bg-red-500 mt-2"></div>
                    </div>
                  </div>
                </div>
                
                <!-- 系统通知 -->
                <div v-if="groupedNotifications.system.length > 0" class="mt-2">
                  <div class="px-4 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">系统通知</div>
                  <div 
                    v-for="notification in groupedNotifications.system" 
                    :key="notification.id"
                    class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-750 cursor-pointer transition-all duration-200"
                    @click="() => { router.push(notification.url); notification.read = true; showNotifications.value = false; }"
                  >
                    <div class="flex items-start space-x-3">
                      <div class="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300">
                        <i :class="notification.icon"></i>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium">{{ notification.title }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ notification.message }}</p>
                        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ formatDate(notification.created_at) }}</p>
                      </div>
                      <div v-if="!notification.read" class="h-2 w-2 rounded-full bg-red-500 mt-2"></div>
                    </div>
                  </div>
                </div>
                
                <!-- 无通知状态 -->
                <div v-if="notifications.length === 0" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  <i class="fa fa-bell-slash-o text-3xl mb-2"></i>
                  <p class="text-sm">暂无通知</p>
                </div>
              </div>
              <div class="px-4 py-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                <button class="w-full text-sm text-primary hover:underline transition-colors duration-200">查看所有通知</button>
              </div>
            </div>
          </div>

          <!-- 用户头像 -->
          <div class="relative">
            <button 
              id="user-menu-btn" 
              class="flex items-center space-x-2"
              @click="toggleUserMenu"
            >
              <div class="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-medium">
                JD
              </div>
              <i class="fa fa-angle-down text-gray-500 dark:text-gray-400 hidden sm:block"></i>
            </button>
            
            <!-- 用户菜单 -->
            <div 
              id="user-menu"
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 z-50 animate-fade-in transition-all duration-300 transform origin-top-right"
            >
              <div class="px-4 py-3 cursor-pointer transition-all duration-200">
                <div class="flex items-center space-x-3">
                  <div class="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-medium">
                    JD
                  </div>
                  <div>
                    <p class="text-sm font-medium">John Doe</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">john.doe@example.com</p>
                  </div>
                </div>
              </div>
              <div class="border-t border-gray-200 dark:border-gray-700 mt-2">
                <button class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-200 flex items-center space-x-2"
                        @click="() => { router.push('/profile'); showUserMenu.value = false; }">
                  <i class="fa fa-user mr-2 text-gray-400"></i>
                  <span>个人资料</span>
                </button>
                <button class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-200 flex items-center space-x-2"
                        @click="() => { router.push('/settings'); showUserMenu.value = false; }">
                  <i class="fa fa-cog mr-2 text-gray-400"></i>
                  <span>设置</span>
                </button>
                <button class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-200 flex items-center space-x-2"
                        @click="() => { router.push('/notifications'); showUserMenu.value = false; }">
                  <i class="fa fa-bell mr-2 text-gray-400"></i>
                  <span>通知设置</span>
                </button>
                <button class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-200 flex items-center space-x-2"
                        @click="() => { router.push('/help'); showUserMenu.value = false; }">
                  <i class="fa fa-question-circle mr-2 text-gray-400"></i>
                  <span>帮助中心</span>
                </button>
              </div>
              <div class="border-t border-gray-200 dark:border-gray-700 mt-2">
                <button class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-200 flex items-center space-x-2">
                  <i class="fa fa-sign-out mr-2"></i>
                  <span>退出登录</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 左侧固定侧边栏 -->
    <aside 
      class="fixed left-0 top-16 bottom-0 bg-white dark:bg-gray-800 shadow-md z-40 overflow-y-auto hidden md:block transition-all duration-300"
      :class="isSidebarCollapsed ? 'w-[60px]' : 'w-[200px]'"
    >
      <div class="p-4 h-full flex flex-col">
        <!-- 侧边栏切换按钮 -->
        <button 
          @click="toggleSidebar"
          class="mb-4 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-200 flex items-center justify-center"
          :title="isSidebarCollapsed ? '展开侧边栏' : '收缩侧边栏'"
        >
          <i :class="['fa', isSidebarCollapsed ? 'fa-angle-right' : 'fa-angle-left']" aria-hidden="true"></i>
        </button>
        
        <nav class="flex-1">
          <ul class="space-y-1">
            <li>
              <router-link to="/" class="nav-link flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-200" active-class="bg-primary bg-opacity-10 text-primary font-medium">
                <i class="fa fa-tachometer" aria-hidden="true" :class="isSidebarCollapsed ? 'mx-auto' : ''"></i>
                <span :class="isSidebarCollapsed ? 'hidden' : 'block'">仪表盘</span>
              </router-link>
            </li>
            <li>
              <router-link to="/tasks" class="nav-link flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-200" active-class="bg-primary bg-opacity-10 text-primary font-medium">
                <i class="fa fa-check-square-o" aria-hidden="true" :class="isSidebarCollapsed ? 'mx-auto' : ''"></i>
                <span :class="isSidebarCollapsed ? 'hidden' : 'block'">任务管理</span>
              </router-link>
            </li>
            <li>
              <router-link to="/calendar" class="nav-link flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-200" active-class="bg-primary bg-opacity-10 text-primary font-medium">
                <i class="fa fa-calendar" aria-hidden="true" :class="isSidebarCollapsed ? 'mx-auto' : ''"></i>
                <span :class="isSidebarCollapsed ? 'hidden' : 'block'">时间管理</span>
              </router-link>
            </li>
            <li>
              <router-link to="/notes" class="nav-link flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-200" active-class="bg-primary bg-opacity-10 text-primary font-medium">
                <i class="fa fa-book" aria-hidden="true" :class="isSidebarCollapsed ? 'mx-auto' : ''"></i>
                <span :class="isSidebarCollapsed ? 'hidden' : 'block'">笔记管理</span>
              </router-link>
            </li>
            <li>
              <router-link to="/health" class="nav-link flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-200" active-class="bg-primary bg-opacity-10 text-primary font-medium">
                <i class="fa fa-heartbeat" aria-hidden="true" :class="isSidebarCollapsed ? 'mx-auto' : ''"></i>
                <span :class="isSidebarCollapsed ? 'hidden' : 'block'">健康管理</span>
              </router-link>
            </li>
            <li>
              <router-link to="/finance" class="nav-link flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-200" active-class="bg-primary bg-opacity-10 text-primary font-medium">
                <i class="fa fa-money" aria-hidden="true" :class="isSidebarCollapsed ? 'mx-auto' : ''"></i>
                <span :class="isSidebarCollapsed ? 'hidden' : 'block'">财务管理</span>
              </router-link>
            </li>
            <li>
              <router-link to="/shortcuts" class="nav-link flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-all duration-200" active-class="bg-primary bg-opacity-10 text-primary font-medium">
                <i class="fa fa-cubes" aria-hidden="true" :class="isSidebarCollapsed ? 'mx-auto' : ''"></i>
                <span :class="isSidebarCollapsed ? 'hidden' : 'block'">全局快捷</span>
              </router-link>
            </li>
          </ul>
        </nav>

        <!-- 底部快捷按钮 -->
        <div class="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            @click="goToNewTask"
            class="btn-primary w-full flex items-center justify-center space-x-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            :title="isSidebarCollapsed ? '新建任务' : ''"
          >
            <i class="fa fa-plus" aria-hidden="true"></i>
            <span :class="isSidebarCollapsed ? 'hidden' : 'block'">新建任务</span>
          </button>
          
          <!-- 快速访问 -->
          <div class="mt-4" :class="isSidebarCollapsed ? 'hidden' : 'block'">
            <h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">快速访问</h3>
            <ul class="space-y-1">
              <li>
                <router-link to="/shortcuts?section=favorites" class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors w-full text-left text-sm">
                  <i class="fa fa-star-o text-yellow-500" aria-hidden="true"></i>
                  <span>收藏</span>
                </router-link>
              </li>
              <li>
                <router-link to="/shortcuts?section=recent" class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors w-full text-left text-sm">
                  <i class="fa fa-clock-o text-blue-500" aria-hidden="true"></i>
                  <span>最近访问</span>
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main 
      class="pt-16 pb-8 px-6 transition-all duration-300"
      :class="isSidebarCollapsed ? 'md:ml-[60px]' : 'md:ml-[200px]'"
    >
      <div class="container mx-auto">
        <router-view class="animate-fade-in"></router-view>
      </div>
    </main>
  </div>
</template>

<style>
/* 引入外部样式 */
@import url('https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css');
</style>
