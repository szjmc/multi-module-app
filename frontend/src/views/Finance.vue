<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">财务管理</h1>
      <button 
        @click="openRecordModal()" 
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        新建记录
      </button>
    </div>

    <!-- 财务管理标签页 -->
    <div class="mb-6">
      <div class="flex border-b border-gray-200 dark:border-gray-700">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="[
            'py-3 px-4 font-medium text-sm transition-colors',
            activeTab === tab.value 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 财务概览 -->
    <div v-if="activeTab === 'overview'" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">总收入</p>
            <h3 class="text-2xl font-bold text-green-500">¥{{ totalIncome.toFixed(2) }}</h3>
            <p class="text-sm text-green-500">+15.2% 较上月</p>
          </div>
          <div class="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <i class="fa fa-arrow-up text-green-500 text-xl"></i>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">总支出</p>
            <h3 class="text-2xl font-bold text-red-500">¥{{ totalExpense.toFixed(2) }}</h3>
            <p class="text-sm text-red-500">-8.7% 较上月</p>
          </div>
          <div class="h-12 w-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <i class="fa fa-arrow-down text-red-500 text-xl"></i>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">结余</p>
            <h3 class="text-2xl font-bold text-blue-500">¥{{ balance.toFixed(2) }}</h3>
            <p class="text-sm text-blue-500">+23.9% 较上月</p>
          </div>
          <div class="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <i class="fa fa-balance-scale text-blue-500 text-xl"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 财务数据图表 -->
    <div v-if="activeTab === 'overview'" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 class="text-lg font-semibold mb-4">收支趋势</h2>
        <div class="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
          <i class="fa fa-line-chart text-4xl text-gray-400"></i>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 class="text-lg font-semibold mb-4">支出分类</h2>
        <div class="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
          <i class="fa fa-pie-chart text-4xl text-gray-400"></i>
        </div>
      </div>
    </div>

    <!-- 收入记录列表 -->
    <div v-if="activeTab === 'income'" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 class="text-lg font-semibold mb-4">收入记录</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">金额</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">来源</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">分类</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">日期</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in incomeRecords" :key="record.id" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
              <td class="py-2 px-4 font-medium text-green-500">¥{{ record.amount.toFixed(2) }}</td>
              <td class="py-2 px-4">{{ record.source }}</td>
              <td class="py-2 px-4">{{ record.category }}</td>
              <td class="py-2 px-4">{{ record.date }}</td>
              <td class="py-2 px-4">
                <div class="flex gap-2">
                  <button 
                    @click="openRecordModal(record, 'income')"
                    class="text-blue-500 hover:text-blue-700"
                  >
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button 
                    @click="deleteRecord(record.id, 'income')"
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

    <!-- 支出记录列表 -->
    <div v-if="activeTab === 'expense'" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 class="text-lg font-semibold mb-4">支出记录</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">金额</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">分类</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">描述</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">支付方式</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">日期</th>
              <th class="py-2 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in expenseRecords" :key="record.id" class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
              <td class="py-2 px-4 font-medium text-red-500">¥{{ record.amount.toFixed(2) }}</td>
              <td class="py-2 px-4">{{ record.category }}</td>
              <td class="py-2 px-4">{{ record.description }}</td>
              <td class="py-2 px-4">{{ record.payment_method }}</td>
              <td class="py-2 px-4">{{ record.date }}</td>
              <td class="py-2 px-4">
                <div class="flex gap-2">
                  <button 
                    @click="openRecordModal(record, 'expense')"
                    class="text-blue-500 hover:text-blue-700"
                  >
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button 
                    @click="deleteRecord(record.id, 'expense')"
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

    <!-- 记录模态框 -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold">{{ editingRecord.id ? '编辑记录' : '新建记录' }}</h2>
          <button 
            @click="closeRecordModal()"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-6">
          <!-- 记录类型选择 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">记录类型</label>
            <select 
              v-model="recordType" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="resetEditingRecord"
            >
              <option value="income">收入</option>
              <option value="expense">支出</option>
            </select>
          </div>

          <!-- 收入记录表单 -->
          <template v-if="recordType === 'income'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">金额</label>
                <input 
                  v-model.number="editingRecord.amount" 
                  type="number" 
                  step="0.01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="金额"
                >
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">来源</label>
                <input 
                  v-model="editingRecord.source" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="收入来源"
                >
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <input 
                  v-model="editingRecord.category" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="收入分类"
                >
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input 
                  v-model="editingRecord.date" 
                  type="date" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <textarea 
                v-model="editingRecord.notes" 
                rows="3" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="备注信息"
              ></textarea>
            </div>
          </template>

          <!-- 支出记录表单 -->
          <template v-else-if="recordType === 'expense'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">金额</label>
                <input 
                  v-model.number="editingRecord.amount" 
                  type="number" 
                  step="0.01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="金额"
                >
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <input 
                  v-model="editingRecord.category" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="支出分类"
                >
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <input 
                  v-model="editingRecord.description" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="支出描述"
                >
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">支付方式</label>
                <select 
                  v-model="editingRecord.payment_method" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">现金</option>
                  <option value="wechat">微信支付</option>
                  <option value="alipay">支付宝</option>
                  <option value="credit_card">信用卡</option>
                  <option value="debit_card">借记卡</option>
                </select>
              </div>
              <div class="mb-4 md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input 
                  v-model="editingRecord.date" 
                  type="date" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <textarea 
                v-model="editingRecord.notes" 
                rows="3" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
