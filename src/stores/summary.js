import { groupByDate, sumByType } from '@/components/system/reports/summaryReportTableUtils'
import { prepareDate, getPreciseNumber, getAccumulatedNumber } from '@/utils/helpers'
import { useAuthUserStore } from './authUser'
import { supabase } from '@/utils/supabase'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSummaryStore = defineStore('summary', () => {
  // Use Pinia Store
  const authStore = useAuthUserStore()

  // States
  const summaryReport = ref([])

  // Reset State Action
  function $reset() {
    summaryReport.value = []
  }

  // Retrieve Stocks Report
  async function getSummaryReport({ sortBy }, { branch_id, date_range }) {
    // Parallel data fetching
    const [{ data: inventoryData }, { data: salesData }, { data: expensesData }] =
      await Promise.all([
        await getInventoryData({ branch_id, date_range }),
        await getSalesData({ branch_id, date_range }),
        await getExpensesData({ branch_id, date_range })
      ])

    // Combine and group data by date
    const combinedData = groupByDate([
      ...inventoryData.map((item) => ({
        date: item.purchased_at,
        type: 'inventory',
        amount: item.total_cost
      })),
      ...salesData.map((item) => ({
        date: item.created_at,
        type: 'sales',
        amount: item.overall_price
      })),
      ...salesData.map((item) => ({
        date: item.created_at,
        type: 'discount',
        amount: item.discount
      })),
      ...salesData.map((item) => ({
        date: item.created_at,
        type: 'collectible',
        amount: item.balance
      })),
      ...expensesData.map((item) => ({
        date: item.spent_at,
        type: 'expenses',
        amount: item.amount
      }))
    ])

    // Format the grouped data into daily summaries
    summaryReport.value = Object.entries(combinedData)
      .map(([date, entries]) => {
        const inventory = sumByType(entries, 'inventory')
        const sales = sumByType(entries, 'sales')
        const discount = sumByType(entries, 'discount')
        const collectible = sumByType(entries, 'collectible')
        const expenses = sumByType(entries, 'expenses')

        return {
          date,
          inventory,
          sales,
          discount,
          collectible,
          expenses,
          profit: getPreciseNumber(sales - inventory - expenses)
        }
      })
      .sort((a, b) =>
        sortBy.length === 1 && sortBy[0].order === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date)
      )
  }

  // Get Inventory
  async function getInventoryData({ branch_id, date_range }) {
    let query = supabase.from('stock_ins').select('total_cost, purchased_at')

    query = getSummaryFilter(query, { branch_id, date_range }, 'purchased_at')

    return await query
  }

  // Get Sales
  async function getSalesData({ branch_id, date_range }) {
    let query = supabase
      .from('sales')
      .select('overall_price, exact_price, created_at, customer_payments( payment )')

    query = getSummaryFilter(query, { branch_id, date_range })

    const { data } = await query

    const remappedData = data.map((item) => {
      const totalPayments = getAccumulatedNumber(item.customer_payments, 'payment')

      return {
        discount: getPreciseNumber(item.exact_price - item.overall_price),
        balance:
          item.customer_payments.length > 0
            ? getPreciseNumber(item.overall_price - totalPayments)
            : 0,
        overall_price: item.overall_price,
        created_at: item.created_at
      }
    })

    return { data: remappedData }
  }

  // Get Expenses
  async function getExpensesData({ branch_id, date_range }) {
    let query = supabase.from('expenses').select('amount, spent_at')

    query = getSummaryFilter(query, { branch_id, date_range }, 'spent_at')

    return await query
  }

  // Filter Summary
  async function getSummaryFilter(query, { branch_id, date_range }, date_key = 'created_at') {
    if (branch_id) query = query.eq('branch_id', branch_id)
    // If branch is not set, get the branch(es) of the user
    else {
      if (authStore.authBranchIds.length === 0) await authStore.getAuthBranchIds()

      query = query.in('branch_id', authStore.authBranchIds)
    }

    if (date_range) {
      if (date_range.length === 1) query = query.eq(date_key, prepareDate(date_range[0]))
      else {
        query = query
          .gte(date_key, prepareDate(date_range[0])) // Greater than or equal to `from` date
          .lte(date_key, prepareDate(date_range[date_range.length - 1])) // Less than or equal to `to` date
      }
    }

    return query
  }

  return {
    summaryReport,
    $reset,
    getSummaryReport
  }
})
