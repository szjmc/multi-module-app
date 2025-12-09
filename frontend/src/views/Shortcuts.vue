<template>
  <div class="p-6">
    <!-- 顶部标题栏 -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">
        {{ currentSection === 'favorites' ? '收藏' : 
           currentSection === 'recent' ? '最近访问' : '个人数据全景控制台' }}
      </h1>
      <div class="flex gap-2">
          <button @click="refreshData" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
            <i class="fa fa-refresh mr-2"></i>
            刷新数据
          </button>
          <button 
            v-if="currentSection !== 'dashboard'"
            @click="switchSection('dashboard')"
            class="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center"
          >
            <i class="fa fa-arrow-left mr-2"></i>
            返回控制台
          </button>
        </div>
    </div>
    
    <!-- 内容区域选项卡 -->
    <div class="mb-6">
      <div class="flex border-b border-gray-200 dark:border-gray-700">
        <button 
          @click="switchSection('dashboard')"
          :class="[
            'px-5 py-3 text-sm font-medium border-b-2 transition-colors',
            currentSection === 'dashboard' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
        >
          <i class="fa fa-tachometer mr-1"></i>
          控制台
        </button>
        <button 
          @click="switchSection('favorites')"
          :class="[
            'px-5 py-3 text-sm font-medium border-b-2 transition-colors',
            currentSection === 'favorites' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
        >
          <i class="fa fa-star-o mr-1"></i>
          收藏
        </button>
        <button 
          @click="switchSection('recent')"
          :class="[
            'px-5 py-3 text-sm font-medium border-b-2 transition-colors',
            currentSection === 'recent' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
        >
          <i class="fa fa-clock-o mr-1"></i>
          最近访问
        </button>
      </div>
    </div>

    <!-- 收藏内容 -->
    <div v-if="currentSection === 'favorites'" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h2 class="text-lg font-semibold">我的收藏</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">共 {{ filteredFavorites.length }} 个收藏项目</p>
        </div>
        <div class="flex gap-2">
          <div class="relative">
            <input 
              v-model="favoritesSearch" 
              type="text" 
              placeholder="搜索收藏..." 
              class="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
            <i class="fa fa-search absolute left-3 top-2.5 text-gray-400"></i>
          </div>
          <select 
            v-model="favoritesFilter" 
            class="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">所有分类</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="favorite in filteredFavorites" 
          :key="favorite.id" 
          class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-3">
              <div class="mt-1">
                <i :class="['fa', favorite.icon, 'text-2xl text-primary']"></i>
              </div>
              <div class="flex-1">
                <h3 class="font-medium">{{ favorite.title }}</h3>
                <div class="flex items-center mt-1 space-x-2">
                  <span class="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full flex items-center">
                    <i :class="['fa', getCategoryIcon(favorite.category), 'mr-1']"></i>
                    {{ favorite.category }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(favorite.created_at) }}</span>
                </div>
              </div>
            </div>
            <button 
              class="text-red-500 hover:text-red-700" 
              @click="removeFromFavorites(favorite.id)"
            >
              <i class="fa fa-trash-o"></i>
            </button>
          </div>
          <div class="mt-3">
            <button 
              @click="navigateToItem(favorite)" 
              class="text-sm text-primary hover:text-primary/80"
            >
              <i class="fa fa-arrow-right mr-1"></i>
              查看详情
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredFavorites.length === 0" class="text-center py-12">
        <i class="fa fa-star-o text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
        <h3 class="text-lg font-medium mb-1">暂无收藏</h3>
        <p class="text-gray-500 dark:text-gray-400">您还没有添加任何收藏项目</p>
      </div>

      <!-- 推荐内容 -->
      <div v-if="filteredFavorites.length > 0" class="mt-8">
        <h3 class="text-lg font-semibold mb-4">为您推荐</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="item in recommendedContent" 
            :key="item.id" 
            class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 hover:shadow-md transition-shadow border border-dashed border-gray-200 dark:border-gray-600"
          >
            <div class="flex items-start space-x-3">
              <div class="mt-1">
                <i :class="['fa', item.icon, 'text-xl text-primary']"></i>
              </div>
              <div class="flex-1">
                <h3 class="font-medium">{{ item.title }}</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ item.reason }}</p>
              </div>
            </div>
            <div class="mt-3">
              <button 
                @click="navigateToItem(item)" 
                class="text-sm text-primary hover:text-primary/80"
              >
                <i class="fa fa-arrow-right mr-1"></i>
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近访问内容 -->
    <div v-if="currentSection === 'recent'" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h2 class="text-lg font-semibold">最近访问</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">共 {{ recentVisits.length }} 条记录</p>
        </div>
        <button 
          @click="clearRecentVisits" 
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          <i class="fa fa-trash-o mr-1"></i>
          清除记录
        </button>
      </div>

      <div class="space-y-3">
        <div 
          v-for="item in recentVisits" 
          :key="item.id" 
          class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-750 rounded-lg hover:shadow-sm transition-shadow"
        >
          <div class="mt-1">
            <i :class="['fa', item.icon, 'text-2xl text-primary']"></i>
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <h3 class="font-medium">{{ item.title }}</h3>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(item.visited_at) }}</span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ item.type === 'page' ? '页面' : '项目' }}</p>
          </div>
          <button 
            @click="navigateToItem(item)" 
            class="text-primary hover:text-primary/80"
          >
            <i class="fa fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="recentVisits.length === 0" class="text-center py-12">
        <i class="fa fa-clock-o text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
        <h3 class="text-lg font-medium mb-1">暂无访问记录</h3>
        <p class="text-gray-500 dark:text-gray-400">您还没有任何访问记录</p>
      </div>
    </div>

    <!-- 控制台内容 -->
    <template v-if="currentSection === 'dashboard'">
      <!-- 核心数据统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <p class="text-sm text-gray-500 dark:text-gray-400">待办任务</p>
            <h3 class="text-xl font-bold">{{ stats.tasks }}</h3>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <p class="text-sm text-gray-500 dark:text-gray-400">今日日程</p>
            <h3 class="text-xl font-bold">{{ stats.events }}</h3>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-orange-500">
            <p class="text-sm text-gray-500 dark:text-gray-400">本月笔记</p>
            <h3 class="text-xl font-bold">{{ stats.notes }}</h3>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <p class="text-sm text-gray-500 dark:text-gray-400">本月支出</p>
            <h3 class="text-xl font-bold text-red-500">¥{{ stats.expenses.toFixed(2) }}</h3>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-purple-500">
            <p class="text-sm text-gray-500 dark:text-gray-400">健康评分</p>
            <h3 class="text-xl font-bold">{{ stats.healthScore }}</h3>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-teal-500">
            <p class="text-sm text-gray-500 dark:text-gray-400">今日进度</p>
            <h3 class="text-xl font-bold">{{ stats.progress }}%</h3>
          </div>
        </div>

      <!-- 快速操作区域 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <!-- 工作快捷操作 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 class="text-lg font-semibold mb-4 flex items-center">
            <i class="fa fa-briefcase text-blue-500 mr-2"></i>
            工作快捷操作
          </h3>
          <div class="grid grid-cols-1 gap-3">
            <button @click="quickAddTask" class="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
              <i class="fa fa-plus mr-2"></i>
              快速添加任务
            </button>
            <button @click="viewHighPriorityTasks" class="bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
              <i class="fa fa-exclamation-circle mr-2"></i>
              高优先级任务
            </button>
            <button @click="viewTodayTasks" class="bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
              <i class="fa fa-clock-o mr-2"></i>
              今日截止任务
            </button>
            <button @click="scheduleMeeting" class="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
              <i class="fa fa-calendar-plus-o mr-2"></i>
              安排会议
            </button>
          </div>
        </div>

        <!-- 健康快捷操作 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 class="text-lg font-semibold mb-4 flex items-center">
            <i class="fa fa-heartbeat text-red-500 mr-2"></i>
            健康快捷操作
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <button @click="recordExercise" class="bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
              <i class="fa fa-running mr-2"></i>
              记录运动
            </button>
            <button @click="recordWeight" class="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
              <i class="fa fa-balance-scale mr-2"></i>
              记录体重
            </button>
            <button @click="recordSleep" class="bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800 text-orange-700 dark:text-orange-300 py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
              <i class="fa fa-bed mr-2"></i>
              记录睡眠
            </button>
            <button @click="recordMeal" class="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
              <i class="fa fa-cutlery mr-2"></i>
              记录饮食
            </button>
          </div>
        </div>

        <!-- 生活快捷操作 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 class="text-lg font-semibold mb-4 flex items-center">
            <i class="fa fa-home text-green-500 mr-2"></i>
            生活快捷操作
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <button @click="quickNote" class="bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
              <i class="fa fa-sticky-note-o mr-2"></i>
              快速笔记
            </button>
            <button @click="recordExpense" class="bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
              <i class="fa fa-money mr-2"></i>
              记录支出
            </button>
          </div>
        </div>
      </div>

      <!-- 模块快速入口 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <h3 class="text-lg font-semibold mb-4 flex items-center">
          <i class="fa fa-th-large text-gray-500 mr-2"></i>
          模块快速入口
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <!-- 任务管理 -->
          <router-link to="/tasks" class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div class="flex flex-col items-center text-center">
              <div class="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-3">
                <i class="fa fa-check-square-o text-blue-500 text-xl"></i>
              </div>
              <h4 class="font-medium">任务管理</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">管理日常任务和待办事项</p>
            </div>
          </router-link>

          <!-- 日历管理 -->
          <router-link to="/calendar" class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div class="flex flex-col items-center text-center">
              <div class="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-3">
                <i class="fa fa-calendar text-green-500 text-xl"></i>
              </div>
              <h4 class="font-medium">日历管理</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">查看和管理日程安排</p>
            </div>
          </router-link>

          <!-- 知识库 -->
          <router-link to="/notes" class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div class="flex flex-col items-center text-center">
              <div class="h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-3">
                <i class="fa fa-book text-orange-500 text-xl"></i>
              </div>
              <h4 class="font-medium">知识库</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">记录管理知识和笔记</p>
            </div>
          </router-link>

          <!-- 财务管理 -->
          <router-link to="/finance" class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div class="flex flex-col items-center text-center">
              <div class="h-12 w-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-3">
                <i class="fa fa-money text-red-500 text-xl"></i>
              </div>
              <h4 class="font-medium">财务管理</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">跟踪收入和支出</p>
            </div>
          </router-link>

          <!-- 健康管理 -->
          <router-link to="/health" class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div class="flex flex-col items-center text-center">
              <div class="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-3">
                <i class="fa fa-heartbeat text-purple-500 text-xl"></i>
              </div>
              <h4 class="font-medium">健康管理</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">记录健康数据和运动习惯</p>
            </div>
          </router-link>

          <!-- 快捷操作 -->
          <router-link to="/shortcuts" class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div class="flex flex-col items-center text-center">
              <div class="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                <i class="fa fa-bolt text-gray-500 text-xl"></i>
              </div>
              <h4 class="font-medium">快捷操作</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">快速访问常用功能</p>
            </div>
          </router-link>
        </div>
      </div>

      <!-- 今日任务焦点和快速备忘录 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- 今日任务焦点 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 lg:col-span-2">
          <h3 class="text-lg font-semibold mb-4 flex items-center">
            <i class="fa fa-bullseye text-orange-500 mr-2"></i>
            今日任务焦点
          </h3>
          <div v-if="todayTasks.length > 0" class="space-y-4">
            <div 
              v-for="task in todayTasks" 
              :key="task.id" 
              class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-start space-x-3">
                  <div class="mt-1">
                    <input type="checkbox" :checked="task.status === 'completed'" class="form-checkbox h-5 w-5 text-blue-600">
                  </div>
                  <div class="flex-1">
                    <h4 class="font-medium">{{ task.title }}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ task.description }}</p>
                    <div class="flex items-center mt-2 space-x-2">
                      <span :class="['text-xs px-2 py-1 rounded-full', 
                        task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 
                        'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      ]">
                        {{ task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低' }}优先级
                      </span>
                      <span class="text-xs text-gray-500 dark:text-gray-400">{{ task.due_date }}</span>
                    </div>
                  </div>
                </div>
                <router-link to="/tasks" class="text-primary hover:text-primary/80">
                  <i class="fa fa-arrow-right"></i>
                </router-link>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12">
            <i class="fa fa-tasks text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
            <h4 class="font-medium mb-1">暂无任务</h4>
            <p class="text-gray-500 dark:text-gray-400">您还没有添加任何任务</p>
            <router-link to="/tasks" class="mt-4 inline-block text-primary hover:text-primary/80">
              <i class="fa fa-arrow-right mr-1"></i>
              去添加任务
            </router-link>
          </div>
        </div>

        <!-- 快速备忘录 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 class="text-lg font-semibold mb-4 flex items-center">
            <i class="fa fa-sticky-note-o text-yellow-500 mr-2"></i>
            快速备忘录
          </h3>
          <div class="space-y-3">
            <textarea 
              placeholder="在这里记录临时想法..." 
              rows="5" 
              v-model="memoContent"
              class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
            <div class="flex justify-end gap-2">
              <button 
                @click="clearMemo"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                清空
              </button>
              <button 
                @click="saveMemo"
                class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据洞察 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 class="text-lg font-semibold mb-4 flex items-center">
          <i class="fa fa-line-chart text-blue-500 mr-2"></i>
          数据洞察
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- 任务完成率 -->
          <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
            <h4 class="text-sm font-medium mb-2">任务完成率</h4>
            <div class="flex items-center space-x-3">
              <div class="flex-1">
                <div class="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500 rounded-full" :style="{width: `${insights.taskCompletionRate}%`}"></div>
                </div>
              </div>
              <span class="text-sm font-medium">{{ insights.taskCompletionRate }}%</span>
            </div>
          </div>

          <!-- 本周运动 -->
          <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
            <h4 class="text-sm font-medium mb-2">本周运动</h4>
            <div class="flex flex-col items-center">
              <div class="text-2xl font-bold text-green-500">{{ insights.weeklyExercise }}</div>
              <span class="text-sm text-gray-500 dark:text-gray-400">次</span>
            </div>
          </div>

          <!-- 本月笔记 -->
          <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
            <h4 class="text-sm font-medium mb-2">本月笔记</h4>
            <div class="flex flex-col items-center">
              <div class="text-2xl font-bold text-orange-500">{{ insights.monthlyNotes }}</div>
              <span class="text-sm text-gray-500 dark:text-gray-400">篇</span>
            </div>
          </div>

          <!-- 财务状况 -->
          <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
            <h4 class="text-sm font-medium mb-2">财务状况</h4>
            <div class="space-y-1">
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">本月支出:</span>
                <span class="text-sm text-red-500">¥{{ insights.monthlyExpenses.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">收支差额:</span>
                <span :class="['text-sm', insights.balanceDifference >= 0 ? 'text-green-500' : 'text-red-500']">
                  ¥{{ insights.balanceDifference.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { taskApi, eventApi, noteApi, expenseRecordApi, healthRecordApi } from '../services/api';

const route = useRoute();
const router = useRouter();

// 当前显示的内容区域
const currentSection = ref(route.query.section || 'dashboard');

// 从本地存储加载数据
const loadData = () => {
  const savedFavorites = localStorage.getItem('favorites');
  const savedRecentVisits = localStorage.getItem('recentVisits');
  
  if (savedFavorites) {
    favorites.value = JSON.parse(savedFavorites);
  }
  
  if (savedRecentVisits) {
    recentVisits.value = JSON.parse(savedRecentVisits);
  }
};

// 保存数据到本地存储
const saveData = () => {
  localStorage.setItem('favorites', JSON.stringify(favorites.value));
  localStorage.setItem('recentVisits', JSON.stringify(recentVisits.value));
};

// 收藏数据
const favorites = ref([]);

// 最近访问数据
const recentVisits = ref([]);

// 推荐内容数据（暂时为空，后续可以从API获取）
const recommendedContent = ref([]);

// 快速备忘录内容
const memoContent = ref('');

// 数据统计
const stats = ref({
  tasks: 0,
  events: 0,
  notes: 0,
  expenses: 0,
  healthScore: 0,
  progress: 0
});

// 今日任务
const todayTasks = ref([]);

// 数据洞察
const insights = ref({
  taskCompletionRate: 0,
  weeklyExercise: 0,
  monthlyNotes: 0,
  monthlyExpenses: 0,
  balanceDifference: 0
});

// 加载数据
onMounted(() => {
  loadData();
  loadStats();
  loadTodayTasks();
  loadInsights();
});

// 加载统计数据
const loadStats = async () => {
  try {
    // 待办任务数量
    const tasks = await taskApi.getAll();
    stats.value.tasks = tasks.length;
    
    // 今日日程数量
    const today = new Date().toISOString().split('T')[0];
    const events = await eventApi.getAll();
    stats.value.events = events.filter(event => 
      event.start_date.startsWith(today)
    ).length;
    
    // 本月笔记数量
    const currentMonth = new Date().getMonth() + 1;
    const notes = await noteApi.getAll();
    stats.value.notes = notes.filter(note => 
      new Date(note.created_at).getMonth() + 1 === currentMonth
    ).length;
    
    // 本月支出
    const expenses = await expenseRecordApi.getAll();
    stats.value.expenses = expenses.filter(expense => 
      new Date(expense.created_at).getMonth() + 1 === currentMonth
    ).reduce((sum, expense) => sum + expense.amount, 0);
    
    // 健康评分（示例计算）
    const healthRecords = await healthRecordApi.getAll();
    stats.value.healthScore = healthRecords.length > 0 ? Math.min(100, Math.floor(healthRecords.length * 10)) : 0;
    
    // 今日进度（示例计算）
    stats.value.progress = Math.min(100, Math.floor(stats.value.tasks * 20));
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
};

// 加载今日任务
const loadTodayTasks = async () => {
  try {
    const tasks = await taskApi.getAll();
    const today = new Date().toISOString().split('T')[0];
    todayTasks.value = tasks.filter(task => 
      task.due_date?.startsWith(today)
    ).slice(0, 5); // 只显示前5个任务
  } catch (error) {
    console.error('Failed to load today tasks:', error);
  }
};

// 加载数据洞察
const loadInsights = async () => {
  try {
    // 任务完成率
    const tasks = await taskApi.getAll();
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    insights.value.taskCompletionRate = tasks.length > 0 ? Math.floor((completedTasks / tasks.length) * 100) : 0;
    
    // 本周运动（示例计算）
    const healthRecords = await healthRecordApi.getAll();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    insights.value.weeklyExercise = healthRecords.filter(record => 
      new Date(record.created_at) >= oneWeekAgo
    ).length;
    
    // 本月笔记
    const currentMonth = new Date().getMonth() + 1;
    const notes = await noteApi.getAll();
    insights.value.monthlyNotes = notes.filter(note => 
      new Date(note.created_at).getMonth() + 1 === currentMonth
    ).length;
    
    // 本月支出和收支差额
    const expenses = await expenseRecordApi.getAll();
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlyExpenses = expenses.filter(expense => 
      new Date(expense.created_at) >= currentMonthStart
    ).reduce((sum, expense) => sum + expense.amount, 0);
    insights.value.monthlyExpenses = monthlyExpenses;
    insights.value.balanceDifference = -monthlyExpenses; // 示例收支差额
  } catch (error) {
    console.error('Failed to load insights:', error);
  }
};

// 添加到最近访问
const addToRecentVisits = (item) => {
  // 检查是否已经存在
  const existingIndex = recentVisits.value.findIndex(v => v.url === item.url);
  if (existingIndex > -1) {
    // 如果存在，移到最前面
    const existingItem = recentVisits.value.splice(existingIndex, 1)[0];
    existingItem.visited_at = new Date().toISOString();
    recentVisits.value.unshift(existingItem);
  } else {
    // 如果不存在，添加到最前面
    recentVisits.value.unshift({
      id: Date.now(),
      title: item.title,
      type: 'page',
      url: item.url,
      icon: item.icon,
      visited_at: new Date().toISOString()
    });
  }
  
  // 限制最近访问数量为10条
  if (recentVisits.value.length > 10) {
    recentVisits.value = recentVisits.value.slice(0, 10);
  }
  
  // 保存到本地存储
  saveData();
};

// 导航到项目
const navigateToItem = (item) => {
  router.push(item.url);
  // 添加到最近访问
  addToRecentVisits(item);
};

// 分类数据
const categories = ref(['all', '工作', '健康', '财务', '学习', '生活']);

// 搜索和过滤
const favoritesSearch = ref('');
const favoritesFilter = ref('all');

// 监听路由变化
onMounted(() => {
  // 初始加载时检查路由参数
  currentSection.value = route.query.section || 'dashboard';
  
  // 监听路由变化
  const unwatch = router.afterEach((to) => {
    currentSection.value = to.query.section || 'dashboard';
  });
  
  return () => {
    unwatch();
  };
});

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

// 从收藏中删除
const removeFromFavorites = (id) => {
  const index = favorites.value.findIndex(item => item.id === id);
  if (index > -1) {
    favorites.value.splice(index, 1);
    // 保存到本地存储
    saveData();
  }
};

// 清除最近访问
const clearRecentVisits = () => {
  recentVisits.value = [];
  // 保存到本地存储
  saveData();
};

// 保存备忘录
const saveMemo = () => {
  if (memoContent.value.trim()) {
    // 可以将备忘录保存到本地存储或发送到服务器
    localStorage.setItem('quickMemo', memoContent.value);
    alert('备忘录已保存');
  }
};

// 清空备忘录
const clearMemo = () => {
  memoContent.value = '';
  localStorage.removeItem('quickMemo');
};

// 加载备忘录
const loadMemo = () => {
  const savedMemo = localStorage.getItem('quickMemo');
  if (savedMemo) {
    memoContent.value = savedMemo;
  }
};

// 初始化加载备忘录
loadMemo();

// 切换内容区域
const switchSection = (section) => {
  router.push({ query: { section } });
  currentSection.value = section;
};

// 快捷操作函数
const quickAddTask = () => {
  router.push('/tasks?action=add');
};

const viewHighPriorityTasks = () => {
  router.push('/tasks?priority=high');
};

const viewTodayTasks = () => {
  router.push('/tasks?filter=today');
};

const scheduleMeeting = () => {
  router.push('/calendar?action=add');
};

const recordExercise = () => {
  router.push('/health?tab=exercise');
};

const recordWeight = () => {
  router.push('/health?tab=weight');
};

const recordSleep = () => {
  router.push('/health?tab=sleep');
};

const recordMeal = () => {
  router.push('/health?tab=meal');
};

const quickNote = () => {
  router.push('/notes?action=create');
};

const recordExpense = () => {
  router.push('/finance?action=add');
};

// 刷新数据
const refreshData = () => {
  loadStats();
  loadTodayTasks();
  loadInsights();
};
</script>