<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileText, Printer, Loader2Icon, AlertCircle } from 'lucide-vue-next'
import { useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axios'

const authStore = useAuthStore()
const user = authStore.user
const printableRef = ref(null)

const selectedMunicipality = ref('')
const notedByName = ref('VANESSA TAYABA')
const notedByTitle = ref('Municipal Agricultural Officer')

const currentDate = new Date().toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

// Fetch report data using Tanstack Query
const {
  data: reportData,
  isLoading,
  error,
} = useQuery({
  queryKey: ['corn-standing-report', selectedMunicipality],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/reports/corn-standing', {
      params: {
        municipality: selectedMunicipality.value || undefined,
      },
    })
    return response.data
  },
  staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
})

const municipalities = computed(() => reportData.value?.municipalities || [])
const stages = computed(() => reportData.value?.stages || [])

const barangays = computed(() => {
  if (!reportData.value?.data || !selectedMunicipality.value) return []
  return Object.keys(reportData.value.data[selectedMunicipality.value] || {})
})

const getCropData = (barangay, type, stage) => {
  if (!reportData.value?.data || !selectedMunicipality.value) return ''
  const value = reportData.value.data[selectedMunicipality.value]?.[barangay]?.[type]?.[stage] || 0
  return value ? value.toFixed(4) : ''
}

function generateRandomFilename() {
  const timestamp = new Date().toISOString().slice(0, 10)
  const uuid = crypto.randomUUID()
  return `corn-standing-report_${timestamp}_${uuid}`
}

function handlePrint() {
  const filename = generateRandomFilename()
  document.title = filename
  window.print()
  setTimeout(() => {
    document.title = 'Corn Standing Report'
  }, 1000)
}

const getHeaderClass = (type) => {
  switch (type) {
    case 'YELLOW':
      return 'bg-yellow-50/50'
    case 'WHITE':
      return 'bg-gray-50/50'
    case 'GRAND TOTAL':
      return 'bg-blue-50/50'
    default:
      return ''
  }
}

const formatNumber = (value) => {
  if (!value) return ''
  return Number(value).toFixed(4)
}

const getTotal = (barangay, type) => {
  if (!reportData.value?.data || !selectedMunicipality.value) return 0
  const data = reportData.value.data[selectedMunicipality.value]?.[barangay]?.[type]
  if (!data) return 0
  return Object.values(data).reduce((sum, val) => sum + (val || 0), 0)
}

const getColumnTotal = (type, stage) => {
  if (!reportData.value?.data || !selectedMunicipality.value || !barangays.value) return 0
  return barangays.value.reduce((sum, barangay) => {
    return sum + (getCropData(barangay, type, stage) || 0)
  }, 0)
}

const getTypeTotal = (type) => {
  if (!reportData.value?.data || !selectedMunicipality.value || !barangays.value) return 0
  return barangays.value.reduce((sum, barangay) => {
    return sum + getTotal(barangay, type)
  }, 0)
}
</script>

