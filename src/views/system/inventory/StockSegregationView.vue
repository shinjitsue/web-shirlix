<script setup>
import StockSegregationTable from '@/components/system/inventory/StockSegregationTable.vue'
import SideNavigation from '@/components/layout/navigation/SideNavigation.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useDisplay } from 'vuetify'
import { ref } from 'vue'

// Utilize pre-defined vue functions
const { mobile } = useDisplay()

// Load Variables
const isDrawerVisible = ref(mobile.value ? false : true)
</script>

<template>
  <AppLayout
    :is-with-app-bar-nav-icon="true"
    @is-drawer-visible="isDrawerVisible = !isDrawerVisible"
  >
    <template #navigation>
      <SideNavigation :is-drawer-visible="isDrawerVisible"></SideNavigation>
    </template>

    <template #content>
      <v-container>
        <v-card class="mb-5">
          <template #title>
            <span class="text-h6 font-weight-bold">
              <v-breadcrumbs :items="['Inventory', 'Stock Segregation']">
                <template #prepend>
                  <v-icon icon="mdi-tray-full" size="small" class="me-1"></v-icon>
                </template>
              </v-breadcrumbs>
            </span>
          </template>

          <template #subtitle>
            <p class="ms-4 text-wrap">Track Weight and Segregate Stocks.</p>
          </template>
        </v-card>

        <v-card>
          <v-card-text>
            <StockSegregationTable></StockSegregationTable>
          </v-card-text>
        </v-card>
      </v-container>
    </template>
  </AppLayout>
</template>
