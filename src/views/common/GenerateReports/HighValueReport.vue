<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { FileText, Printer, Loader2Icon, AlertCircle } from 'lucide-vue-next'
import { useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axios'

const authStore = useAuthStore()
const user = authStore.user

const printableRef = ref(null)
const notedByName = ref('VANESSA TAYABA')
const notedByTitle = ref('Municipal Agricultural Officer')
const submittedByName = ref('')
const submittedByTitle = ref('')

const currentDate = new Date().toLocaleDateString('en-US', {
  month: 'long',
  year: 'numeric',
})

// Fetch report data using Tanstack Query
const {
  data: reportData,
  isLoading,
  error,
} = useQuery({
  queryKey: ['high-value-report'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/reports/high-value')
    return response.data
  },
  staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
})

const classificationMap = {
  'lowland vegetable': 'Lowland Vegetables',
  'upland vegetable': 'Upland Vegetables',
  legumes: 'Legumes',
  spice: 'Spice(s)',
  rootcrop: 'Rootcrops',
  fruit: 'Fruits',
}

// Process data into table format
const tableData = computed(() => {
  if (!reportData.value) return {}

  const data = {}
  // Process existing plantings
  reportData.value.existing.forEach((item) => {
    const category = classificationMap[item.classification] || item.classification
    if (!data[category]) {
      data[category] = {}
    }
    const cropName = item.crop_type.name
    if (!data[category][cropName]) {
      data[category][cropName] = {
        existing: 0,
        thisMonth: 0,
        toDate: 0,
        production: 0,
      }
    }
    data[category][cropName].existing += Number(item.area_planted)
  })

  // Process current month plantings
  reportData.value.currentMonth.forEach((item) => {
    const category = classificationMap[item.classification] || item.classification
    const cropName = item.crop_type.name
    if (!data[category]) {
      data[category] = {}
    }
    if (!data[category][cropName]) {
      data[category][cropName] = {
        existing: 0,
        thisMonth: 0,
        toDate: 0,
        production: 0,
      }
    }
    data[category][cropName].thisMonth += Number(item.area_planted)
    data[category][cropName].toDate += Number(item.area_planted)
  })

  // Process production data
  reportData.value.production.forEach((item) => {
    const category = classificationMap[item.classification] || item.classification
    const cropName = item.name
    if (!data[category]) {
      data[category] = {}
    }
    if (!data[category][cropName]) {
      data[category][cropName] = {
        existing: 0,
        thisMonth: 0,
        toDate: 0,
        production: 0,
      }
    }
    data[category][cropName].production += Number(item.yield_quantity)
  })

  return data
})

// Calculate totals for each category
const totals = computed(() => {
  const totals = {}
  Object.entries(tableData.value).forEach(([category, crops]) => {
    totals[category] = Object.values(crops).reduce(
      (acc, curr) => ({
        existing: acc.existing + curr.existing,
        thisMonth: acc.thisMonth + curr.thisMonth,
        toDate: acc.toDate + curr.toDate,
        production: acc.production + curr.production,
      }),
      { existing: 0, thisMonth: 0, toDate: 0, production: 0 },
    )
  })
  return totals
})

function generateRandomFilename() {
  const timestamp = new Date().toISOString().slice(0, 10)
  const uuid = crypto.randomUUID()
  return `high-value-report_${timestamp}_${uuid}`
}

function printReport() {
  const filename = generateRandomFilename()
  document.title = filename
  window.print()
  setTimeout(() => {
    document.title = 'High Value Report'
  }, 1000)
}
</script>

<template>
  <!-- Screen version -->
  <div class="screen-only">
    <!-- Controls -->
    <div class="flex flex-col gap-6">
      <div class="flex justify-between items-center">
        <h2
          class="text-xl sm:text-2xl lg:text-3xl flex items-center gap-2 font-extrabold text-primary break-words"
        >
          <FileText class="h-6 w-6 text-primary flex-shrink-0" />
          <span class="min-w-0">High Value Crop Report</span>
        </h2>
        <Button @click="printReport" variant="outline" class="hidden md:flex items-center gap-2">
          <Printer class="h-4 w-4" />
          Print Report
        </Button>
      </div>
    </div>

    <!-- Mobile message -->
    <div class="block md:hidden text-center py-12 bg-muted/10 rounded-lg mt-6">
      <FileText class="h-16 w-16 mx-auto mb-4 text-primary opacity-80" />
      <h3 class="text-xl font-semibold mb-3">Desktop View Recommended</h3>
      <p class="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        This report is optimized for desktop viewing. Please use a larger screen to view the full
        report preview.
      </p>
      <Button @click="printReport" variant="default" class="flex items-center gap-2 mx-auto">
        <Printer class="h-4 w-4" />
        Print Report
      </Button>
    </div>

    <!-- Desktop preview -->
    <div class="hidden md:block mt-6">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <Loader2Icon class="w-10 h-10 animate-spin text-primary" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center text-destructive py-12">
        <AlertCircle class="w-8 h-8 mx-auto mb-3" />
        <p class="font-medium">
          {{ error?.response?.data?.message || 'Failed to load report data' }}
        </p>
      </div>

      <!-- Report Content -->
      <div v-else-if="reportData" class="printable-report">
        <div ref="printableRef" class="p-4">
          <table class="report-table">
            <thead>
              <tr>
                <th rowspan="2" class="border p-2 font-medium text-left">COMMODITY</th>
                <th colspan="3" class="border p-2 font-medium text-center">AREA PLANTED (ha)</th>
                <th colspan="2" class="border p-2 font-medium text-center">PRODUCTION (MT)</th>
                <th rowspan="2" class="border p-2 font-medium text-left">REMARKS</th>
              </tr>
              <tr>
                <th class="border p-2 font-medium">EXISTING</th>
                <th class="border p-2 font-medium">THIS MONTH</th>
                <th class="border p-2 font-medium">TO DATE</th>
                <th class="border p-2 font-medium">THIS MONTH</th>
                <th class="border p-2 font-medium">TO DATE</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(crops, category) in tableData" :key="category">
                <tr>
                  <td class="border p-2 font-medium commodity">{{ category }}</td>
                  <td class="border p-2"></td>
                  <td class="border p-2"></td>
                  <td class="border p-2"></td>
                  <td class="border p-2"></td>
                  <td class="border p-2"></td>
                  <td class="border p-2"></td>
                </tr>
                <tr v-for="(data, crop) in crops" :key="crop">
                  <td class="border p-2 pl-4 crop">{{ crop }}</td>
                  <td class="border p-2 text-right">
                    {{ data.existing > 0 ? data.existing.toFixed(4) : '' }}
                  </td>
                  <td class="border p-2 text-right">
                    {{ data.thisMonth > 0 ? data.thisMonth.toFixed(4) : '' }}
                  </td>
                  <td class="border p-2 text-right">
                    {{ data.toDate > 0 ? data.toDate.toFixed(4) : '' }}
                  </td>
                  <td class="border p-2 text-right">
                    {{ data.production > 0 ? data.production.toFixed(2) : '' }}
                  </td>
                  <td class="border p-2 text-right">
                    {{ data.production > 0 ? data.production.toFixed(2) : '' }}
                  </td>
                  <td class="border p-2"></td>
                </tr>
                <tr>
                  <td class="border p-2 pl-4 font-medium total">TOTAL</td>
                  <td class="border p-2 text-right font-medium total">
                    {{ totals[category]?.existing > 0 ? totals[category].existing.toFixed(4) : '' }}
                  </td>
                  <td class="border p-2 text-right font-medium total">
                    {{
                      totals[category]?.thisMonth > 0 ? totals[category].thisMonth.toFixed(4) : ''
                    }}
                  </td>
                  <td class="border p-2 text-right font-medium total">
                    {{ totals[category]?.toDate > 0 ? totals[category].toDate.toFixed(4) : '' }}
                  </td>
                  <td class="border p-2 text-right font-medium total">
                    {{
                      totals[category]?.production > 0 ? totals[category].production.toFixed(2) : ''
                    }}
                  </td>
                  <td class="border p-2 text-right font-medium total">
                    {{
                      totals[category]?.production > 0 ? totals[category].production.toFixed(2) : ''
                    }}
                  </td>
                  <td class="border p-2"></td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Print version -->
  <div class="print-only" v-if="reportData">
    <div id="report-content">
      <!-- Header -->
      <div class="text-center mb-6">
        <h1 class="text-xl font-bold">HIGH VALUE CROP REPORT</h1>
        <h2 class="text-xl font-bold">MONTHLY PLANTING AND PRODUCTION ACCOMPLISHMENT REPORT</h2>
        <p class="text-sm">For the Month of: {{ currentDate }}</p>
        <div class="mt-4 text-left">
          <p class="font-semibold">REGION: IV - MIMAROPA</p>
          <p class="font-semibold">PROVINCE: MARINDUQUE</p>
        </div>
      </div>

      <!-- Table -->
      <table class="report-table">
        <thead>
          <tr>
            <th rowspan="2" class="border p-2 font-medium text-left">COMMODITY</th>
            <th colspan="3" class="border p-2 font-medium text-center">AREA PLANTED (ha)</th>
            <th colspan="2" class="border p-2 font-medium text-center">PRODUCTION (MT)</th>
            <th rowspan="2" class="border p-2 font-medium text-left">REMARKS</th>
          </tr>
          <tr>
            <th class="border p-2 font-medium">EXISTING</th>
            <th class="border p-2 font-medium">THIS MONTH</th>
            <th class="border p-2 font-medium">TO DATE</th>
            <th class="border p-2 font-medium">THIS MONTH</th>
            <th class="border p-2 font-medium">TO DATE</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(crops, category) in tableData" :key="category">
            <tr>
              <td class="border p-2 font-medium commodity">{{ category }}</td>
              <td class="border p-2"></td>
              <td class="border p-2"></td>
              <td class="border p-2"></td>
              <td class="border p-2"></td>
              <td class="border p-2"></td>
              <td class="border p-2"></td>
            </tr>
            <tr v-for="(data, crop) in crops" :key="crop">
              <td class="border p-2 pl-4 crop">{{ crop }}</td>
              <td class="border p-2 text-right">
                {{ data.existing > 0 ? data.existing.toFixed(4) : '' }}
              </td>
              <td class="border p-2 text-right">
                {{ data.thisMonth > 0 ? data.thisMonth.toFixed(4) : '' }}
              </td>
              <td class="border p-2 text-right">
                {{ data.toDate > 0 ? data.toDate.toFixed(4) : '' }}
              </td>
              <td class="border p-2 text-right">
                {{ data.production > 0 ? data.production.toFixed(2) : '' }}
              </td>
              <td class="border p-2 text-right">
                {{ data.production > 0 ? data.production.toFixed(2) : '' }}
              </td>
              <td class="border p-2"></td>
            </tr>
            <tr>
              <td class="border p-2 pl-4 font-medium total">TOTAL</td>
              <td class="border p-2 text-right font-medium total">
                {{ totals[category]?.existing > 0 ? totals[category].existing.toFixed(4) : '' }}
              </td>
              <td class="border p-2 text-right font-medium total">
                {{ totals[category]?.thisMonth > 0 ? totals[category].thisMonth.toFixed(4) : '' }}
              </td>
              <td class="border p-2 text-right font-medium total">
                {{ totals[category]?.toDate > 0 ? totals[category].toDate.toFixed(4) : '' }}
              </td>
              <td class="border p-2 text-right font-medium total">
                {{ totals[category]?.production > 0 ? totals[category].production.toFixed(2) : '' }}
              </td>
              <td class="border p-2 text-right font-medium total">
                {{ totals[category]?.production > 0 ? totals[category].production.toFixed(2) : '' }}
              </td>
              <td class="border p-2"></td>
            </tr>
          </template>
        </tbody>
      </table>

      <!-- Signatures -->
      <div class="mt-12 flex justify-between">
        <div class="w-48">
          <p>Prepared by:</p>
          <div class="mt-8 border-t border-black"></div>
          <p class="font-bold">{{ user?.name?.toUpperCase() }}</p>
          <p class="text-sm">{{ user?.position || 'Agricultural Technician' }}</p>
        </div>
        <div class="w-48">
          <p>Submitted by:</p>
          <div class="mt-8 border-t border-black"></div>
          <p class="font-bold">{{ submittedByName }}</p>
          <p class="text-sm">{{ submittedByTitle }}</p>
        </div>
        <div class="w-48">
          <p>Noted by:</p>
          <div class="mt-8 border-t border-black"></div>
          <p class="font-bold">{{ notedByName }}</p>
          <p class="text-sm">{{ notedByTitle }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Regular styles that apply to both screen and print */
.printable-report {
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow:
    0 1px 3px 0 rgb(0 0 0 / 0.1),
    0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.25rem;
}

.report-table th,
.report-table td {
  border: 1px solid hsl(var(--border));
  padding: 0.25rem;
  color: hsl(var(--foreground));
  text-align: center;
}

/* Screen styles */
.screen-only {
  display: block;
}

.print-only {
  display: none;
}

/* Print styles */
@media print {
  /* Hide screen version */
  body * {
    visibility: hidden;
  }

  .print-only {
    display: block !important;
    visibility: visible !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 8.5in !important;
    height: 14in !important;
    margin: 0 !important;
    padding: 0 !important;
    z-index: 99999 !important;
    background: white !important;
    overflow: hidden !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
  }

  #report-content {
    transform: rotate(90deg);
    transform-origin: center center;
    width: 14in !important;
    height: 8.5in !important;
    padding: 0.5in !important;
    margin: 0 auto !important;
    background: white !important;
    visibility: visible !important;
    color: black !important;
  }

  /* Header text */
  #report-content h1,
  #report-content h2 {
    font-size: 16pt !important;
    margin-bottom: 6pt !important;
    color: black !important;
  }

  #report-content p {
    font-size: 10pt !important;
    margin-bottom: 2pt !important;
    color: black !important;
  }

  /* Table styles */
  table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin: 16pt 0 !important;
    color: black !important;
  }

  th,
  td {
    border: 1px solid black !important;
    padding: 6px !important;
    font-size: 9pt !important;
    color: black !important;
    text-align: center !important;
  }

  td.text-right {
    text-align: right !important;
  }

  td.text-left,
  th.text-left {
    text-align: left !important;
  }

  .commodity {
    font-weight: bold !important;
  }

  .crop {
    padding-left: 16px !important;
  }

  .total {
    font-weight: bold !important;
  }

  /* Signature section */
  .mt-12 {
    margin-top: 1in !important;
  }

  .mt-8 {
    margin-top: 16pt !important;
  }

  /* Signature text */
  .mt-12 p,
  .mt-12 .font-bold,
  .mt-12 .text-sm {
    color: black !important;
    font-size: 10pt !important;
  }

  /* Page settings */
  @page {
    size: legal portrait;
    margin: 0;
  }

  .screen-only {
    display: none !important;
  }

  .border-t {
    border-top: 1px solid black !important;
  }
}
</style>
