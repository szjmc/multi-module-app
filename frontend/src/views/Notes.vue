<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold">笔记管理</h2>
        <p class="text-gray-600 dark:text-gray-400">创建和组织您的笔记</p>
      </div>
      <button 
        @click="createNewNote()" 
        class="btn-primary flex items-center space-x-2"
      >
        <i class="fa fa-plus" aria-hidden="true"></i>
        <span>新建笔记</span>
      </button>
    </div>

    <!-- 笔记管理主区域 -->
    <div class="flex gap-6">
      <!-- 左侧笔记列表 -->
      <div class="w-[200px] bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 card-transition hover:shadow-card-hover">
        <div class="mb-6">
          <div class="relative">
            <input 
              type="text" 
              placeholder="搜索笔记..." 
              v-model="searchQuery" 
              class="input-field pl-10"
            >
            <i class="fa fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
        </div>

        <!-- 分类标签 -->
        <div class="mb-6">
          <div class="space-y-2">
            <button 
              @click="filterByCategory('all')"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg transition-colors',
                activeCategory === 'all' 
                  ? 'bg-primary bg-opacity-10 text-primary' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <i class="fa fa-file-text-o mr-2"></i>所有笔记
            </button>
            <button 
              @click="filterByCategory('recent')"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg transition-colors',
                activeCategory === 'recent' 
                  ? 'bg-primary bg-opacity-10 text-primary' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <i class="fa fa-clock-o mr-2"></i>最近编辑
            </button>
            <button 
              @click="filterByCategory('archived')"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg transition-colors',
                activeCategory === 'archived' 
                  ? 'bg-primary bg-opacity-10 text-primary' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <i class="fa fa-archive mr-2"></i>已归档
            </button>
            <button 
              @click="filterByCategory('deleted')"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg transition-colors',
                activeCategory === 'deleted' 
                  ? 'bg-primary bg-opacity-10 text-primary' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <i class="fa fa-trash-o mr-2"></i>已删除
            </button>
          </div>
        </div>

        <!-- 标签云 -->
        <div class="mb-6">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">标签</h3>
          <div class="flex flex-wrap gap-2">
            <span 
                v-for="tag in tags" 
                :key="tag.name"
                @click="filterByTag(tag.label)"
                :class="[
                  'px-3 py-1 text-xs rounded-full cursor-pointer hover:opacity-90 transition-all duration-200 transform hover:scale-105',
                  tag.color
                ]"
              >
                {{ tag.label }}
                <span class="ml-1 text-xs opacity-70">({{ tag.count }})</span>
              </span>
          </div>
        </div>

        <!-- 最近笔记 -->
        <div>
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">最近笔记</h3>
          <div class="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto scrollbar-hide">
            <div 
              v-for="note in filteredNotes" 
              :key="note.id"
              @click="selectNote(note)"
              :class="[
                'p-4 rounded-lg cursor-pointer transition-all duration-200 ease-in-out border-l-4',
                selectedNote.id === note.id 
                  ? 'bg-primary bg-opacity-10 text-primary border-primary shadow-sm transform scale-[1.01]' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-750 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
              ]"
            >
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-medium truncate">{{ note.title }}</h3>
                <div class="flex gap-1">
                  <button 
                    @click.stop="toggleFavorite(note)"
                    class="text-gray-400 hover:text-yellow-500 transition-all duration-200 transform hover:scale-110"
                  >
                    <i :class="['fa', note.is_favorite ? 'fa-star' : 'fa-star-o', note.is_favorite ? 'text-yellow-500' : 'text-gray-400']" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{{ note.content.replace(/<[^>]*>/g, '').substring(0, 100) }}{{ note.content.replace(/<[^>]*>/g, '').length > 100 ? '...' : '' }}</p>
              <div class="flex justify-between items-center">
                <p class="text-xs text-gray-400 dark:text-gray-500">{{ formatDate(note.updated_at) }}</p>
                <span 
                  v-if="note.is_archived" 
                  class="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                >
                  已归档
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧笔记编辑器 -->
      <div class="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 card-transition hover:shadow-card-hover">
        <div v-if="selectedNote.id" class="space-y-6">
          <!-- 笔记标题和状态 -->
          <div class="flex justify-between items-center">
            <input 
              v-model="selectedNote.title" 
              type="text" 
              placeholder="笔记标题" 
              class="w-full text-2xl font-bold border-none focus:outline-none bg-transparent"
              @input="saveNote"
            >
            <div class="flex items-center gap-2">
              <span class="text-sm text-green-500">{{ autoSaveStatus }}</span>
              <button 
                @click.stop="toggleFavorite(selectedNote)"
                class="text-gray-400 hover:text-yellow-500 transition-colors"
                title="收藏"
              >
                <i :class="['fa', selectedNote.is_favorite ? 'fa-star' : 'fa-star-o', 'text-yellow-500']" aria-hidden="true"></i>
              </button>
            </div>
          </div>
          
          <!-- 标签管理 -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">标签</h3>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <!-- 已添加的标签 -->
              <span 
                v-for="(tag, index) in selectedNote.tags" 
                :key="index"
                class="inline-flex items-center gap-1 px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-sm"
              >
                {{ tag }}
                <button 
                  @click="removeTag(index)"
                  class="ml-1 text-primary hover:text-primary-dark transition-colors"
                  title="删除标签"
                >
                  <i class="fa fa-times"></i>
                </button>
              </span>
              
              <!-- 标签选择器 -->
              <div class="relative group">
                <input 
                  type="text" 
                  placeholder="添加标签..." 
                  v-model="newTag"
                  @keydown.enter.prevent="addTag"
                  @focus="showTagSelector = true"
                  @blur="handleTagInputBlur"
                  class="input-field px-3 py-1 text-sm"
                >
                <!-- 预设标签选择列表 -->
                <div 
                  v-if="showTagSelector"
                  class="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 p-2 max-h-40 overflow-y-auto"
                >
                  <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">从预设标签中选择</h4>
                  <div class="flex flex-wrap gap-1">
                    <span 
                      v-for="tag in tags" 
                      :key="tag.name"
                      @click="selectPresetTag(tag.label)"
                      class="px-3 py-1 text-xs rounded-full cursor-pointer hover:opacity-90 transition-all duration-200 transform hover:scale-105"
                      :class="tag.color"
                    >
                      {{ tag.label }}
                    </span>
                  </div>
                  <div class="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                    <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">或者输入自定义标签</h4>
                    <p class="text-xs text-gray-400 dark:text-gray-500 px-2">输入标签后按回车键添加</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 笔记工具栏 -->
          <div class="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
            <!-- 文本格式化工具 -->
            <div class="flex gap-1">
              <button @click="execCommand('bold')" class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="粗体">
                <i class="fa fa-bold" aria-hidden="true"></i>
              </button>
              <button @click="execCommand('italic')" class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="斜体">
                <i class="fa fa-italic" aria-hidden="true"></i>
              </button>
              <button @click="execCommand('underline')" class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="下划线">
                <i class="fa fa-underline" aria-hidden="true"></i>
              </button>
              <button @click="execCommand('strikeThrough')" class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="删除线">
                <i class="fa fa-strikethrough" aria-hidden="true"></i>
              </button>
            </div>
            
            <!-- 列表工具 -->
            <div class="flex gap-1">
              <button @click="execCommand('insertUnorderedList')" class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="无序列表">
                <i class="fa fa-list-ul" aria-hidden="true"></i>
              </button>
              <button @click="execCommand('insertOrderedList')" class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="有序列表">
                <i class="fa fa-list-ol" aria-hidden="true"></i>
              </button>
              <button @click="execCommand('outdent')" class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="减少缩进">
                <i class="fa fa-outdent" aria-hidden="true"></i>
              </button>
              <button @click="execCommand('indent')" class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="增加缩进">
                <i class="fa fa-indent" aria-hidden="true"></i>
              </button>
            </div>
            
            <!-- 链接和媒体工具 -->
            <div class="flex gap-1">
              <button @click="execCommand('createLink', prompt('请输入链接地址:'))" class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="链接">
                <i class="fa fa-link" aria-hidden="true"></i>
              </button>
              <button @click="execCommand('unlink')" class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="移除链接">
                <i class="fa fa-unlink" aria-hidden="true"></i>
              </button>
              <button @click="execCommand('insertImage', prompt('请输入图片URL:'))" class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="图片">
                <i class="fa fa-image" aria-hidden="true"></i>
              </button>
            </div>
            
            <!-- 代码和引用工具 -->
            <div class="flex gap-1">
              <button @click="execCommand('formatBlock', 'blockquote')" class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="引用">
                <i class="fa fa-quote-left" aria-hidden="true"></i>
              </button>
              <button @click="execCommand('formatBlock', 'pre')" class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="代码块">
                <i class="fa fa-code" aria-hidden="true"></i>
              </button>
              <button @click="execCommand('insertHorizontalRule')" class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="分隔线">
                <i class="fa fa-minus" aria-hidden="true"></i>
              </button>
            </div>
            
            <!-- 撤销重做工具 -->
            <div class="flex gap-1">
              <button @click="execCommand('undo')" class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="撤销">
                <i class="fa fa-undo" aria-hidden="true"></i>
              </button>
              <button @click="execCommand('redo')" class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="重做">
                <i class="fa fa-repeat" aria-hidden="true"></i>
              </button>
            </div>
            
            <!-- 分隔线 -->
            <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
            
            <!-- 编辑器模式切换 -->
            <div class="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button 
                @click="editorMode = 'richText'"
                :class="[
                  'px-3 py-1 text-sm rounded-lg transition-colors',
                  editorMode === 'richText' 
                    ? 'bg-white dark:bg-gray-800 shadow-sm' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                ]"
              >
                富文本
              </button>
              <button 
                @click="editorMode = 'markdown'"
                :class="[
                  'px-3 py-1 text-sm rounded-lg transition-colors',
                  editorMode === 'markdown' 
                    ? 'bg-white dark:bg-gray-800 shadow-sm' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                ]"
              >
                Markdown
              </button>
            </div>
            
            <!-- 右侧操作按钮 -->
            <div class="ml-auto flex gap-2">
              <button 
                @click="saveNote"
                class="px-3 py-1 text-sm rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                title="保存笔记"
              >
                <i class="fa fa-save mr-1" aria-hidden="true"></i>保存
              </button>
              <button 
                @click="toggleArchive(selectedNote)"
                :class="[
                  'px-3 py-1 text-sm rounded-lg transition-colors',
                  selectedNote.is_archived 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                ]"
              >
                <i :class="['fa', selectedNote.is_archived ? 'fa-archive' : 'fa-archive-o']" aria-hidden="true"></i>
                {{ selectedNote.is_archived ? '已归档' : '归档' }}
              </button>
              <button 
                @click="deleteNote(selectedNote.id)"
                class="px-3 py-1 text-sm rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                <i class="fa fa-trash mr-1" aria-hidden="true"></i>删除
              </button>
            </div>
          </div>

          <!-- 笔记编辑器 -->
          <div 
            v-if="editorMode === 'richText'"
            class="note-editor min-h-[500px] p-6 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ease-in-out bg-white dark:bg-gray-800"
            ref="richTextEditor"
            contenteditable="true"
            @input="onEditorInput"
            @focus="isEditorFocused = true"
            @blur="isEditorFocused = false"
          ></div>
          
          <!-- Markdown编辑器 -->
          <div v-else class="space-y-4">
            <textarea 
              class="note-editor min-h-[500px] w-full p-6 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ease-in-out bg-white dark:bg-gray-800 font-mono text-sm resize-vertical"
              v-model="markdownContent"
              @input="onMarkdownInput"
              placeholder="使用 Markdown 语法编写笔记..."
            ></textarea>
            <div class="bg-gray-50 dark:bg-gray-750 p-6 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[300px]">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">预览</h3>
              <div v-html="renderMarkdown(markdownContent)" class="prose dark:prose-invert max-w-none"></div>
            </div>
          </div>

          <!-- 笔记信息和操作 -->
          <div class="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              最后更新: {{ new Date(selectedNote.updated_at).toLocaleString() }}
            </div>
            <div class="flex gap-2">
              <button @click="showVersionHistory = !showVersionHistory" class="text-sm text-primary hover:underline">
                <i class="fa fa-history mr-1" aria-hidden="true"></i>版本历史
              </button>
              <button @click="shareNote" class="text-sm text-primary hover:underline">
                <i class="fa fa-share-alt mr-1" aria-hidden="true"></i>分享
              </button>
            </div>
          </div>

          <!-- 版本历史 -->
          <div v-if="showVersionHistory" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 class="font-medium mb-4">版本历史</h3>
            <div class="space-y-3">
              <div 
                v-for="version in noteVersions" 
                :key="version.id"
                class="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <p class="text-sm font-medium">{{ version.title }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ new Date(version.created_at).toLocaleString() }}</p>
                  </div>
                  <button 
                    @click="restoreNoteVersion(version)"
                    class="text-xs btn-outline px-3 py-1"
                  >
                    恢复
                  </button>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{{ version.content.substring(0, 100) }}{{ version.content.length > 100 ? '...' : '' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 新建笔记提示 -->
        <div v-else class="flex flex-col items-center justify-center min-h-[400px] text-center text-gray-500 dark:text-gray-400">
          <i class="fa fa-file-text-o text-6xl mb-4 text-gray-300 dark:text-gray-600"></i>
          <h3 class="text-xl font-medium mb-2">选择或创建笔记</h3>
          <p class="mb-6">从左侧选择一个笔记进行编辑，或创建一个新笔记</p>
          <button 
            @click="createNewNote()" 
            class="btn-primary"
          >
            <i class="fa fa-plus mr-1" aria-hidden="true"></i>新建笔记
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { noteApi } from '../services/api';

export default {
  name: 'Notes',
  setup() {
    const notes = ref([]);
    const searchQuery = ref('');
    const selectedNote = ref({
      id: null,
      title: '',
      content: '',
      category: '',
      is_favorite: 0,
      is_archived: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    const saveStatus = ref('');
    const autoSaveStatus = ref('');
    const autoSaveTimer = ref(null);
    const showVersionHistory = ref(false);
    const noteVersions = ref([]);
    const activeCategory = ref('all');
    const activeTag = ref(null);
    const editorMode = ref('richText');
    const isEditorFocused = ref(false);
    const markdownContent = ref('');
    const richTextEditor = ref(null);
    // 标签管理相关
    const newTag = ref('');
    const showTagSelector = ref(false);
    const tags = ref([
      { name: 'work', label: '工作', count: 5, color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' },
      { name: 'study', label: '学习', count: 3, color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' },
      { name: 'creative', label: '创意', count: 2, color: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' },
      { name: 'idea', label: '想法', count: 4, color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' },
      { name: 'important', label: '重要', count: 1, color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' },
      { name: 'personal', label: '个人', count: 6, color: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200' },
      { name: 'project', label: '项目', count: 3, color: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' },
      { name: 'meeting', label: '会议', count: 2, color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' }
    ]);
    let saveTimeout = null;
    
    // 添加标签
    const addTag = () => {
      if (newTag.value.trim() && selectedNote.value.tags && selectedNote.value.tags.indexOf(newTag.value.trim()) === -1) {
        selectedNote.value.tags.push(newTag.value.trim());
        newTag.value = '';
        saveNote();
      }
    };
    
    // 选择预设标签
    const selectPresetTag = (tagLabel) => {
      if (selectedNote.value.tags && selectedNote.value.tags.indexOf(tagLabel) === -1) {
        selectedNote.value.tags.push(tagLabel);
        saveNote();
      }
      showTagSelector.value = false;
      newTag.value = '';
    };
    
    // 删除标签
    const removeTag = (index) => {
      if (selectedNote.value.tags) {
        selectedNote.value.tags.splice(index, 1);
        saveNote();
      }
    };
    
    // 处理标签输入框失焦事件
    const handleTagInputBlur = () => {
      setTimeout(() => {
        showTagSelector.value = false;
      }, 200);
    };

    // 获取所有笔记
    const fetchNotes = async () => {
      try {
        const data = await noteApi.getAll();
        // 确保每个笔记都有tags字段
        notes.value = data.map(note => ({
          ...note,
          tags: note.tags || []
        }));
        // 如果没有选中的笔记，自动选择第一个
        if (notes.value.length > 0 && !selectedNote.value.id) {
          selectNote(notes.value[0]);
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      }
    };

    // 过滤笔记
    const filteredNotes = computed(() => {
      let result = notes.value;
      
      // 搜索过滤
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(note => 
          note.title.toLowerCase().includes(query) || 
          note.content.toLowerCase().includes(query)
        );
      }
      
      // 分类过滤
      if (activeCategory.value === 'all') {
        result = result.filter(note => !note.is_archived);
      } else if (activeCategory.value === 'recent') {
        // 最近编辑的笔记，按更新时间排序
        result = result.filter(note => !note.is_archived)
                      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      } else if (activeCategory.value === 'archived') {
        result = result.filter(note => note.is_archived);
      } else if (activeCategory.value === 'deleted') {
        // 已删除笔记功能，暂时返回空数组
        result = [];
      }
      
      // 标签过滤
      if (activeTag.value) {
        result = result.filter(note => {
          // 检查笔记是否有tags字段，以及tags是否包含当前标签
          if (note.tags && Array.isArray(note.tags)) {
            return note.tags.some(tag => 
              tag.toLowerCase().includes(activeTag.value.toLowerCase())
            );
          }
          // 兼容旧笔记，检查标题或内容是否包含标签名称
          return note.title.toLowerCase().includes(activeTag.value.toLowerCase()) ||
                 note.content.toLowerCase().includes(activeTag.value.toLowerCase());
        });
      }
      
      return result;
    });
    
    // 按分类过滤
    const filterByCategory = (category) => {
      activeCategory.value = category;
      activeTag.value = null;
    };
    
    // 按标签过滤
    const filterByTag = (tag) => {
      activeTag.value = tag;
      activeCategory.value = 'all';
    };

    // 创建新笔记
    const createNewNote = async () => {
      try {
        const newNote = {
          title: '新笔记',
          content: '<p>开始编写你的笔记...</p>',
          draft_content: '',
          category: '',
          tags: [],
          notebook_id: null,
          is_favorite: 0,
          is_archived: 0,
          is_marked: 0
        };
        
        const createdNote = await noteApi.create(newNote);
        await fetchNotes();
        // 确保编辑器模式正确同步
        if (editorMode.value === 'richText') {
          // 立即更新富文本编辑器内容
          setTimeout(() => {
            if (richTextEditor.value) {
              richTextEditor.value.innerHTML = createdNote.content;
            }
          }, 0);
        }
        selectNote(createdNote);
      } catch (error) {
        console.error('Failed to create note:', error);
        alert('新建笔记失败，请检查网络连接或服务器状态');
      }
    };

    // 选择笔记
    const selectNote = (note) => {
      // 确保笔记有完整的数据结构
      const noteWithTags = { 
        ...note, 
        tags: note.tags || [],
        draft_content: note.draft_content || ''
      };
      selectedNote.value = noteWithTags;
      // 根据编辑器模式更新内容，优先使用草稿内容
      if (editorMode.value === 'markdown') {
        markdownContent.value = noteWithTags.draft_content || noteWithTags.content || '';
      } else if (richTextEditor.value) {
        richTextEditor.value.innerHTML = noteWithTags.draft_content || noteWithTags.content || '<p>开始编写你的笔记...</p>';
      }
      showVersionHistory.value = false;
      // 获取笔记版本历史
      fetchNoteVersions(note.id);
      // 重置自动保存状态
      autoSaveStatus.value = '';
    };

    // 获取笔记版本历史
    const fetchNoteVersions = async (noteId) => {
      try {
        // 目前后端没有实现版本历史API，所以返回空数组
        noteVersions.value = [];
      } catch (error) {
        console.error('Failed to fetch note versions:', error);
        noteVersions.value = [];
      }
    };

    // 编辑器命令执行函数
    const execCommand = (command, value = null) => {
      // 保存当前选区
      const selection = window.getSelection();
      let range = null;
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
      }
      
      // 执行命令
      document.execCommand(command, false, value);
      
      // 触发输入事件以保存内容
      const editor = document.querySelector('.note-editor');
      if (editor) {
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        
        // 恢复选区
        if (range) {
          setTimeout(() => {
            selection.removeAllRanges();
            selection.addRange(range);
          }, 0);
        }
      }
    };

    // 编辑器输入事件
    const onEditorInput = (event) => {
      selectedNote.value.content = event.target.innerHTML;
      selectedNote.value.updated_at = new Date().toISOString();
      
      // 自动保存
      handleAutoSave();
    };
    
    // Markdown输入事件
    const onMarkdownInput = (event) => {
      selectedNote.value.content = markdownContent.value;
      selectedNote.value.updated_at = new Date().toISOString();
      
      // 自动保存
      handleAutoSave();
    };
    
    // Markdown渲染函数（简化实现）
    const renderMarkdown = (content) => {
      if (!content) return '';
      
      // 简单的Markdown到HTML转换
      let html = content
        // 标题
        .replace(/^#{6}\s(.+)$/gm, '<h6>$1</h6>')
        .replace(/^#{5}\s(.+)$/gm, '<h5>$1</h5>')
        .replace(/^#{4}\s(.+)$/gm, '<h4>$1</h4>')
        .replace(/^#{3}\s(.+)$/gm, '<h3>$1</h3>')
        .replace(/^#{2}\s(.+)$/gm, '<h2>$1</h2>')
        .replace(/^#{1}\s(.+)$/gm, '<h1>$1</h1>')
        // 粗体和斜体
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        // 列表
        .replace(/^-\s(.+)$/gm, '<ul><li>$1</li></ul>')
        .replace(/^\d+\.\s(.+)$/gm, '<ol><li>$1</li></ol>')
        // 链接
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
        // 图片
        .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg shadow-sm" />')
        // 代码块
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        // 行内代码
        .replace(/`(.+?)`/g, '<code>$1</code>')
        // 引用
        .replace(/^>\s(.+)$/gm, '<blockquote>$1</blockquote>')
        // 分隔线
        .replace(/^---$/gm, '<hr />')
        // 换行
        .replace(/\n/g, '<br />');
      
      return html;
    };
    
    // 监听编辑器模式切换
    watch(editorMode, (newMode, oldMode) => {
      if (selectedNote.value.id) {
        if (newMode === 'markdown' && oldMode === 'richText') {
          // 从富文本切换到Markdown
          if (richTextEditor.value) {
            // 保存富文本编辑器的实际内容到草稿
            const currentContent = richTextEditor.value.innerHTML;
            selectedNote.value.draft_content = currentContent;
            // 将当前内容赋值给Markdown编辑器
            markdownContent.value = currentContent;
          }
        } else if (newMode === 'richText' && oldMode === 'markdown') {
          // 从Markdown切换到富文本
          // 保存Markdown编辑器的内容到草稿
          const currentContent = markdownContent.value;
          selectedNote.value.draft_content = currentContent;
          if (richTextEditor.value) {
            // 如果是HTML内容，直接显示；如果是Markdown，先渲染
            if (currentContent.startsWith('<')) {
              richTextEditor.value.innerHTML = currentContent;
            } else {
              // 简单处理：将Markdown转换为HTML（实际项目中应该使用专门的库）
              richTextEditor.value.innerHTML = renderMarkdown(currentContent);
            }
          }
        }
      }
    });
    
    // 保存草稿
    const saveDraft = async () => {
      try {
        if (selectedNote.value.id) {
          // 根据编辑器模式获取当前内容
          let currentContent = '';
          if (editorMode.value === 'markdown') {
            currentContent = markdownContent.value;
          } else if (richTextEditor.value) {
            currentContent = richTextEditor.value.innerHTML;
          }
          
          // 保存草稿内容
          await noteApi.updateDraft(selectedNote.value.id, currentContent);
          
          // 更新本地状态
          selectedNote.value.draft_content = currentContent;
          selectedNote.value.updated_at = new Date().toISOString();
          
          autoSaveStatus.value = '草稿已保存';
          
          // 3秒后清除保存状态
          setTimeout(() => {
            autoSaveStatus.value = '';
          }, 3000);
        }
      } catch (error) {
        console.error('Failed to save draft:', error);
        console.error('错误详情:', error.response?.data || error.message);
        autoSaveStatus.value = '草稿保存失败';
        
        // 3秒后清除保存状态
        setTimeout(() => {
          autoSaveStatus.value = '';
        }, 3000);
      }
    };
    
    // 自动保存处理
    const handleAutoSave = () => {
      // 清除之前的定时器
      if (autoSaveTimer.value) {
        clearTimeout(autoSaveTimer.value);
      }
      
      // 显示自动保存状态
      autoSaveStatus.value = '自动保存中...';
      
      // 设置新的定时器，保存草稿
      autoSaveTimer.value = setTimeout(async () => {
        await saveDraft();
      }, 3000);
    };

    // 保存笔记（将草稿内容同步到正式内容）
    const saveNote = async () => {
      try {
        if (selectedNote.value.id) {
          // 根据编辑器模式处理内容
          let noteData = { ...selectedNote.value };
          if (editorMode.value === 'markdown') {
            noteData.content = markdownContent.value;
          } else if (richTextEditor.value) {
            noteData.content = richTextEditor.value.innerHTML;
          }
          
          // 将草稿内容同步到正式内容
          noteData.draft_content = noteData.content;
          
          console.log('保存笔记请求数据:', noteData);
          await noteApi.update(selectedNote.value.id, noteData);
          
          // 更新笔记列表
          await fetchNotes();
          // 重新选择当前笔记以保持选中状态
          selectNote(selectedNote.value);
          
          autoSaveStatus.value = '已保存';
          
          // 3秒后清除保存状态
          setTimeout(() => {
            autoSaveStatus.value = '';
          }, 3000);
        }
      } catch (error) {
        console.error('Failed to save note:', error);
        console.error('错误详情:', error.response?.data || error.message);
        autoSaveStatus.value = '保存失败';
        
        // 3秒后清除保存状态
        setTimeout(() => {
          autoSaveStatus.value = '';
        }, 3000);
      }
    };

    // 删除笔记
    const deleteNote = async (id) => {
      if (confirm('确定要删除这篇笔记吗？')) {
        try {
          await noteApi.delete(id);
          await fetchNotes();
          // 如果删除的是当前选中的笔记，重置选中状态
          if (selectedNote.value.id === id) {
            selectedNote.value = {
              id: null,
              title: '',
              content: '',
              category: '',
              is_favorite: 0,
              is_archived: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          }
        } catch (error) {
          console.error('Failed to delete note:', error);
        }
      }
    };

    // 切换收藏状态
    const toggleFavorite = async (note) => {
      try {
        const newFavoriteStatus = note.is_favorite === 1 ? 0 : 1;
        await noteApi.toggleFavorite(note.id, newFavoriteStatus);
        await fetchNotes();
        // 如果切换的是当前选中的笔记，更新选中状态
        if (selectedNote.value.id === note.id) {
          selectedNote.value.is_favorite = newFavoriteStatus;
        }
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
      }
    };

    // 切换归档状态
    const toggleArchive = async (note) => {
      try {
        const newArchiveStatus = note.is_archived === 1 ? 0 : 1;
        await noteApi.toggleArchive(note.id, newArchiveStatus);
        await fetchNotes();
        // 如果归档的是当前选中的笔记，重置选中状态
        if (selectedNote.value.id === note.id) {
          selectedNote.value = {
            id: null,
            title: '',
            content: '',
            category: '',
            is_favorite: 0,
            is_archived: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
      } catch (error) {
        console.error('Failed to toggle archive:', error);
      }
    };

    // 恢复笔记版本
    const restoreNoteVersion = async (version) => {
      if (confirm('确定要恢复到这个版本吗？')) {
        try {
          selectedNote.value.title = version.title;
          selectedNote.value.content = version.content;
          await saveNote();
          showVersionHistory.value = false;
        } catch (error) {
          console.error('Failed to restore note version:', error);
        }
      }
    };

    // 日期格式化函数
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

    // 分享笔记
    const shareNote = () => {
      // 这里应该实现分享功能，暂时使用模拟实现
      alert('分享功能正在开发中...');
    };

    // 组件挂载时获取笔记
    onMounted(() => {
      fetchNotes();
    });

    return {
      notes,
      searchQuery,
      selectedNote,
      saveStatus,
      autoSaveStatus,
      showVersionHistory,
      noteVersions,
      activeCategory,
      activeTag,
      editorMode,
      isEditorFocused,
      markdownContent,
      richTextEditor,
      tags,
      newTag,
      showTagSelector,
      filteredNotes,
      createNewNote,
      selectNote,
      onEditorInput,
      onMarkdownInput,
      renderMarkdown,
      execCommand,
      saveNote,
      deleteNote,
      toggleFavorite,
      toggleArchive,
      restoreNoteVersion,
      shareNote,
      filterByCategory,
      filterByTag,
      formatDate,
      addTag,
      selectPresetTag,
      removeTag,
      handleTagInputBlur
    };
  }
};
</script>
