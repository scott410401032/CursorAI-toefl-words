<template>
  <q-layout view="hHh Lpr lFf" class="bg-dark">
    <q-header elevated class="bg-dark-card">
      <q-toolbar class="q-px-md">
        <!-- Logo 和網站名稱 -->
        <div class="row items-center q-gutter-sm">
          <q-avatar size="40px" class="bg-primary">
            <q-icon name="school" color="white" />
          </q-avatar>
          <div class="text-h6 text-dark-text font-weight-medium">
            英文單字書練習庫
          </div>
        </div>

        <q-space />

        <!-- 桌面版導航選單 -->
        <div class="gt-sm">
          <q-tabs
            v-model="activeTab"
            class="text-white"
            indicator-color="white"
            active-color="white"
            align="left"
            no-caps
          >
            <q-route-tab
              name="home"
              label="Home"
              to="/"
              exact
            />

            <q-tab name="vocabulary" label="Vocabulary">
              <q-menu
                class="bg-dark-card"
                anchor="bottom left"
                self="top left"
                :offset="[0, 10]"
              >
                <q-list class="bg-dark-card">
                  <q-item
                    clickable
                    v-close-popup
                    to="/toefl"
                    class="text-dark"
                  >
                    <q-item-section>
                      <q-item-label>托福單字</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    to="/daily"
                    class="text-dark"
                  >
                    <q-item-section>
                      <q-item-label>一般單字</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-tab>

            <q-tab name="quiz" label="Quiz">
              <q-menu
                class="bg-dark-card"
                anchor="bottom left"
                self="top left"
                :offset="[0, 10]"
              >
                <q-list class="bg-dark-card">
                  <q-item
                    clickable
                    v-close-popup
                    to="/quiz-toefl"
                    class="text-dark"
                  >
                    <q-item-section>
                      <q-item-label>托福單字</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    to="/quiz-daily"
                    class="text-dark"
                  >
                    <q-item-section>
                      <q-item-label>一般單字</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-tab>
          </q-tabs>
        </div>

        <!-- 外部連結 -->
        <q-btn
          flat
          round
          icon="open_in_new"
          class="text-white"
          @click="openExternalLink"
        >
          <q-tooltip class="bg-dark-card text-dark">
            前往 jeremyho.tw
          </q-tooltip>
        </q-btn>

      </q-toolbar>
    </q-header>

    <q-page-container class="bg-dark">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 根據當前路由設定 active tab
const activeTab = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path.startsWith('/toefl') || path.startsWith('/daily')) return 'vocabulary'
  if (path.startsWith('/quiz')) return 'quiz'
  return 'home'
})

function openExternalLink() {
  window.open('https://jeremyho.tw/', '_blank')
}
</script>