import { incomeRecordApi, expenseRecordApi } from '../services/api';

export default {
  name: 'Finance',
  setup() {
    const activeTab = ref('overview');
    const recordType = ref('income');
    const showModal = ref(false);
    const incomeRecords = ref([]);
    const expenseRecords = ref([]);
    const editingRecord = ref({
      id: null,
      amount: null,
      source: '',
      category: '',
      description: '',
      payment_method: 'cash',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });

    const tabs = [
      { label: '概览', value: 'overview' },
      { label: '收入记录', value: 'income' },
      { label: '支出记录', value: 'expense' },
      { label: '数据分析', value: 'analytics' }
    ];

    // 计算总收入
    const totalIncome = computed(() => {
      return incomeRecords.value.reduce((sum, record) => sum + record.amount, 0);
    });

    // 计算总支出
    const totalExpense = computed(() => {
      return expenseRecords.value.reduce((sum, record) => sum + record.amount, 0);
    });

    // 计算结余
    const balance = computed(() => {
      return totalIncome.value - totalExpense.value;
    });

    // 获取所有收入记录
    const fetchIncomeRecords = async () => {
      try {
        const data = await incomeRecordApi.getAll();
        incomeRecords.value = data;
      } catch (error) {
        console.error('Failed to fetch income records:', error);
      }
    };

    // 获取所有支出记录
    const fetchExpenseRecords = async () => {
      try {
        const data = await expenseRecordApi.getAll();
        expenseRecords.value = data;
      } catch (error) {
        console.error('Failed to fetch expense records:', error);
      }
    };

    // 打开记录模态框
    const openRecordModal = (record = null, type = 'income') => {
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
        amount: null,
        source: '',
        category: '',
        description: '',
        payment_method: 'cash',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      };
    };

    // 保存记录
    const saveRecord = async () => {
      try {
        if (editingRecord.value.id) {
          // 更新记录
          if (recordType.value === 'income') {
            await incomeRecordApi.update(editingRecord.value.id, editingRecord.value);
            await fetchIncomeRecords();
          } else if (recordType.value === 'expense') {
            await expenseRecordApi.update(editingRecord.value.id, editingRecord.value);
            await fetchExpenseRecords();
          }
        } else {
          // 创建记录
          if (recordType.value === 'income') {
            await incomeRecordApi.create(editingRecord.value);
            await fetchIncomeRecords();
          } else if (recordType.value === 'expense') {
            await expenseRecordApi.create(editingRecord.value);
            await fetchExpenseRecords();
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
          if (type === 'income') {
            await incomeRecordApi.delete(id);
            await fetchIncomeRecords();
          } else if (type === 'expense') {
            await expenseRecordApi.delete(id);
            await fetchExpenseRecords();
          }
        } catch (error) {
          console.error('Failed to delete record:', error);
        }
      }
    };

    // 组件挂载时获取所有记录
    onMounted(() => {
      fetchIncomeRecords();
      fetchExpenseRecords();
    });

    return {
      activeTab,
      recordType,
      showModal,
      incomeRecords,
      expenseRecords,
      editingRecord,
      tabs,
      totalIncome,
      totalExpense,
      balance,
      openRecordModal,
      closeRecordModal,
      saveRecord,
      deleteRecord
    };
  }
};
</script>