<template>
  <div class="screen-only p-4">
    <!-- Controls -->
    <div class="bg-card text-card-foreground rounded-lg shadow p-4 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold flex items-center gap-2 text-foreground">
          <FileText class="h-5 w-5" />
          Corn Standing Report
        </h2>
        <Button @click="handlePrint" variant="default" class="flex items-center gap-2">
          <Printer class="h-4 w-4" />
          Print Report
        </Button>
      </div>

      <div class="grid md:grid-cols-3 gap-4">
        <div>
          <Label class="text-foreground">Municipality</Label>
          <Select v-model="selectedMunicipality">
            <SelectTrigger>
              <SelectValue placeholder="Select municipality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="municipality in municipalities"
                :key="municipality"
                :value="municipality"
              >
                {{ municipality }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label class="text-foreground">Prepared by</Label>
          <Input type="text" :value="user?.name" disabled class="text-foreground" />
        </div>
        <div>
          <Label class="text-foreground">Date</Label>
          <Input type="text" :value="currentDate" disabled class="text-foreground" />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <Loader2Icon class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center text-destructive py-8">
      <AlertCircle class="w-6 h-6 mx-auto mb-2" />
      <p>{{ error?.response?.data?.message || 'Failed to load report data' }}</p>
    </div>

    <!-- Report Content -->
    <div
      v-else-if="reportData"
      class="printable-report bg-card text-card-foreground rounded-lg shadow"
    >
      <div ref="printableRef" class="p-4">
        <!-- Header -->
        <div class="text-center mb-6">
          <h1 class="text-xl font-bold text-foreground">CORN STANDING REPORT</h1>
          <p class="text-sm text-foreground">As of: {{ currentDate }}</p>
          <div class="mt-4 text-left">
            <p class="font-semibold text-foreground">REGION: IV - MIMAROPA</p>
            <p class="font-semibold text-foreground">PROVINCE: MARINDUQUE</p>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full border-collapse border-2 text-xs">
            <thead class="bg-card">
              <tr>
                <th rowspan="2" class="border-2 p-2 text-left font-semibold">
                  Province/ Ecosystem
                </th>
                <th colspan="5" class="border-2 p-2 text-center font-semibold bg-yellow-50">
                  YELLOW
                </th>
                <th colspan="5" class="border-2 p-2 text-center font-semibold bg-gray-50">WHITE</th>
                <th colspan="5" class="border-2 p-2 text-center font-semibold bg-blue-50">
                  GRAND TOTAL
                </th>
              </tr>
              <tr>
                <template v-for="type in ['YELLOW', 'WHITE', 'GRAND TOTAL']" :key="type">
                  <th class="border p-1 text-center" :class="getHeaderClass(type)">
                    Newly Planted/ Seedling Stage (ha)
                  </th>
                  <th class="border p-1 text-center" :class="getHeaderClass(type)">
                    Vegetative Stage (ha)
                  </th>
                  <th class="border p-1 text-center" :class="getHeaderClass(type)">
                    Reproductive Stage (ha)
                  </th>
                  <th class="border p-1 text-center" :class="getHeaderClass(type)">
                    Maturing Stage (ha)
                  </th>
                  <th class="border p-1 text-center font-bold" :class="getHeaderClass(type)">
                    TOTAL
                  </th>
                </template>
              </tr>
            </thead>
            <tbody>
              <!-- Province Row -->
              <tr>
                <td colspan="16" class="border-2 p-2 text-left font-bold bg-teal-50">MARINDUQUE</td>
              </tr>

              <!-- Municipality Row -->
              <tr v-if="selectedMunicipality">
                <td colspan="16" class="border-2 p-2 text-left pl-4 font-semibold bg-teal-50/50">
                  {{ selectedMunicipality.toUpperCase() }}
                </td>
              </tr>

              <!-- Barangay Data Rows -->
              <template v-if="selectedMunicipality && barangays.length > 0">
                <tr v-for="barangay in barangays" :key="barangay" class="hover:bg-muted/50">
                  <td class="border p-2 text-left">{{ barangay }}</td>
                  <!-- YELLOW -->
                  <td
                    v-for="stage in stages"
                    :key="'yellow-' + stage"
                    class="border p-1 text-right"
                  >
                    {{ formatNumber(getCropData(barangay, 'YELLOW', stage)) }}
                  </td>
                  <td class="border p-1 text-right font-semibold bg-yellow-50/50">
                    {{ formatNumber(getTotal(barangay, 'YELLOW')) }}
                  </td>
                  <!-- WHITE -->
                  <td v-for="stage in stages" :key="'white-' + stage" class="border p-1 text-right">
                    {{ formatNumber(getCropData(barangay, 'WHITE', stage)) }}
                  </td>
                  <td class="border p-1 text-right font-semibold bg-gray-50/50">
                    {{ formatNumber(getTotal(barangay, 'WHITE')) }}
                  </td>
                  <!-- GRAND TOTAL -->
                  <td v-for="stage in stages" :key="'total-' + stage" class="border p-1 text-right">
                    {{ formatNumber(getCropData(barangay, 'GRAND TOTAL', stage)) }}
                  </td>
                  <td class="border p-1 text-right font-semibold bg-blue-50/50">
                    {{ formatNumber(getTotal(barangay, 'GRAND TOTAL')) }}
                  </td>
                </tr>

                <!-- Grand Total Row -->
                <tr class="font-bold bg-muted/50">
                  <td class="border p-2 text-left">GRAND TOTAL</td>
                  <!-- YELLOW Totals -->
                  <td
                    v-for="stage in stages"
                    :key="'total-yellow-' + stage"
                    class="border p-1 text-right"
                  >
                    {{ formatNumber(getColumnTotal('YELLOW', stage)) }}
                  </td>
                  <td class="border p-1 text-right bg-yellow-50/50">
                    {{ formatNumber(getTypeTotal('YELLOW')) }}
                  </td>
                  <!-- WHITE Totals -->
                  <td
                    v-for="stage in stages"
                    :key="'total-white-' + stage"
                    class="border p-1 text-right"
                  >
                    {{ formatNumber(getColumnTotal('WHITE', stage)) }}
                  </td>
                  <td class="border p-1 text-right bg-gray-50/50">
                    {{ formatNumber(getTypeTotal('WHITE')) }}
                  </td>
                  <!-- GRAND TOTAL Totals -->
                  <td
                    v-for="stage in stages"
                    :key="'total-grand-' + stage"
                    class="border p-1 text-right"
                  >
                    {{ formatNumber(getColumnTotal('GRAND TOTAL', stage)) }}
                  </td>
                  <td class="border p-1 text-right bg-blue-50/50">
                    {{ formatNumber(getTypeTotal('GRAND TOTAL')) }}
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td colspan="16" class="text-center py-4 border">
                  Please select a municipality to view the report
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Signatures -->
        <div class="mt-12 flex justify-between text-foreground">
          <div class="w-48">
            <p>Prepared by:</p>
            <div class="mt-8 border-t border-border"></div>
            <p class="font-bold">{{ user?.name?.toUpperCase() }}</p>
            <p class="text-sm text-muted-foreground">
              {{ user?.position || 'Agricultural Technician' }}
            </p>
          </div>
          <div class="w-48">
            <p>Noted by:</p>
            <div class="mt-8 border-t border-border"></div>
            <p class="font-bold">{{ notedByName }}</p>
            <p class="text-sm text-muted-foreground">{{ notedByTitle }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Print version - absolutely positioned outside of Vue layout -->
  <div class="print-only" v-if="reportData">
    <div id="report-content">
      <!-- Header -->
      <div class="text-center mb-6">
        <h1 class="text-xl font-bold">CORN STANDING REPORT</h1>
        <p class="text-sm">As of: {{ currentDate }}</p>
        <div class="mt-4 text-left">
          <p class="font-semibold">REGION: IV - MIMAROPA</p>
          <p class="font-semibold">PROVINCE: MARINDUQUE</p>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="report-table">
          <thead>
            <tr>
              <th rowspan="2" class="border p-2 text-left">Province/ Ecosystem</th>
              <th colspan="5" class="border p-2 text-center bg-yellow-50">YELLOW</th>
              <th colspan="5" class="border p-2 text-center bg-gray-50">WHITE</th>
              <th colspan="5" class="border p-2 text-center bg-blue-50">GRAND TOTAL</th>
            </tr>
            <tr>
              <template v-for="type in ['YELLOW', 'WHITE', 'GRAND TOTAL']" :key="type">
                <th class="border p-1 text-center">Newly Planted/ Seedling Stage (ha)</th>
                <th class="border p-1 text-center">Vegetative Stage (ha)</th>
                <th class="border p-1 text-center">Reproductive Stage (ha)</th>
                <th class="border p-1 text-center">Maturing Stage (ha)</th>
                <th class="border p-1 text-center font-bold">TOTAL</th>
              </template>
            </tr>
          </thead>
          <tbody>
            <!-- Province Row -->
            <tr>
              <td colspan="16" class="border p-2 text-left font-bold bg-teal-50">MARINDUQUE</td>
            </tr>

            <!-- Municipality Row -->
            <tr v-if="selectedMunicipality">
              <td colspan="16" class="border p-2 text-left pl-4 font-semibold bg-teal-50/50">
                {{ selectedMunicipality.toUpperCase() }}
              </td>
            </tr>

            <!-- Barangay Data Rows -->
            <template v-if="selectedMunicipality && barangays.length > 0">
              <tr v-for="barangay in barangays" :key="barangay">
                <td class="border p-2 text-left">{{ barangay }}</td>
                <!-- YELLOW -->
                <td v-for="stage in stages" :key="'yellow-' + stage" class="border p-1 text-right">
                  {{ formatNumber(getCropData(barangay, 'YELLOW', stage)) }}
                </td>
                <td class="border p-1 text-right font-semibold bg-yellow-50/50">
                  {{ formatNumber(getTotal(barangay, 'YELLOW')) }}
                </td>
                <!-- WHITE -->
                <td v-for="stage in stages" :key="'white-' + stage" class="border p-1 text-right">
                  {{ formatNumber(getCropData(barangay, 'WHITE', stage)) }}
                </td>
                <td class="border p-1 text-right font-semibold bg-gray-50/50">
                  {{ formatNumber(getTotal(barangay, 'WHITE')) }}
                </td>
                <!-- GRAND TOTAL -->
                <td v-for="stage in stages" :key="'total-' + stage" class="border p-1 text-right">
                  {{ formatNumber(getCropData(barangay, 'GRAND TOTAL', stage)) }}
                </td>
                <td class="border p-1 text-right font-semibold bg-blue-50/50">
                  {{ formatNumber(getTotal(barangay, 'GRAND TOTAL')) }}
                </td>
              </tr>

              <!-- Grand Total Row -->
              <tr class="font-bold bg-muted/50">
                <td class="border p-2 text-left">GRAND TOTAL</td>
                <!-- YELLOW Totals -->
                <td
                  v-for="stage in stages"
                  :key="'total-yellow-' + stage"
                  class="border p-1 text-right"
                >
                  {{ formatNumber(getColumnTotal('YELLOW', stage)) }}
                </td>
                <td class="border p-1 text-right bg-yellow-50/50">
                  {{ formatNumber(getTypeTotal('YELLOW')) }}
                </td>
                <!-- WHITE Totals -->
                <td
                  v-for="stage in stages"
                  :key="'total-white-' + stage"
                  class="border p-1 text-right"
                >
                  {{ formatNumber(getColumnTotal('WHITE', stage)) }}
                </td>
                <td class="border p-1 text-right bg-gray-50/50">
                  {{ formatNumber(getTypeTotal('WHITE')) }}
                </td>
                <!-- GRAND TOTAL Totals -->
                <td
                  v-for="stage in stages"
                  :key="'total-grand-' + stage"
                  class="border p-1 text-right"
                >
                  {{ formatNumber(getColumnTotal('GRAND TOTAL', stage)) }}
                </td>
                <td class="border p-1 text-right bg-blue-50/50">
                  {{ formatNumber(getTypeTotal('GRAND TOTAL')) }}
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="16" class="text-center py-4 border">
                Please select a municipality to view the report
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Signatures -->
      <div class="mt-12 flex justify-between">
        <div class="w-48">
          <p>Prepared by:</p>
          <div class="mt-8 border-t border-black"></div>
          <p class="font-bold">{{ user?.name?.toUpperCase() }}</p>
          <p class="text-sm">{{ user?.position || 'Agricultural Technician' }}</p>
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
    padding: 0.2in !important;
    margin: 0 auto !important;
    background: white !important;
    visibility: visible !important;
    color: black !important;
  }

  /* Header text */
  #report-content h1.text-xl {
    font-size: 18pt !important;
    margin-bottom: 6pt !important;
    color: black !important;
  }

  #report-content h2.text-xl {
    font-size: 16pt !important;
    margin-bottom: 4pt !important;
    color: black !important;
  }

  #report-content p.text-sm {
    font-size: 10pt !important;
    margin-bottom: 2pt !important;
    color: black !important;
  }

  #report-content .font-semibold {
    font-size: 10pt !important;
    color: black !important;
  }

  /* Table styles */
  .report-table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin: 16pt 0 !important;
    color: black !important;
  }

  .report-table th,
  .report-table td {
    border: 1px solid black !important;
    padding: 6px !important;
    font-size: 9pt !important;
    color: black !important;
    text-align: center !important;
  }

  /* First column alignment */
  .report-table th:first-child,
  .report-table td:first-child {
    text-align: left !important;
  }

  /* All other columns centered */
  .report-table th:not(:first-child),
  .report-table td:not(:first-child) {
    text-align: center !important;
  }

  /* Colors with proper contrast */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .bg-yellow-50 {
    background-color: #fff8e1 !important;
    color: black !important;
  }
  .bg-gray-50 {
    background-color: #fafafa !important;
    color: black !important;
  }
  .bg-blue-50 {
    background-color: #e3f2fd !important;
    color: black !important;
  }
  .bg-teal-50 {
    background-color: #e0f2f1 !important;
    color: black !important;
  }

  /* Signature section */
  .mt-12 {
    margin-top: 20pt !important;
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
}
</style>
