<template>
  <q-page class="q-pa-md">
    <!-- 頁面標題 -->
    <div class="text-center q-mb-lg">
      <h1 class="text-h4 text-dark-text q-mb-sm font-weight-bold">
        托福單字 - Day {{ dayNumber }}
      </h1>
      <p class="text-body1 text-dark-text-secondary">
        第 {{ dayNumber }} 天的托福單字學習
      </p>
    </div>

    <!-- 載入狀態 -->
    <div v-if="loading" class="text-center q-py-xl">
      <q-spinner-dots size="50px" color="primary" />
      <div class="text-dark-text-secondary q-mt-md">載入中...</div>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="text-center q-py-xl">
      <q-icon name="error" size="50px" color="negative" />
      <div class="text-dark-text q-mt-md">{{ error }}</div>
      <q-btn
        color="primary"
        label="重新載入"
        @click="loadVocabularyData"
        class="q-mt-md"
      />
    </div>

    <!-- 單字列表 -->
    <div v-else-if="dayWords.length > 0">
      <!-- 分頁控制 -->
      <div class="row justify-center q-mb-md q-px-md">
        <div class="pagination-controls">
          <div class="pagination-info">
            <span class="text-dark-text-secondary">共 {{ dayWords.length }} 個單字</span>
          </div>
          <div class="pagination-selector">
            <span class="text-dark-text-secondary">每頁顯示</span>
            <q-select
              v-model="itemsPerPage"
              :options="itemsPerPageOptions"
              dense
              outlined
              class="items-per-page-select text-dark"
              popup-content-class="bg-dark-card text-dark"
              options-selected-class="text-dark"
              options-dense
              @update:model-value="onItemsPerPageChange"
            />
          </div>
        </div>
      </div>

      <!-- 單字卡片網格 -->
      <div class="vocab-grid">
        <div
          v-for="word in paginatedWords"
          :key="word.id"
          class="vocab-card-wrapper"
        >
          <q-card class="vocab-card h-full">
            <q-card-section class="q-pa-md">
              <div class="row items-start justify-between q-mb-sm">
                <div class="text-h5 text-primary font-weight-bold">
                  {{ word.word }}
                </div>
                <q-btn
                  flat
                  round
                  icon="volume_up"
                  size="sm"
                  color="primary"
                  @click="playPronunciation(word.word)"
                >
                  <q-tooltip class="bg-dark-card text-dark-text">
                    播放發音
                  </q-tooltip>
                </q-btn>
              </div>

              <div class="text-subtitle2 text-dark-text-secondary q-mb-sm">
                {{ word.partOfSpeech }}
              </div>

              <div class="text-body1 text-dark-text q-mb-sm">
                {{ word.definition }}
              </div>

              <div v-if="word.example" class="text-body2 text-dark-text-secondary">
                {{ word.example }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- 分頁器 -->
      <div class="row justify-center q-mt-lg">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="5"
          direction-links
          boundary-links
          color="primary"
          text-color="white"
          @update:model-value="onPageChange"
        />
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-else class="text-center q-py-xl">
      <q-icon name="book" size="80px" color="grey-6" />
      <div class="text-h6 text-dark-text-secondary q-mt-md">
        找不到第 {{ dayNumber }} 天的單字資料
      </div>
      <div class="text-body2 text-dark-text-secondary q-mt-sm">
        請確認天數是否正確
      </div>
      <q-btn
        color="primary"
        label="返回天數列表"
        @click="$router.push('/toefl/by-day')"
        class="q-mt-md"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { DayVocabulary } from '../types/vocabulary'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const toeflData = ref<DayVocabulary[]>([])
const currentPage = ref(1)
const itemsPerPage = ref(20)

const itemsPerPageOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 }
]

// 從路由參數獲取天數
const dayNumber = computed(() => {
  const day = route.params.day as string
  return parseInt(day, 10)
})

// 獲取指定天數的單字
const dayWords = computed(() => {
  const dayData = toeflData.value.find(day => day.day === dayNumber.value)
  return dayData ? dayData.words : []
})

// 計算總頁數
const totalPages = computed(() => Math.ceil(dayWords.value.length / itemsPerPage.value))

// 計算當前頁的單字
const paginatedWords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return dayWords.value.slice(start, end)
})

// 載入單字資料
async function loadVocabularyData() {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch('/toefl.json')
    if (!response.ok) {
      throw new Error('載入托福單字資料失敗')
    }
    toeflData.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '載入資料時發生錯誤'
  } finally {
    loading.value = false
  }
}

// 播放發音
function playPronunciation(word: string) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }
}

// 分頁事件處理
function onPageChange(page: number) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onItemsPerPageChange() {
  currentPage.value = 1
}

onMounted(() => {
  void loadVocabularyData()
})
</script>

<style scoped>
.items-per-page-select {
  min-width: 80px
}

.vocab-card {
  transition: transform 0.2s ease-in-out
}

.vocab-card:hover {
  transform: translateY(-2px)
}
</style>
