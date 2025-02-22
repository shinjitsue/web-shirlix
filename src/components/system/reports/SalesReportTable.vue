<script setup>
import { useSalesReportTable } from '@/composables/system/reports/salesReportTable'
import CodeFormDialog from '@/components/system/inventory/CodeFormDialog.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import PaymentsFormDialog from './sales/PaymentsFormDialog.vue'
import ProductsSoldDialog from './sales/ProductsSoldDialog.vue'
import { getMoneyText, getPadLeftText } from '@/utils/helpers'
import { useDisplay } from 'vuetify'

// Utilize pre-defined vue functions
const { mobile } = useDisplay()

// Utilized Composable
const {
  date,
  tableHeaders,
  tableOptions,
  tableFilters,
  itemData,
  isViewProductsDialog,
  isViewPaymentsDialog,
  isCodeFormDialogVisible,
  isConfirmDeleteDialog,
  getDiscount,
  getPaymentBalance,
  onCodeVerified,
  onDelete,
  onConfirmDelete,
  onViewProducts,
  onViewPayments,
  onFilterDate,
  onFilterItems,
  onLoadItems,
  onGenerate,
  branchesStore,
  salesStore,
  reportsStore
} = useSalesReportTable()
</script>

<template>
  <v-row>
    <v-col cols="12">
      <!-- eslint-disable vue/valid-v-slot -->
      <v-data-table-server
        v-model:items-per-page="tableOptions.itemsPerPage"
        v-model:page="tableOptions.page"
        v-model:sort-by="tableOptions.sortBy"
        :loading="tableOptions.isLoading"
        :headers="tableHeaders"
        :items="reportsStore.salesReport"
        :items-length="reportsStore.salesReport.length"
        no-data-text="Use the above filter to display report"
        @update:sort-by="(sortBy) => onLoadItems({ sortBy })"
        hide-default-footer
        :hide-default-header="mobile"
        :mobile="mobile"
      >
        <template #top>
          <v-row dense>
            <v-col cols="12" sm="4">
              <v-autocomplete
                v-model="tableFilters.customer_id"
                :items="salesStore.customers"
                density="compact"
                label="Customer"
                item-title="customer"
                item-value="id"
                clearable
                @update:model-value="onFilterItems"
              ></v-autocomplete>
            </v-col>

            <v-col cols="12" sm="4">
              <v-autocomplete
                v-model="tableFilters.branch_id"
                :items="branchesStore.branches"
                density="compact"
                label="Branch"
                item-title="name"
                item-value="id"
                clearable
                @update:model-value="onFilterItems"
              ></v-autocomplete>
            </v-col>

            <v-col cols="12" sm="4">
              <v-date-input
                v-model="tableFilters.created_at"
                density="compact"
                label="Date Sold"
                multiple="range"
                clearable
                @click:clear="onFilterDate(true)"
                @update:model-value="onFilterDate(false)"
              ></v-date-input>
            </v-col>
          </v-row>

          <v-divider class="mb-5"></v-divider>

          <v-row dense>
            <v-spacer></v-spacer>

            <v-col cols="12" sm="3">
              <v-btn
                :disabled="reportsStore.salesReport.length == 0"
                class="my-1"
                prepend-icon="mdi-file-delimited"
                color="red-darken-4"
                block
                @click="onGenerate"
              >
                Generate CSV
              </v-btn>
            </v-col>
          </v-row>

          <v-divider class="my-5"></v-divider>
        </template>

        <template #item.id="{ item }">
          <div
            class="td-first"
            :class="mobile ? '' : 'd-flex align-center'"
            :style="mobile ? 'height: auto' : ''"
          >
            <span class="font-weight-bold">
              {{ getPadLeftText(item.id) }}
            </span>
          </div>
        </template>

        <template #item.created_at="{ item }">
          <span class="font-weight-bold">
            {{ date.format(item.created_at, 'fullDateTime') }}
          </span>
        </template>

        <template #item.exact_price="{ item }">
          <span class="font-weight-bold">
            {{ getMoneyText(item.exact_price) }}
          </span>
        </template>

        <template #item.discount="{ item }">
          {{ getDiscount(item) === 0 ? '-' : getMoneyText(getDiscount(item)) }}
        </template>

        <template #item.overall_price="{ item }">
          <span class="font-weight-black">
            {{ getMoneyText(item.overall_price) }}
          </span>
        </template>

        <template #item.balance="{ item }">
          <span class="font-weight-bold">
            {{ item.customer_payments.length === 0 ? '-' : getMoneyText(getPaymentBalance(item)) }}
          </span>
        </template>

        <template #item.status="{ item }">
          <v-chip class="font-weight-bold cursor-pointer" prepend-icon="mdi-information">
            {{
              item.customer_payments.length === 0 || getPaymentBalance(item) === 0
                ? 'Fully Paid'
                : 'Partially Paid'
            }}

            <v-tooltip activator="parent" location="top" open-on-click>
              <ul class="ms-2">
                <li><span class="font-weight-bold">Branch:</span> {{ item.branches.name }}</li>
                <li>
                  <span class="font-weight-bold">Customer:</span> {{ item.customers?.customer }}
                </li>
              </ul>
            </v-tooltip>
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex align-center" :class="mobile ? 'justify-end' : 'justify-center'">
            <v-btn variant="text" density="comfortable" @click="onViewProducts(item)" icon>
              <v-icon icon="mdi-receipt-text"></v-icon>
              <v-tooltip activator="parent" location="top">View Sold Products</v-tooltip>
            </v-btn>

            <v-btn
              variant="text"
              density="comfortable"
              @click="onViewPayments(item)"
              :disabled="item.customer_payments.length == 0"
              icon
            >
              <v-icon icon="mdi-account-credit-card" color="red-darken-4"></v-icon>
              <v-tooltip activator="parent" location="top">View Payments</v-tooltip>
            </v-btn>

            <v-btn variant="text" density="comfortable" @click="onDelete(item.id)" icon>
              <v-icon icon="mdi-trash-can" color="red-darken-4"></v-icon>
              <v-tooltip activator="parent" location="top">Delete Sales Information</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-col>
  </v-row>

  <ProductsSoldDialog
    v-model:is-dialog-visible="isViewProductsDialog"
    :sold-data="itemData"
  ></ProductsSoldDialog>

  <PaymentsFormDialog
    v-model:is-dialog-visible="isViewPaymentsDialog"
    :sold-data="itemData"
    :table-options="tableOptions"
    :table-filters="tableFilters"
  ></PaymentsFormDialog>

  <CodeFormDialog
    v-model:is-dialog-visible="isCodeFormDialogVisible"
    @is-code-verified="onCodeVerified"
  ></CodeFormDialog>

  <ConfirmDialog
    v-model:is-dialog-visible="isConfirmDeleteDialog"
    title="Confirm Delete"
    text="Are you sure you want to delete sales information?"
    @confirm="onConfirmDelete"
  ></ConfirmDialog>
</template>

<style scoped>
.td-first {
  height: 75px;
}
</style>
