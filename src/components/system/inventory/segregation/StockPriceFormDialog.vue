<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import { formActionDefault, formDataMetrics } from '@/utils/supabase.js'
import { requiredValidator, betweenValidator } from '@/utils/validators'
import { useProductsStore } from '@/stores/products'
import { useStockInStore } from '@/stores/stockIn'
import { onMounted, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'

const props = defineProps(['isDialogVisible', 'itemData', 'tableOptions', 'tableFilters'])

const emit = defineEmits(['update:isDialogVisible'])

// Utilize pre-defined vue functions
const { mdAndDown } = useDisplay()

// Use Pinia Store
const productsStore = useProductsStore()
const stockInStore = useStockInStore()

// Load Variables
const formDataDefault = {
  remarks: '',
  unit_price: 0,
  unit_price_metric: 'kg',
  product_id: null
}
const formData = ref({
  ...formDataDefault
})
const formAction = ref({
  ...formActionDefault
})
const refVForm = ref()
const imgPreview = ref('/images/img-product.png')

// Monitor itemData if it has data
watch(
  () => props.isDialogVisible,
  () => {
    formData.value = props.itemData
    imgPreview.value = formData.value.products.image_url ?? '/images/img-product.png'
  }
)

// Submit Functionality
const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

  const { data, error } = await stockInStore.updateStockIn(formData.value)

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    // Turn off processing
    formAction.value.formProcess = false
  } else if (data) {
    // Add Success Message
    formAction.value.formSuccessMessage = 'Successfully Updated Stock Price.'

    await stockInStore.getStockInTable(props.tableOptions, props.tableFilters)

    // Form Reset and Close Dialog
    setTimeout(() => {
      onFormReset()
    }, 2500)
  }
}

// Trigger Validators
const onFormSubmit = () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (valid) onSubmit()
  })
}

// Form Reset
const onFormReset = () => {
  formAction.value = { ...formActionDefault }
  emit('update:isDialogVisible', false)
}

// Load Functions during component rendering
onMounted(async () => {
  if (productsStore.products.length == 0) await productsStore.getProducts()
})
</script>

<template>
  <v-dialog
    :max-width="mdAndDown ? undefined : '800'"
    :model-value="props.isDialogVisible"
    :fullscreen="mdAndDown"
    persistent
  >
    <v-card prepend-icon="mdi-tag-text" title="Stock Price">
      <template #subtitle>
        <div class="text-wrap">
          <b class="text-error">Please review the entered values carefully before submitting.</b>
        </div>
      </template>

      <AlertNotification
        :form-success-message="formAction.formSuccessMessage"
        :form-error-message="formAction.formErrorMessage"
      ></AlertNotification>

      <v-form ref="refVForm" @submit.prevent="onFormSubmit">
        <v-card-text>
          <v-row dense>
            <v-col cols="12" sm="6" md="4">
              <v-img
                width="55%"
                class="mx-auto rounded-circle"
                color="red-darken-4"
                aspect-ratio="1"
                :src="imgPreview"
                alt="Product Picture Preview"
                cover
              >
              </v-img>
            </v-col>

            <v-col cols="12" sm="6" md="8" class="d-flex align-center">
              <v-autocomplete
                v-model="formData.product_id"
                label="Product"
                :items="productsStore.products"
                item-title="name"
                item-value="id"
                return-object
                readonly
              ></v-autocomplete>
            </v-col>

            <v-col cols="9" sm="8">
              <v-text-field
                v-model="formData.unit_price"
                prefix="Php"
                label="Unit Price Per"
                type="number"
                min="0"
                :rules="[
                  requiredValidator,
                  betweenValidator(formData.unit_price, 0.001, 999999.999)
                ]"
              ></v-text-field>
            </v-col>

            <v-col cols="3" sm="4">
              <v-select
                v-model="formData.unit_price_metric"
                label="Metric"
                :items="formDataMetrics"
                :rules="[requiredValidator]"
              ></v-select>
            </v-col>

            <v-col cols="12">
              <v-textarea v-model="formData.remarks" label="Remarks" rows="2"></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>

          <v-btn text="Close" variant="plain" prepend-icon="mdi-close" @click="onFormReset"></v-btn>

          <v-btn
            prepend-icon="mdi-pencil"
            color="red-darken-4"
            type="submit"
            variant="elevated"
            :disabled="formAction.formProcess"
            :loading="formAction.formProcess"
          >
            Update Price
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
