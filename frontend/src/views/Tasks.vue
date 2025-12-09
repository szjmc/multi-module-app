<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { taskApi } from '../services/api';

const route = useRoute();
const router = useRouter();
const tasks = ref([]);
const filter = ref('all');
const showNewTaskForm = ref(false);

// 获取所有任务
const fetchTasks = async () => {
  try {
    const data = await taskApi.getAll();
    tasks.value = data;
  } catch (error) {
    console.error('获取任务失败:', error);
  }
};

// 更新任务状态
const updateTaskStatus = async (task, newStatus) => {
  try {
    await taskApi.updateStatus(task.id, newStatus);
    task.status = newStatus;
  } catch (error) {
    console.error('更新任务状态失败:', error);
  }
};

// 监听路由变化
watch(() => route.query.filter, (newFilter) => {
  filter.value = newFilter || 'all';
  // 如果是新建任务，滚动到表单位置
  if (route.hash === '#new-task') {
    showNewTaskForm.value = true;
    setTimeout(() => {
      const formElement = document.getElementById('new-task-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }
}, { immediate: true });

// 初始化
onMounted(() => {
  fetchTasks();
});

// 按状态分组任务
const getTasksByStatus = (status) => {
  let filteredTasks = tasks.value;
  
  // 应用过滤条件
  if (filter.value === 'favorite') {
    filteredTasks = filteredTasks.filter(task => task.is_favorite);
  } else if (filter.value === 'recent') {
    filteredTasks = [...filteredTasks]
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 10);
  }
  
  return filteredTasks.filter(task => task.status === status);
};

// 获取过滤后的所有任务
const filteredTasks = computed(() => {
  let result = tasks.value;
  
  // 应用过滤条件
  if (filter.value === 'favorite') {
    result = result.filter(task => task.is_favorite);
  } else if (filter.value === 'recent') {
    result = [...result]
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 10);
  }
  
  return result;
});

// 获取状态名称
const getStatusName = (status) => {
  const statusMap = {
    'pending': '待办',
    'in-progress': '进行中',
    'blocked': '阻塞',
    'completed': '已完成'
  };
  return statusMap[status] || status;
};

// 获取优先级名称
const getPriorityName = (priority) => {
  const priorityMap = {
    'high': '高优先级',
    'medium': '中优先级',
    'low': '低优先级'
  };
  return priorityMap[priority] || priority;
};

// 新建任务表单
const newTask = ref({
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  due_date: '',
  is_favorite: false
});

// 创建任务
const createTask = async () => {
  try {
    await taskApi.create(newTask.value);
    await fetchTasks();
    // 重置表单
    newTask.value = {
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      due_date: '',
      is_favorite: false
    };
    showNewTaskForm.value = false;
  } catch (error) {
    console.error('创建任务失败:', error);
  }
};

// 打开新建任务表单
const openNewTaskForm = () => {
  showNewTaskForm.value = true;
  router.push({ hash: '#new-task' });
  setTimeout(() => {
    const formElement = document.getElementById('new-task-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100);
};
</script>

<template>
  <div id="tasks-page" class="page">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold">任务管理</h2>
        <p class="text-gray-600 dark:text-gray-400">管理和跟踪您的任务</p>
      </div>
      <div>
        <button 
          class="btn-primary"
          @click="openNewTaskForm"
        >
          <i class="fa fa-plus mr-1" aria-hidden="true"></i>
          新建任务
        </button>
      </div>
    </div>
    
    <!-- 新建任务表单 -->
    <div 
      id="new-task-form"
      v-if="showNewTaskForm"
      class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 mb-8 animate-fade-in"
    >
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-lg">新建任务</h3>
        <button 
          @click="showNewTaskForm = false"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <i class="fa fa-times text-lg"></i>
        </button>
      </div>
      <form @submit.prevent="createTask" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">任务标题</label>
            <input 
              v-model="newTask.title" 
              type="text" 
              class="input-field" 
              placeholder="输入任务标题"
              required
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">优先级</label>
            <select v-model="newTask.priority" class="input-field">
              <option value="high">高优先级</option>
              <option value="medium">中优先级</option>
              <option value="low">低优先级</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">任务描述</label>
          <textarea 
            v-model="newTask.description" 
            rows="3" 
            class="input-field" 
            placeholder="输入任务描述"
          ></textarea>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">截止日期</label>
            <input 
              v-model="newTask.due_date" 
              type="date" 
              class="input-field"
            >
          </div>
          <div class="flex items-center align-end">
            <div class="flex items-center mt-4">
              <input 
                v-model="newTask.is_favorite" 
                type="checkbox" 
                id="is-favorite" 
                class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              >
              <label for="is-favorite" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                标记为收藏
              </label>
            </div>
          </div>
        </div>
        <div class="flex justify-end space-x-3 pt-2">
          <button 
            type="button" 
            @click="showNewTaskForm = false"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-750"
          >
            取消
          </button>
          <button 
            type="submit"
            class="btn-primary"
          >
            创建任务
          </button>
        </div>
      </form>
    </div>

    <!-- 任务看板 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 mb-8">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-bold text-lg">任务看板</h3>
        <div class="flex space-x-2">
          <button class="px-3 py-1 text-sm rounded-lg bg-primary bg-opacity-10 text-primary">看板视图</button>
          <button class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">列表视图</button>
        </div>
      </div>

      <!-- 看板列 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 待办列 -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[500px]">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-medium flex items-center">
              <span class="h-3 w-3 rounded-full bg-gray-400 mr-2"></span>
              待办
              <span class="ml-2 bg-gray-200 dark:bg-gray-600 text-xs px-2 py-0.5 rounded-full">{{ getTasksByStatus('pending').length }}</span>
            </h4>
            <button class="text-gray-500 hover:text-primary">
              <i class="fa fa-ellipsis-v" aria-hidden="true"></i>
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="task in getTasksByStatus('pending')" :key="task.id" class="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm cursor-move task-card">
              <div class="flex justify-between items-start">
                <span :class="{
                  'badge badge-priority-high': task.priority === 'high',
                  'badge badge-priority-medium': task.priority === 'medium',
                  'badge badge-priority-low': task.priority === 'low'
                }">{{ getPriorityName(task.priority) }}</span>
                <div class="text-gray-400 text-sm">
                  <i class="fa fa-paperclip mr-1" aria-hidden="true"></i>0
                </div>
              </div>
              <h5 class="font-medium mt-2">{{ task.title }}</h5>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ task.description || '无描述' }}</p>
              <div class="flex items-center justify-between mt-3">
                <div class="flex items-center">
                  <div class="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                    JD
                  </div>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ task.due_date ? new Date(task.due_date).toLocaleDateString() : '无截止日期' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 进行中列 -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[500px]">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-medium flex items-center">
              <span class="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
              进行中
              <span class="ml-2 bg-gray-200 dark:bg-gray-600 text-xs px-2 py-0.5 rounded-full">{{ getTasksByStatus('in-progress').length }}</span>
            </h4>
            <button class="text-gray-500 hover:text-primary">
              <i class="fa fa-ellipsis-v" aria-hidden="true"></i>
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="task in getTasksByStatus('in-progress')" :key="task.id" class="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm cursor-move task-card">
              <div class="flex justify-between items-start">
                <span :class="{
                  'badge badge-priority-high': task.priority === 'high',
                  'badge badge-priority-medium': task.priority === 'medium',
                  'badge badge-priority-low': task.priority === 'low'
                }">{{ getPriorityName(task.priority) }}</span>
                <div class="text-gray-400 text-sm">
                  <i class="fa fa-paperclip mr-1" aria-hidden="true"></i>0
                </div>
              </div>
              <h5 class="font-medium mt-2">{{ task.title }}</h5>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ task.description || '无描述' }}</p>
              <div class="flex items-center justify-between mt-3">
                <div class="flex items-center">
                  <div class="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                    SW
                  </div>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ task.due_date ? new Date(task.due_date).toLocaleDateString() : '无截止日期' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 阻塞列 -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[500px]">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-medium flex items-center">
              <span class="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
              阻塞
              <span class="ml-2 bg-gray-200 dark:bg-gray-600 text-xs px-2 py-0.5 rounded-full">{{ getTasksByStatus('blocked').length }}</span>
            </h4>
            <button class="text-gray-500 hover:text-primary">
              <i class="fa fa-ellipsis-v" aria-hidden="true"></i>
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="task in getTasksByStatus('blocked')" :key="task.id" class="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm cursor-move task-card">
              <div class="flex justify-between items-start">
                <span :class="{
                  'badge badge-priority-high': task.priority === 'high',
                  'badge badge-priority-medium': task.priority === 'medium',
                  'badge badge-priority-low': task.priority === 'low'
                }">{{ getPriorityName(task.priority) }}</span>
                <div class="text-gray-400 text-sm">
                  <i class="fa fa-paperclip mr-1" aria-hidden="true"></i>0
                </div>
              </div>
              <h5 class="font-medium mt-2">{{ task.title }}</h5>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ task.description || '无描述' }}</p>
              <div class="flex items-center justify-between mt-3">
                <div class="flex items-center">
                  <div class="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                    AW
                  </div>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ task.due_date ? new Date(task.due_date).toLocaleDateString() : '无截止日期' }}
                </div>
              </div>
              <div class="mt-2 text-xs bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-600 dark:text-red-400 p-2 rounded">
                <i class="fa fa-exclamation-circle mr-1" aria-hidden="true"></i>
                等待API密钥
              </div>
            </div>
          </div>
        </div>

        <!-- 已完成列 -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[500px]">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-medium flex items-center">
              <span class="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
              已完成
              <span class="ml-2 bg-gray-200 dark:bg-gray-600 text-xs px-2 py-0.5 rounded-full">{{ getTasksByStatus('completed').length }}</span>
            </h4>
            <button class="text-gray-500 hover:text-primary">
              <i class="fa fa-ellipsis-v" aria-hidden="true"></i>
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="task in getTasksByStatus('completed')" :key="task.id" class="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm cursor-move task-card opacity-75">
              <div class="flex justify-between items-start">
                <span class="badge bg-green-100 text-green-800">已完成</span>
              </div>
              <h5 class="font-medium mt-2 line-through">{{ task.title }}</h5>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ task.description || '无描述' }}</p>
              <div class="flex items-center justify-between mt-3">
                <div class="flex items-center">
                  <div class="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                    JD
                  </div>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ task.due_date ? new Date(task.due_date).toLocaleDateString() : '无截止日期' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-bold text-lg">任务列表</h3>
        <div class="flex items-center space-x-4">
          <div class="relative">
            <select class="input-field pr-8 appearance-none bg-white dark:bg-gray-700">
              <option>所有任务</option>
              <option>高优先级</option>
              <option>中优先级</option>
              <option>低优先级</option>
            </select>
            <i class="fa fa-chevron-down absolute right-3 top-3 text-gray-400 pointer-events-none"></i>
          </div>
          <div class="relative">
            <select class="input-field pr-8 appearance-none bg-white dark:bg-gray-700">
              <option>全部状态</option>
              <option>待办</option>
              <option>进行中</option>
              <option>阻塞</option>
              <option>已完成</option>
            </select>
            <i class="fa fa-chevron-down absolute right-3 top-3 text-gray-400 pointer-events-none"></i>
          </div>
          <div class="relative">
            <input type="text" placeholder="搜索任务..." class="input-field pl-10 bg-white dark:bg-gray-700">
            <i class="fa fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">任务名称</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">优先级</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">负责人</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">截止日期</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="task in filteredTasks" :key="task.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <input type="checkbox" class="task-checkbox h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary mr-3" :checked="task.status === 'completed'" @change="updateTaskStatus(task, task.status === 'completed' ? 'pending' : 'completed')">
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ task.title }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ task.description || '无描述' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="{
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200': task.status === 'pending',
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': task.status === 'in-progress',
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': task.status === 'blocked',
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': task.status === 'completed'
                }">{{ getStatusName(task.status) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="{
                  'badge badge-priority-high': task.priority === 'high',
                  'badge badge-priority-medium': task.priority === 'medium',
                  'badge badge-priority-low': task.priority === 'low'
                }">{{ getPriorityName(task.priority) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                    JD
                  </div>
                  <span class="ml-3 text-sm text-gray-900 dark:text-gray-100">John Doe</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ task.due_date ? new Date(task.due_date).toLocaleDateString() : '无截止日期' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <a href="#" class="text-primary hover:text-primary-dark mr-3">编辑</a>
                <a href="#" class="text-red-500 hover:text-red-700">删除</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between mt-6">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          显示 1 - {{ tasks.length }} 条，共 {{ tasks.length }} 条
        </div>
        <div class="flex space-x-2">
          <button class="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
            <i class="fa fa-chevron-left" aria-hidden="true"></i>
          </button>
          <button class="px-3 py-1 rounded-lg bg-primary text-white">1</button>
          <button class="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">2</button>
          <button class="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">3</button>
          <button class="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
            <i class="fa fa-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>