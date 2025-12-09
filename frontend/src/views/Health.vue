<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold">健康管理</h2>
        <p class="text-gray-600 dark:text-gray-400">管理您的健康数据和营养摄入</p>
      </div>
      <button 
        @click="openRecordModal()" 
        class="btn-primary flex items-center space-x-2"
      >
        <i class="fa fa-plus" aria-hidden="true"></i>
        <span>新建记录</span>
      </button>
    </div>

    <!-- 健康管理标签页 -->
    <div class="mb-6">
      <div class="flex border-b border-gray-200 dark:border-gray-700">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="[
            'py-3 px-4 font-medium text-sm transition-colors',
            activeTab === tab.value 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 仪表板页面 -->
    <div v-if="activeTab === 'dashboard'" class="space-y-6">
      <!-- 用户信息和日期选择器 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="flex items-center space-x-4 mb-4 md:mb-0">
            <div class="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
              JD
            </div>
            <div>
              <h3 class="text-xl font-bold">早上好，John Doe</h3>
              <p class="text-gray-500 dark:text-gray-400">{{ currentDate }}</p>
            </div>
          </div>
          <div>
            <input 
              type="date" 
              v-model="selectedDate" 
              class="input-field"
            >
          </div>
        </div>
      </div>

      <!-- 热量摄入/消耗进度指示器 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
          <h3 class="font-bold text-lg mb-4">今日热量摄入</h3>
          <div class="flex items-center justify-center">
            <div class="relative w-40 h-40">
              <!-- 圆形进度指示器 -->
              <svg class="w-40 h-40 transform -rotate-90">
                <circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  fill="none" 
                  stroke="#E5E7EB" 
                  stroke-width="20"
                ></circle>
                <circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  fill="none" 
                  stroke="#3B82F6" 
                  stroke-width="20"
                  :stroke-dasharray="440" 
                  :stroke-dashoffset="440 - (440 * dailyCalories.consumed / dailyCalories.goal)"
                  stroke-linecap="round"
                ></circle>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center flex-col">
                <span class="text-3xl font-bold">{{ dailyCalories.consumed }}</span>
                <span class="text-sm text-gray-500 dark:text-gray-400">/ {{ dailyCalories.goal }} 卡路里</span>
              </div>
            </div>
          </div>
          <div class="mt-4 text-center">
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                class="bg-primary h-2.5 rounded-full" 
                :style="{ width: `${(dailyCalories.consumed / dailyCalories.goal) * 100}%` }"
              ></div>
            </div>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              目标：{{ dailyCalories.goal }} 卡路里
            </p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
          <h3 class="font-bold text-lg mb-4">今日热量消耗</h3>
          <div class="flex items-center justify-center">
            <div class="relative w-40 h-40">
              <!-- 圆形进度指示器 -->
              <svg class="w-40 h-40 transform -rotate-90">
                <circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  fill="none" 
                  stroke="#E5E7EB" 
                  stroke-width="20"
                ></circle>
                <circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  fill="none" 
                  stroke="#10B981" 
                  stroke-width="20"
                  :stroke-dasharray="440" 
                  :stroke-dashoffset="440 - (440 * dailyCalories.burned / dailyCalories.goal)"
                  stroke-linecap="round"
                ></circle>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center flex-col">
                <span class="text-3xl font-bold">{{ dailyCalories.burned }}</span>
                <span class="text-sm text-gray-500 dark:text-gray-400">/ {{ dailyCalories.goal }} 卡路里</span>
              </div>
            </div>
          </div>
          <div class="mt-4 text-center">
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                class="bg-secondary h-2.5 rounded-full" 
                :style="{ width: `${(dailyCalories.burned / dailyCalories.goal) * 100}%` }"
              ></div>
            </div>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              目标：{{ dailyCalories.goal }} 卡路里
            </p>
          </div>
        </div>
      </div>

      <!-- 宏量营养素卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">碳水化合物</p>
              <h3 class="text-2xl font-bold">{{ macros.carbs }}g</h3>
              <p class="text-sm text-green-500 mt-1">目标：{{ macros.goalCarbs }}g</p>
            </div>
            <div class="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-primary">
              <i class="fa fa-bread-slice text-xl"></i>
            </div>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              class="bg-blue-500 h-2 rounded-full" 
              :style="{ width: `${(macros.carbs / macros.goalCarbs) * 100}%` }"
            ></div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">蛋白质</p>
              <h3 class="text-2xl font-bold">{{ macros.protein }}g</h3>
              <p class="text-sm text-green-500 mt-1">目标：{{ macros.goalProtein }}g</p>
            </div>
            <div class="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-500">
              <i class="fa fa-drumstick-bite text-xl"></i>
            </div>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              class="bg-red-500 h-2 rounded-full" 
              :style="{ width: `${(macros.protein / macros.goalProtein) * 100}%` }"
            ></div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">脂肪</p>
              <h3 class="text-2xl font-bold">{{ macros.fat }}g</h3>
              <p class="text-sm text-green-500 mt-1">目标：{{ macros.goalFat }}g</p>
            </div>
            <div class="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-500">
              <i class="fa fa-oil-can text-xl"></i>
            </div>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              class="bg-yellow-500 h-2 rounded-full" 
              :style="{ width: `${(macros.fat / macros.goalFat) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 今日餐食记录 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-lg">今日餐食记录</h3>
          <button 
            @click="showFoodSearch = true"
            class="text-primary text-sm hover:underline"
          >
            <i class="fa fa-plus mr-1" aria-hidden="true"></i>
            添加食物
          </button>
        </div>
        
        <!-- 餐食分类标签 -->
        <div class="flex space-x-2 mb-4 overflow-x-auto scrollbar-hide">
          <button 
            v-for="mealType in mealTypes" 
            :key="mealType.value"
            @click="activeMealType = mealType.value"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
              activeMealType === mealType.value 
                ? 'bg-primary bg-opacity-10 text-primary' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            {{ mealType.label }}
          </button>
        </div>

        <!-- 餐食列表 -->
        <div class="space-y-4">
          <div 
            v-for="food in filteredMeals" 
            :key="food.id"
            class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-750 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <i class="fa fa-utensils text-gray-500"></i>
              </div>
              <div>
                <h4 class="font-medium">{{ food.food_name }}</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ food.serving_size }}g - {{ food.calories }} 卡路里</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <span class="text-sm font-medium">{{ food.calories }} kcal</span>
              <button 
                @click="removeFoodFromMeal(food.id)"
                class="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                title="删除"
              >
                <i class="fa fa-trash text-lg"></i>
              </button>
            </div>
          </div>
          
          <div v-if="filteredMeals.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <i class="fa fa-utensils text-4xl mb-2"></i>
            <p>暂无餐食记录</p>
            <button 
              @click="showFoodSearch = true"
              class="mt-4 text-primary hover:underline"
            >
              添加食物
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 食物搜索和记录系统 -->
    <div v-if="activeTab === 'nutrition'" class="space-y-6">
      <!-- 食物搜索 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
        <h3 class="font-bold text-lg mb-4">食物搜索</h3>
        <div class="relative mb-6">
          <input 
            type="text" 
            placeholder="搜索食物..." 
            v-model="searchQuery" 
            class="input-field pl-10"
            @input="searchFood"
          >
          <i class="fa fa-search absolute left-3 top-3 text-gray-400"></i>
        </div>

        <!-- 食物分类筛选 -->
        <div class="flex flex-wrap gap-2 mb-6">
          <button 
            v-for="category in foodCategories" 
            :key="category.value"
            @click="toggleCategory(category.value)"
            :class="[
              'px-3 py-1 text-sm rounded-full transition-colors',
              selectedCategories.includes(category.value) 
                ? 'bg-primary bg-opacity-10 text-primary' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            {{ category.label }}
          </button>
        </div>

        <!-- 搜索结果 -->
        <div class="space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide">
          <div 
            v-for="food in searchResults" 
            :key="food.id"
            class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
            @click="selectFood(food)"
          >
            <div class="flex justify-between items-start">
              <h4 class="font-medium">{{ food.name }}</h4>
              <span class="text-sm font-medium">{{ food.calories }} kcal/100g</span>
            </div>
            <div class="flex space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span><i class="fa fa-bread-slice mr-1"></i>{{ food.carbs }}g 碳水</span>
              <span><i class="fa fa-drumstick-bite mr-1"></i>{{ food.protein }}g 蛋白质</span>
              <span><i class="fa fa-oil-can mr-1"></i>{{ food.fat }}g 脂肪</span>
            </div>
            <div class="mt-2 text-xs text-gray-400 dark:text-gray-500">
              {{ food.category }}
            </div>
          </div>
          
          <div v-if="searchQuery && searchResults.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <i class="fa fa-search text-4xl mb-2"></i>
            <p>未找到匹配的食物</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 健康记录列表 -->
    <div v-if="activeTab === 'health'" class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 card-transition hover:shadow-card-hover">
      <h2 class="text-lg font-semibold mb-4">健康记录</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">类型</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">数值</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">单位</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">日期</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in healthRecords" :key="record.id" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
              <td class="py-2 px-4">{{ record.type }}</td>
              <td class="py-2 px-4 font-medium">{{ record.value }}</td>
              <td class="py-2 px-4">{{ record.unit }}</td>
              <td class="py-2 px-4">{{ record.date }}</td>
              <td class="py-2 px-4">
                <div class="flex gap-2">
                  <button 
                    @click="openRecordModal(record, 'health')"
                    class="text-primary hover:text-primary-dark"
                  >
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button 
                    @click="deleteRecord(record.id, 'health')"
                    class="text-red-500 hover:text-red-700"
                  >
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 运动记录列表 -->
    <div v-if="activeTab === 'exercise'" class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 card-transition hover:shadow-card-hover">
      <h2 class="text-lg font-semibold mb-4">运动记录</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">类型</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">时长 (分钟)</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">强度</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">消耗卡路里</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">日期</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in exerciseRecords" :key="record.id" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
              <td class="py-2 px-4">{{ record.type }}</td>
              <td class="py-2 px-4 font-medium">{{ record.duration }}</td>
              <td class="py-2 px-4">{{ record.intensity }}</td>
              <td class="py-2 px-4">{{ record.calories_burned || '-' }}</td>
              <td class="py-2 px-4">{{ record.date }}</td>
              <td class="py-2 px-4">
                <div class="flex gap-2">
                  <button 
                    @click="openRecordModal(record, 'exercise')"
                    class="text-primary hover:text-primary-dark"
                  >
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button 
                    @click="deleteRecord(record.id, 'exercise')"
                    class="text-red-500 hover:text-red-700"
                  >
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 睡眠记录列表 -->
    <div v-if="activeTab === 'sleep'" class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 card-transition hover:shadow-card-hover">
      <h2 class="text-lg font-semibold mb-4">睡眠记录</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">入睡时间</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">起床时间</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">时长 (小时)</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">质量</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">日期</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in sleepRecords" :key="record.id" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
              <td class="py-2 px-4">{{ record.bedtime }}</td>
              <td class="py-2 px-4">{{ record.wakeup_time }}</td>
              <td class="py-2 px-4 font-medium">{{ (record.duration / 60).toFixed(1) }}</td>
              <td class="py-2 px-4">{{ record.quality }}</td>
              <td class="py-2 px-4">{{ record.date }}</td>
              <td class="py-2 px-4">
                <div class="flex gap-2">
                  <button 
                    @click="openRecordModal(record, 'sleep')"
                    class="text-primary hover:text-primary-dark"
                  >
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button 
                    @click="deleteRecord(record.id, 'sleep')"
                    class="text-red-500 hover:text-red-700"
                  >
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 进度追踪页面 -->
    <div v-if="activeTab === 'progress'" class="space-y-6">
      <!-- 整体进度卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">整体进度</p>
              <h3 class="text-2xl font-bold mt-1">{{ progress.overall }}%</h3>
              <p class="text-sm text-green-500 mt-1">目标完成度</p>
            </div>
            <div class="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-secondary">
              <i class="fa fa-trophy text-xl"></i>
            </div>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
            <div 
              class="bg-green-500 h-2 rounded-full" 
              :style="{ width: `${progress.overall}%` }"
            ></div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">连续打卡</p>
              <h3 class="text-2xl font-bold mt-1">{{ progress.streak }}天</h3>
              <p class="text-sm text-blue-500 mt-1">保持良好！</p>
            </div>
            <div class="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-primary">
              <i class="fa fa-fire text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">本周目标</p>
              <h3 class="text-2xl font-bold mt-1">{{ progress.weeklyGoals }}/5</h3>
              <p class="text-sm text-yellow-500 mt-1">已完成</p>
            </div>
            <div class="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-500">
              <i class="fa fa-bullseye text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 营养和健身指标 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
          <h3 class="font-bold text-lg mb-4">营养指标</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">日均热量摄入</p>
                <h4 class="font-medium">{{ progress.avgCalories }} kcal</h4>
              </div>
              <div class="text-sm text-green-500">-5% vs 上周</div>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">蛋白质摄入</p>
                <h4 class="font-medium">{{ progress.avgProtein }}g</h4>
              </div>
              <div class="text-sm text-green-500">+10% vs 上周</div>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">碳水化合物摄入</p>
                <h4 class="font-medium">{{ progress.avgCarbs }}g</h4>
              </div>
              <div class="text-sm text-red-500">+3% vs 上周</div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
          <h3 class="font-bold text-lg mb-4">健身指标</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">日均步数</p>
                <h4 class="font-medium">{{ progress.avgSteps }}</h4>
              </div>
              <div class="text-sm text-green-500">+8% vs 上周</div>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">每周运动时长</p>
                <h4 class="font-medium">{{ progress.weeklyExercise }}分钟</h4>
              </div>
              <div class="text-sm text-green-500">+15% vs 上周</div>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">平均睡眠时长</p>
                <h4 class="font-medium">{{ progress.avgSleep }}小时</h4>
              </div>
              <div class="text-sm text-red-500">-2% vs 上周</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 健康数据图表 -->
    <div v-if="activeTab === 'analytics'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
        <h2 class="text-lg font-semibold mb-4">步数趋势</h2>
        <div class="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
          <i class="fa fa-bar-chart text-4xl text-gray-400"></i>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
        <h2 class="text-lg font-semibold mb-4">睡眠质量</h2>
        <div class="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
          <i class="fa fa-line-chart text-4xl text-gray-400"></i>
        </div>
      </div>
    </div>

    <!-- 食物搜索模态框 -->
    <div v-if="showFoodSearch" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold">添加食物</h2>
          <button 
            @click="showFoodSearch = false"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <i class="fa fa-times text-xl"></i>
          </button>
        </div>
        <div class="p-6">
          <!-- 食物搜索 -->
          <div class="relative mb-6">
            <input 
              type="text" 
              placeholder="搜索食物..." 
              v-model="searchQuery" 
              class="input-field pl-10"
              @input="searchFood"
            >
            <i class="fa fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>

          <!-- 食物分类筛选 -->
          <div class="flex flex-wrap gap-2 mb-6">
            <button 
              v-for="category in foodCategories" 
              :key="category.value"
              @click="toggleCategory(category.value)"
              :class="[
                'px-3 py-1 text-sm rounded-full transition-colors',
                selectedCategories.includes(category.value) 
                  ? 'bg-primary bg-opacity-10 text-primary' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              {{ category.label }}
            </button>
          </div>

          <!-- 搜索结果 -->
          <div class="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
            <div 
              v-for="food in searchResults" 
              :key="food.id"
              class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
              @click="selectFood(food)"
            >
              <div class="flex justify-between items-start">
                <h4 class="font-medium">{{ food.name }}</h4>
                <span class="text-sm font-medium">{{ food.calories }} kcal/100g</span>
              </div>
              <div class="flex space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span><i class="fa fa-bread-slice mr-1"></i>{{ food.carbs }}g 碳水</span>
                <span><i class="fa fa-drumstick-bite mr-1"></i>{{ food.protein }}g 蛋白质</span>
                <span><i class="fa fa-oil-can mr-1"></i>{{ food.fat }}g 脂肪</span>
              </div>
              <div class="mt-2 text-xs text-gray-400 dark:text-gray-500">
                {{ food.category }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 食物详情模态框 -->
    <div v-if="showFoodDetails" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold">{{ selectedFood.name }}</h2>
          <button 
            @click="showFoodDetails = false"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <i class="fa fa-times text-xl"></i>
          </button>
        </div>
        <div class="p-6">
          <!-- 食物图片 -->
          <div class="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-6">
            <i class="fa fa-utensils text-6xl text-gray-400"></i>
          </div>

          <!-- 营养成分 -->
          <div class="space-y-4 mb-6">
            <div class="flex justify-between items-center">
              <span class="text-gray-500 dark:text-gray-400">热量</span>
              <span class="font-medium">{{ selectedFood.calories }} kcal/100g</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 dark:text-gray-400">碳水化合物</span>
              <span class="font-medium">{{ selectedFood.carbs }}g</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 dark:text-gray-400">蛋白质</span>
              <span class="font-medium">{{ selectedFood.protein }}g</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 dark:text-gray-400">脂肪</span>
              <span class="font-medium">{{ selectedFood.fat }}g</span>
            </div>
          </div>

          <!-- 份量选择 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">份量 (克)</label>
            <div class="flex items-center space-x-3">
              <button 
                @click="servingSize = Math.max(10, servingSize - 10)"
                class="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <i class="fa fa-minus"></i>
              </button>
              <input 
                type="number" 
                v-model.number="servingSize" 
                min="10" 
                step="10"
                class="input-field w-24 text-center"
              >
              <button 
                @click="servingSize += 10"
                class="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <i class="fa fa-plus"></i>
              </button>
            </div>
          </div>

          <!-- 计算后的营养成分 -->
          <div class="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 mb-6">
            <h4 class="font-medium mb-3">{{ servingSize }}克的营养成分</h4>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500 dark:text-gray-400">热量</span>
                <span class="font-medium">{{ calculateNutrition(selectedFood.calories) }} kcal</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500 dark:text-gray-400">碳水化合物</span>
                <span class="font-medium">{{ calculateNutrition(selectedFood.carbs) }}g</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500 dark:text-gray-400">蛋白质</span>
                <span class="font-medium">{{ calculateNutrition(selectedFood.protein) }}g</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500 dark:text-gray-400">脂肪</span>
                <span class="font-medium">{{ calculateNutrition(selectedFood.fat) }}g</span>
              </div>
            </div>
          </div>

          <!-- 餐食类型选择 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">餐食类型</label>
            <select 
              v-model="selectedMealType" 
              class="input-field"
            >
              <option v-for="mealType in mealTypes" :key="mealType.value" :value="mealType.value">
                {{ mealType.label }}
              </option>
            </select>
          </div>

          <!-- 按钮组 -->
          <div class="flex space-x-3">
            <button 
              @click="showFoodDetails = false"
              class="btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <i class="fa fa-times" aria-hidden="true"></i>
              <span>取消</span>
            </button>
            <button 
              @click="addToMeal()"
              class="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <i class="fa fa-plus" aria-hidden="true"></i>
              <span>添加到餐食</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 记录模态框 -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold">{{ editingRecord.id ? '编辑记录' : '新建记录' }}</h2>
          <button 
            @click="closeRecordModal()"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <i class="fa fa-times text-xl"></i>
          </button>
        </div>
        <div class="p-6">
          <!-- 记录类型选择 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">记录类型</label>
            <select 
              v-model="recordType" 
              class="input-field"
              @change="resetEditingRecord"
            >
              <option value="health">健康记录</option>
              <option value="exercise">运动记录</option>
              <option value="sleep">睡眠记录</option>
            </select>
          </div>

          <!-- 健康记录表单 -->
          <template v-if="recordType === 'health'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">健康指标</label>
                <input 
                  v-model="editingRecord.type" 
                  type="text" 
                  class="input-field"
                  placeholder="如：体重、血压、心率等"
                >
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">数值</label>
                <input 
                  v-model.number="editingRecord.value" 
                  type="number" 
                  step="0.1"
                  class="input-field"
                  placeholder="数值"
                >
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">单位</label>
                <input 
                  v-model="editingRecord.unit" 
                  type="text" 
                  class="input-field"
                  placeholder="如：kg、mmHg、bpm等"
                >
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input 
                  v-model="editingRecord.date" 
                  type="date" 
                  class="input-field"
                >
              </div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <textarea 
                v-model="editingRecord.notes" 
                rows="3" 
                class="input-field"
                placeholder="备注信息"
              ></textarea>
            </div>
          </template>

          <!-- 运动记录表单 -->
          <template v-else-if="recordType === 'exercise'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">运动类型</label>
                <input 
                  v-model="editingRecord.type" 
                  type="text" 
                  class="input-field"
                  placeholder="如：跑步、游泳、健身等"
                >
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">时长 (分钟)</label>
                <input 
                  v-model.number="editingRecord.duration" 
                  type="number" 
                  class="input-field"
                  placeholder="时长"
                >
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">强度</label>
                <select 
                  v-model="editingRecord.intensity" 
                  class="input-field"
                >
                  <option value="low">低强度</option>
                  <option value="moderate">中等强度</option>
                  <option value="high">高强度</option>
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">消耗卡路里</label>
                <input 
                  v-model.number="editingRecord.calories_burned" 
                  type="number" 
                  class="input-field"
                  placeholder="卡路里"
                >
              </div>
              <div class="mb-4 md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input 
                  v-model="editingRecord.date" 
                  type="date" 
                  class="input-field"
                >
              </div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <textarea 
                v-model="editingRecord.notes" 
                rows="3" 
                class="input-field"
                placeholder="备注信息"
              ></textarea>
            </div>
          </template>

          <!-- 睡眠记录表单 -->
          <template v-else-if="recordType === 'sleep'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">入睡时间</label>
                <input 
                  v-model="editingRecord.bedtime" 
                  type="time" 
                  class="input-field"
                >
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">起床时间</label>
                <input 
                  v-model="editingRecord.wakeup_time" 
                  type="time" 
                  class="input-field"
                >
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">睡眠质量</label>
                <select 
                  v-model="editingRecord.quality" 
                  class="input-field"
                >
                  <option value="excellent">优秀</option>
                  <option value="good">良好</option>
                  <option value="fair">一般</option>
                  <option value="poor">较差</option>
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input 
                  v-model="editingRecord.date" 
                  type="date" 
                  class="input-field"
                >
              </div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <textarea 
                v-model="editingRecord.notes" 
                rows="3" 
                class="input-field"
                placeholder="备注信息"
              ></textarea>
            </div>
          </template>
        </div>
        <div class="p-6 border-t flex justify-end gap-3">
          <button 
            @click="closeRecordModal()"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button 
            @click="saveRecord()"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            {{ editingRecord.id ? '更新' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { healthRecordApi, exerciseRecordApi, sleepRecordApi, foodApi, mealRecordApi } from '../services/api';

export default {
  name: 'Health',
  setup() {
    const activeTab = ref('dashboard');
    const recordType = ref('health');
    const showModal = ref(false);
    const healthRecords = ref([]);
    const exerciseRecords = ref([]);
    const sleepRecords = ref([]);
    const editingRecord = ref({
      id: null,
      type: '',
      value: null,
      unit: '',
      duration: null,
      intensity: 'moderate',
      calories_burned: null,
      bedtime: '',
      wakeup_time: '',
      quality: 'good',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });

    // 新添加的状态变量
    const currentDate = ref(new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }));
    const selectedDate = ref(new Date().toISOString().split('T')[0]);
    const dailyCalories = ref({ consumed: 0, burned: 0, goal: 1200 });
    const macros = ref({ carbs: 0, protein: 0, fat: 0, goalCarbs: 150, goalProtein: 80, goalFat: 35 });
    const progress = ref({ 
      overall: 0, 
      streak: 0, 
      weeklyGoals: 0, 
      avgCalories: 0, 
      avgProtein: 0, 
      avgCarbs: 0, 
      avgSteps: 0, 
      weeklyExercise: 0, 
      avgSleep: 0 
    });
    
    // 计算每日营养摄入
    const calculateDailyNutrition = () => {
      // 从餐食记录中计算热量和宏量营养素
      let consumed = 0;
      let carbs = 0;
      let protein = 0;
      let fat = 0;
      
      mealRecords.value.forEach(meal => {
        consumed += meal.calories || 0;
        carbs += meal.carbs || 0;
        protein += meal.protein || 0;
        fat += meal.fat || 0;
      });
      
      dailyCalories.value.consumed = consumed;
      macros.value.carbs = Math.round(carbs);
      macros.value.protein = Math.round(protein);
      macros.value.fat = Math.round(fat);
    };

    // 食物搜索相关
    const searchQuery = ref('');
    const selectedCategories = ref([]);
    const searchResults = ref([]);
    const showFoodSearch = ref(false);
    const showFoodDetails = ref(false);
    const selectedFood = ref({});
    const servingSize = ref(100);
    const selectedMealType = ref('breakfast');
    const activeMealType = ref('breakfast');
    const mealRecords = ref([]);
    const foodDatabase = ref([]);

    // 标签页配置
    const tabs = [
      { label: '仪表板', value: 'dashboard' },
      { label: '营养管理', value: 'nutrition' },
      { label: '健康记录', value: 'health' },
      { label: '运动记录', value: 'exercise' },
      { label: '睡眠记录', value: 'sleep' },
      { label: '进度追踪', value: 'progress' },
      { label: '数据分析', value: 'analytics' }
    ];

    // 餐食类型
    const mealTypes = [
      { label: '早餐', value: 'breakfast' },
      { label: '午餐', value: 'lunch' },
      { label: '晚餐', value: 'dinner' },
      { label: '零食', value: 'snack' }
    ];

    // 食物分类
    const foodCategories = [
      { label: '全部', value: 'all' },
      { label: '谷物', value: 'grains' },
      { label: '蔬菜', value: 'vegetables' },
      { label: '水果', value: 'fruits' },
      { label: '肉类', value: 'meat' },
      { label: '鱼类', value: 'fish' },
      { label: '乳制品', value: 'dairy' },
      { label: '坚果', value: 'nuts' },
      { label: '油脂', value: 'oils' },
      { label: '饮料', value: 'beverages' }
    ];

    // 过滤后的餐食记录
    const filteredMeals = computed(() => {
      return mealRecords.value.filter(meal => meal.meal_type === activeMealType.value);
    });

    // 获取所有健康记录
    const fetchHealthRecords = async () => {
      try {
        const data = await healthRecordApi.getAll();
        healthRecords.value = data;
      } catch (error) {
        console.error('Failed to fetch health records:', error);
      }
    };

    // 获取所有运动记录
    const fetchExerciseRecords = async () => {
      try {
        const data = await exerciseRecordApi.getAll();
        exerciseRecords.value = data;
      } catch (error) {
        console.error('Failed to fetch exercise records:', error);
      }
    };

    // 获取所有睡眠记录
    const fetchSleepRecords = async () => {
      try {
        const data = await sleepRecordApi.getAll();
        sleepRecords.value = data;
      } catch (error) {
        console.error('Failed to fetch sleep records:', error);
      }
    };

    // 获取所有食物
    const fetchFoods = async () => {
      try {
        const data = await foodApi.getAll();
        foodDatabase.value = data;
        // 如果数据库为空，初始化一些默认食物
        if (data.length === 0) {
          const defaultFoods = [
            { id: 1, name: '米饭', category: 'grains', calories: 116, carbs: 25.6, protein: 2.6, fat: 0.3 },
            { id: 2, name: '面条', category: 'grains', calories: 138, carbs: 25.5, protein: 4.5, fat: 1.7 },
            { id: 3, name: '面包', category: 'grains', calories: 264, carbs: 49.4, protein: 8.8, fat: 3.2 },
            { id: 4, name: '鸡蛋', category: 'meat', calories: 155, carbs: 1.1, protein: 13.0, fat: 11.0 },
            { id: 5, name: '鸡胸肉', category: 'meat', calories: 165, carbs: 0, protein: 31.0, fat: 3.6 },
            { id: 6, name: '牛肉', category: 'meat', calories: 250, carbs: 0, protein: 26.0, fat: 17.0 },
            { id: 7, name: '三文鱼', category: 'fish', calories: 208, carbs: 0, protein: 20.4, fat: 13.4 },
            { id: 8, name: '苹果', category: 'fruits', calories: 52, carbs: 13.8, protein: 0.3, fat: 0.2 },
            { id: 9, name: '香蕉', category: 'fruits', calories: 89, carbs: 22.8, protein: 1.1, fat: 0.3 },
            { id: 10, name: '西兰花', category: 'vegetables', calories: 34, carbs: 6.6, protein: 2.8, fat: 0.4 },
            { id: 11, name: '菠菜', category: 'vegetables', calories: 23, carbs: 3.6, protein: 2.9, fat: 0.4 },
            { id: 12, name: '牛奶', category: 'dairy', calories: 42, carbs: 5.0, protein: 3.2, fat: 1.0 },
            { id: 13, name: '酸奶', category: 'dairy', calories: 59, carbs: 3.6, protein: 3.5, fat: 3.3 },
            { id: 14, name: '杏仁', category: 'nuts', calories: 579, carbs: 21.5, protein: 21.2, fat: 50.6 },
            { id: 15, name: '橄榄油', category: 'oils', calories: 884, carbs: 0, protein: 0, fat: 100 }
          ];
          for (const food of defaultFoods) {
            await foodApi.create(food);
          }
          // 重新获取食物列表
          const updatedData = await foodApi.getAll();
          foodDatabase.value = updatedData;
        }
        searchFood();
      } catch (error) {
        console.error('Failed to fetch foods:', error);
      }
    };

    // 获取所有餐食记录
    const fetchMealRecords = async () => {
      try {
        const data = await mealRecordApi.getAll({ date: selectedDate.value });
        mealRecords.value = data;
        // 计算每日营养摄入
        calculateDailyNutrition();
      } catch (error) {
        console.error('Failed to fetch meal records:', error);
        mealRecords.value = [];
        calculateDailyNutrition();
      }
    };

    // 打开记录模态框
    const openRecordModal = (record = null, type = 'health') => {
      recordType.value = type;
      if (record) {
        editingRecord.value = { ...record };
      } else {
        resetEditingRecord();
      }
      showModal.value = true;
    };

    // 关闭记录模态框
    const closeRecordModal = () => {
      showModal.value = false;
    };

    // 重置编辑记录
    const resetEditingRecord = () => {
      editingRecord.value = {
        id: null,
        type: '',
        value: null,
        unit: '',
        duration: null,
        intensity: 'moderate',
        calories_burned: null,
        bedtime: '',
        wakeup_time: '',
        quality: 'good',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      };
    };

    // 保存记录
    const saveRecord = async () => {
      try {
        // 计算睡眠时长（分钟）
        if (recordType.value === 'sleep' && editingRecord.value.bedtime && editingRecord.value.wakeup_time) {
          const [bedtimeH, bedtimeM] = editingRecord.value.bedtime.split(':').map(Number);
          const [wakeupH, wakeupM] = editingRecord.value.wakeup_time.split(':').map(Number);
          
          let bedtimeTotal = bedtimeH * 60 + bedtimeM;
          let wakeupTotal = wakeupH * 60 + wakeupM;
          
          // 如果起床时间早于入睡时间，说明跨天了
          if (wakeupTotal < bedtimeTotal) {
            wakeupTotal += 24 * 60;
          }
          
          editingRecord.value.duration = wakeupTotal - bedtimeTotal;
        }

        if (editingRecord.value.id) {
          // 更新记录
          if (recordType.value === 'health') {
            await healthRecordApi.update(editingRecord.value.id, editingRecord.value);
            await fetchHealthRecords();
          } else if (recordType.value === 'exercise') {
            await exerciseRecordApi.update(editingRecord.value.id, editingRecord.value);
            await fetchExerciseRecords();
          } else if (recordType.value === 'sleep') {
            await sleepRecordApi.update(editingRecord.value.id, editingRecord.value);
            await fetchSleepRecords();
          }
        } else {
          // 创建记录
          if (recordType.value === 'health') {
            await healthRecordApi.create(editingRecord.value);
            await fetchHealthRecords();
          } else if (recordType.value === 'exercise') {
            await exerciseRecordApi.create(editingRecord.value);
            await fetchExerciseRecords();
          } else if (recordType.value === 'sleep') {
            await sleepRecordApi.create(editingRecord.value);
            await fetchSleepRecords();
          }
        }
        closeRecordModal();
      } catch (error) {
        console.error('Failed to save record:', error);
      }
    };

    // 删除记录
    const deleteRecord = async (id, type) => {
      if (confirm('确定要删除这条记录吗？')) {
        try {
          if (type === 'health') {
            await healthRecordApi.delete(id);
            await fetchHealthRecords();
          } else if (type === 'exercise') {
            await exerciseRecordApi.delete(id);
            await fetchExerciseRecords();
          } else if (type === 'sleep') {
            await sleepRecordApi.delete(id);
            await fetchSleepRecords();
          }
        } catch (error) {
          console.error('Failed to delete record:', error);
        }
      }
    };

    // 食物搜索功能
    const searchFood = () => {
      let results = [...foodDatabase.value];
      
      // 搜索关键词过滤
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        results = results.filter(food => 
          food.name.toLowerCase().includes(query)
        );
      }
      
      // 分类过滤
      if (selectedCategories.value.length > 0 && !selectedCategories.value.includes('all')) {
        results = results.filter(food => 
          selectedCategories.value.includes(food.category)
        );
      }
      
      searchResults.value = results;
    };

    // 切换食物分类
    const toggleCategory = (category) => {
      if (category === 'all') {
        selectedCategories.value = ['all'];
      } else {
        if (selectedCategories.value.includes('all')) {
          selectedCategories.value = [];
        }
        const index = selectedCategories.value.indexOf(category);
        if (index > -1) {
          selectedCategories.value.splice(index, 1);
        } else {
          selectedCategories.value.push(category);
        }
      }
      searchFood();
    };

    // 选择食物
    const selectFood = (food) => {
      selectedFood.value = food;
      servingSize.value = 100;
      showFoodDetails.value = true;
    };

    // 计算营养成分
    const calculateNutrition = (value) => {
      return Math.round((value * servingSize.value) / 100);
    };

    // 添加到餐食
    const addToMeal = async () => {
      try {
        const mealRecord = {
          food_id: selectedFood.value.id,
          food_name: selectedFood.value.name,
          food_category: selectedFood.value.category,
          serving_size: servingSize.value,
          calories: calculateNutrition(selectedFood.value.calories),
          carbs: calculateNutrition(selectedFood.value.carbs),
          protein: calculateNutrition(selectedFood.value.protein),
          fat: calculateNutrition(selectedFood.value.fat),
          meal_type: selectedMealType.value,
          date: selectedDate.value
        };
        
        await mealRecordApi.create(mealRecord);
        await fetchMealRecords();
        showFoodDetails.value = false;
        showFoodSearch.value = false;
      } catch (error) {
        console.error('Failed to add food to meal:', error);
      }
    };

    // 从餐食中移除食物
    const removeFoodFromMeal = async (id) => {
      try {
        await mealRecordApi.delete(id);
        await fetchMealRecords();
      } catch (error) {
        console.error('Failed to remove food from meal:', error);
      }
    };

    onMounted(() => {
      fetchHealthRecords();
      fetchExerciseRecords();
      fetchSleepRecords();
      fetchFoods();
      fetchMealRecords();
    });

    return {
      activeTab,
      recordType,
      showModal,
      healthRecords,
      exerciseRecords,
      sleepRecords,
      editingRecord,
      currentDate,
      selectedDate,
      dailyCalories,
      macros,
      progress,
      searchQuery,
      selectedCategories,
      searchResults,
      showFoodSearch,
      showFoodDetails,
      selectedFood,
      servingSize,
      selectedMealType,
      activeMealType,
      mealRecords,
      filteredMeals,
      tabs,
      mealTypes,
      foodCategories,
      openRecordModal,
      closeRecordModal,
      resetEditingRecord,
      saveRecord,
      deleteRecord,
      searchFood,
      toggleCategory,
      selectFood,
      calculateNutrition,
      addToMeal,
      removeFoodFromMeal
    };
  }
};
</script>

<style scoped>
/* 自定义滚动条样式 */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 卡片过渡效果 */
.card-transition {
  transition: all 0.3s ease;
}

.shadow-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-card-hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>