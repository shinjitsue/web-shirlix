<script setup>
import ProductsTable from '@/components/system/manage-products/ProductsTable.vue'
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
              <v-breadcrumbs :items="['Products Management', 'Products']">
                <template #prepend>
                  <v-icon icon="mdi-information-box" size="small" class="me-1"></v-icon>
                </template>
              </v-breadcrumbs>
            </span>
          </template>

          <template #subtitle>
            <p class="ms-4 text-wrap">Add and Manage Products.</p>
          </template>
        </v-card>

        <v-card>
          <v-card-text>
            <ProductsTable></ProductsTable>
          </v-card-text>
        </v-card>
      </v-container>
    </template>
  </AppLayout>
</template>
