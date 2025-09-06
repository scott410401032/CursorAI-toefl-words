<template>
  <q-page class="q-pa-md">
    <!-- 頁面標題 -->
    <div class="text-center q-mb-lg">
      <h1 class="text-h4 text-dark-text q-mb-sm font-weight-bold">
        按天數瀏覽托福單字
      </h1>
      <p class="text-body1 text-dark-text-secondary">
        按照天數規劃，循序漸進學習托福單字
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

    <!-- 天數卡片列表 -->
    <div v-else>
      <div class="vocab-grid">
        <div
          v-for="dayData in toeflData"
          :key="dayData.day"
          class="vocab-card-wrapper"
        >
          <q-card
            class="vocab-card cursor-pointer h-full"
            @click="goToDay(dayData.day)"
          >
            <q-card-section class="text-center q-pa-lg">
              <q-icon
                name="calendar_today"
                size="48px"
                color="primary"
                class="q-mb-md"
              />
              <div class="text-h5 text-dark-text q-mb-sm font-weight-bold">
                Day {{ dayData.day }}
              </div>
              <div class="text-body1 text-dark-text-secondary q-mb-sm">
                {{ dayData.words.length }} 個單字
              </div>
              <q-btn
                color="primary"
                label="開始學習"
                outline
                class="q-mt-sm"
                rounded
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-if="toeflData.length === 0" class="text-center q-py-xl">
        <q-icon name="book" size="80px" color="grey-6" />
        <div class="text-h6 text-dark-text-secondary q-mt-md">
          暫無托福單字資料
        </div>
        <div class="text-body2 text-dark-text-secondary q-mt-sm">
          請確認已正確載入單字資料
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { DayVocabulary } from '../types/vocabulary'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const toeflData = ref<DayVocabulary[]>([])

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

// 前往指定天數的單字頁面
function goToDay(day: number) {
  void router.push(`/toefl/day/${day}`)
}

onMounted(() => {
  void loadVocabularyData()
})
</script>

<style scoped>
.vocab-card {
  transition: all 0.3s ease-in-out
}

.vocab-card:hover {
  transform: translateY(-4px)
}
</style>
