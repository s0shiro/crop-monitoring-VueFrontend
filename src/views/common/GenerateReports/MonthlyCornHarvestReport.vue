<script setup>
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { FileText, Printer, Loader2Icon, AlertCircle } from 'lucide-vue-next'
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
import axiosInstance from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const user = authStore.user

const municipalities = ['Boac', 'Buenavista', 'Gasan', 'Mogpog', 'Santa Cruz', 'Torrijos']

const selectedMunicipality = ref('Boac')
const notedByName = ref('VANESSA TAYABA')
const notedByTitle = ref('Municipal Agricultural Officer')
const printableRef = ref(null)

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
  queryKey: ['monthly-corn-harvest-report', selectedMunicipality],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/reports/corn-harvest/monthly', {
      params: {
        municipality: selectedMunicipality.value,
      },
    })
    return response.data
  },
  staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
})

const calculateProduction = (yieldQuantity) => {
  return yieldQuantity / 1000 // Convert kg to MT
}

const calculateAverageYield = (production, areaHarvested) => {
  return areaHarvested > 0 ? production / areaHarvested : 0
}

const processedData = computed(() => {
  if (!reportData.value?.data) return {}

  const barangays = {}

  reportData.value.data.forEach((item) => {
    const { barangay, municipality } = item.location_id

    if (selectedMunicipality.value && municipality !== selectedMunicipality.value) {
      return
    }

    if (!barangays[barangay]) {
      barangays[barangay] = {
        hybrid: {
          yellow: { area: 0, averageYield: 0, production: 0 },
          white: { area: 0, averageYield: 0, production: 0 },
        },
        greenCornSweetCorn: {
          white: { area: 0, averageYield: 0, production: 0 },
        },
        traditional: {
          white: { area: 0, averageYield: 0, production: 0 },
        },
      }
    }

    const harvestRecord = item.harvest_records[0]
    const areaHarvested = parseFloat(harvestRecord.area_harvested) || 0
    const production = calculateProduction(parseFloat(harvestRecord.yield_quantity) || 0)

    // Determine corn category and color
    const category = item.crop_type.name.toLowerCase()
    const variety = item.variety.name.toLowerCase()

    if (variety.includes('hybrid') && category.includes('yellow')) {
      barangays[barangay].hybrid.yellow.area += areaHarvested
      barangays[barangay].hybrid.yellow.production += production
    } else if (variety.includes('hybrid') && category.includes('white')) {
      barangays[barangay].hybrid.white.area += areaHarvested
      barangays[barangay].hybrid.white.production += production
    } else if (variety.includes('sweet') || variety.includes('green')) {
      barangays[barangay].greenCornSweetCorn.white.area += areaHarvested
      barangays[barangay].greenCornSweetCorn.white.production += production
    } else {
      barangays[barangay].traditional.white.area += areaHarvested
      barangays[barangay].traditional.white.production += production
    }
  })

  // Calculate average yields
  Object.values(barangays).forEach((barangayData) => {
    Object.values(barangayData).forEach((category) => {
      Object.values(category).forEach((data) => {
        data.averageYield = calculateAverageYield(data.production, data.area)
      })
    })
  })

  return barangays
})

function formatNumber(value) {
  if (!value || value === 0) return ''
  return Number(value).toFixed(4)
}

function generateRandomFilename() {
  const timestamp = new Date().toISOString().slice(0, 10)
  const uuid = crypto.randomUUID()
  return `corn-harvest-report_${timestamp}_${uuid}`
}

function printReport() {
  const filename = generateRandomFilename()
  document.title = filename
  window.print()
  setTimeout(() => {
    document.title = 'Monthly Corn Harvest Report'
  }, 1000)
}
</script>

<template>
  <div class="screen-only p-4">
    <!-- Controls -->
    <div class="bg-card text-card-foreground rounded-lg shadow p-4 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold flex items-center gap-2 text-foreground">
          <FileText class="h-5 w-5" />
          Monthly Corn Harvest Report
        </h2>
        <Button @click="printReport" variant="default" class="flex items-center gap-2">
          <Printer class="h-4 w-4" />
          Print Report
        </Button>
      </div>

      <div class="grid md:grid-cols-3 gap-4">
        <div>
          <Label class="text-foreground">Municipality</Label>
          <Select v-model="selectedMunicipality">
            <SelectTrigger>
              <SelectValue :placeholder="selectedMunicipality" />
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
          <h1 class="text-xl font-bold text-foreground">CORN HARVEST REPORT</h1>
          <h2 class="text-lg font-bold text-foreground">MONTHLY HARVEST ACCOMPLISHMENT REPORT</h2>
          <p class="text-sm text-foreground">For the Month of: {{ currentDate }}</p>
          <div class="mt-4 text-left">
            <p class="font-semibold text-foreground">REGION: IV - MIMAROPA</p>
            <p class="font-semibold text-foreground">PROVINCE: MARINDUQUE</p>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full border-collapse border-2 border-black text-xs">
            <thead>
              <tr>
                <th rowspan="3" class="border border-black p-1">MUNICIPALITY</th>
                <th colspan="3" class="border border-black p-1 bg-yellow-100">HYBRID</th>
                <th colspan="3" class="border border-black p-1 bg-green-100">
                  GREEN CORN/SWEET CORN
                </th>
                <th colspan="3" class="border border-black p-1 bg-blue-100">TRADITIONAL</th>
                <th colspan="6" class="border border-black p-1 bg-gray-100">TOTAL</th>
              </tr>
              <tr>
                <th colspan="3" class="border border-black p-1 bg-yellow-100">YELLOW</th>
                <th colspan="3" class="border border-black p-1 bg-yellow-50">WHITE</th>
                <th colspan="3" class="border border-black p-1 bg-gray-50">WHITE</th>
                <th colspan="3" class="border border-black p-1 bg-yellow-100">YELLOW</th>
                <th colspan="3" class="border border-black p-1 bg-gray-50">WHITE</th>
              </tr>
              <tr>
                <template v-for="n in 5" :key="n">
                  <th class="border border-black p-1 text-center text-[10px]">
                    Area Harvested (ha)
                  </th>
                  <th class="border border-black p-1 text-center text-[10px]">Ave Yield (MT/ha)</th>
                  <th class="border border-black p-1 text-center text-[10px]">Production (MT)</th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr v-if="selectedMunicipality" class="bg-teal-50">
                <td :colspan="16" class="border border-black p-1 font-bold">
                  {{ selectedMunicipality.toUpperCase() }}
                </td>
              </tr>
              <template v-if="Object.keys(processedData).length">
                <tr v-for="(data, barangay) in processedData" :key="barangay">
                  <td class="border border-black p-1">{{ barangay }}</td>
                  <!-- HYBRID YELLOW -->
                  <td class="border border-black p-1 text-right">
                    {{ formatNumber(data.hybrid.yellow.area) }}
                  </td>
                  <td class="border border-black p-1 text-right">
                    {{ formatNumber(data.hybrid.yellow.averageYield) }}
                  </td>
                  <td class="border border-black p-1 text-right">
                    {{ formatNumber(data.hybrid.yellow.production) }}
                  </td>
                  <!-- GREEN CORN/SWEET CORN WHITE -->
                  <td class="border border-black p-1 text-right">
                    {{ formatNumber(data.greenCornSweetCorn.white.area) }}
                  </td>
                  <td class="border border-black p-1 text-right">
                    {{ formatNumber(data.greenCornSweetCorn.white.averageYield) }}
                  </td>
                  <td class="border border-black p-1 text-right">
                    {{ formatNumber(data.greenCornSweetCorn.white.production) }}
                  </td>
                  <!-- TRADITIONAL WHITE -->
                  <td class="border border-black p-1 text-right">
                    {{ formatNumber(data.traditional.white.area) }}
                  </td>
                  <td class="border border-black p-1 text-right">
                    {{ formatNumber(data.traditional.white.averageYield) }}
                  </td>
                  <td class="border border-black p-1 text-right">
                    {{ formatNumber(data.traditional.white.production) }}
                  </td>
                  <!-- TOTAL YELLOW -->
                  <td class="border border-black p-1 text-right">
                    {{ formatNumber(data.hybrid.yellow.area) }}
                  </td>
                  <td class="border border-black p-1 text-right">
                    {{ formatNumber(data.hybrid.yellow.averageYield) }}
                  </td>
                  <td class="border border-black p-1 text-right">
                    {{ formatNumber(data.hybrid.yellow.production) }}
                  </td>
                  <!-- TOTAL WHITE -->
                  <td class="border border-black p-1 text-right">
                    {{
                      formatNumber(data.greenCornSweetCorn.white.area + data.traditional.white.area)
                    }}
                  </td>
                  <td class="border border-black p-1 text-right">
                    {{
                      formatNumber(
                        calculateAverageYield(
                          data.greenCornSweetCorn.white.production +
                            data.traditional.white.production,
                          data.greenCornSweetCorn.white.area + data.traditional.white.area,
                        ),
                      )
                    }}
                  </td>
                  <td class="border border-black p-1 text-right">
                    {{
                      formatNumber(
                        data.greenCornSweetCorn.white.production +
                          data.traditional.white.production,
                      )
                    }}
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td colspan="16" class="text-center py-4 border border-black">
                  No data available for {{ selectedMunicipality }}
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
        <h1 class="text-xl font-bold">CORN HARVEST REPORT</h1>
        <h2 class="text-xl font-bold">MONTHLY HARVEST ACCOMPLISHMENT REPORT</h2>
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
            <th rowspan="3" class="border p-2">MUNICIPALITY</th>
            <th colspan="3" class="border p-2">HYBRID</th>
            <th colspan="3" class="border p-2">GREEN CORN/SWEET CORN</th>
            <th colspan="3" class="border p-2">TRADITIONAL</th>
            <th colspan="6" class="border p-2">TOTAL</th>
          </tr>
          <tr>
            <th colspan="3" class="border p-2 bg-yellow-100">YELLOW</th>
            <th colspan="3" class="border p-2 bg-yellow-50">WHITE</th>
            <th colspan="3" class="border p-2 bg-gray-50">WHITE</th>
            <th colspan="3" class="border p-2 bg-yellow-100">YELLOW</th>
            <th colspan="3" class="border p-2 bg-gray-50">WHITE</th>
          </tr>
          <tr>
            <template v-for="n in 5" :key="n">
              <th class="border p-2 text-center text-[10px]">Area Harvested (ha)</th>
              <th class="border p-2 text-center text-[10px]">Ave Yield (MT/ha)</th>
              <th class="border p-2 text-center text-[10px]">Production (MT)</th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr v-if="selectedMunicipality" class="bg-teal-50">
            <td colspan="16" class="border p-2 font-bold">
              {{ selectedMunicipality.toUpperCase() }}
            </td>
          </tr>
          <template v-if="Object.keys(processedData).length">
            <tr v-for="(data, barangay) in processedData" :key="barangay">
              <td class="border p-2">{{ barangay }}</td>
              <!-- HYBRID YELLOW -->
              <td class="border p-2 text-right">{{ formatNumber(data.hybrid.yellow.area) }}</td>
              <td class="border p-2 text-right">
                {{ formatNumber(data.hybrid.yellow.averageYield) }}
              </td>
              <td class="border p-2 text-right">
                {{ formatNumber(data.hybrid.yellow.production) }}
              </td>
              <!-- GREEN CORN/SWEET CORN WHITE -->
              <td class="border p-2 text-right">
                {{ formatNumber(data.greenCornSweetCorn.white.area) }}
              </td>
              <td class="border p-2 text-right">
                {{ formatNumber(data.greenCornSweetCorn.white.averageYield) }}
              </td>
              <td class="border p-2 text-right">
                {{ formatNumber(data.greenCornSweetCorn.white.production) }}
              </td>
              <!-- TRADITIONAL WHITE -->
              <td class="border p-2 text-right">{{ formatNumber(data.traditional.white.area) }}</td>
              <td class="border p-2 text-right">
                {{ formatNumber(data.traditional.white.averageYield) }}
              </td>
              <td class="border p-2 text-right">
                {{ formatNumber(data.traditional.white.production) }}
              </td>
              <!-- TOTAL YELLOW -->
              <td class="border p-2 text-right">{{ formatNumber(data.hybrid.yellow.area) }}</td>
              <td class="border p-2 text-right">
                {{ formatNumber(data.hybrid.yellow.averageYield) }}
              </td>
              <td class="border p-2 text-right">
                {{ formatNumber(data.hybrid.yellow.production) }}
              </td>
              <!-- TOTAL WHITE -->
              <td class="border p-2 text-right">
                {{ formatNumber(data.greenCornSweetCorn.white.area + data.traditional.white.area) }}
              </td>
              <td class="border p-2 text-right">
                {{
                  formatNumber(
                    calculateAverageYield(
                      data.greenCornSweetCorn.white.production + data.traditional.white.production,
                      data.greenCornSweetCorn.white.area + data.traditional.white.area,
                    ),
                  )
                }}
              </td>
              <td class="border p-2 text-right">
                {{
                  formatNumber(
                    data.greenCornSweetCorn.white.production + data.traditional.white.production,
                  )
                }}
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="16" class="text-center py-4 border border-black">
              No data available for {{ selectedMunicipality }}
            </td>
          </tr>
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
          <p>Noted by:</p>
          <div class="mt-8 border-t border-black"></div>
          <p class="font-bold">VANESSA TAYABA</p>
          <p class="text-sm">Municipal Agricultural Officer</p>
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
  }

  /* First column (MUNICIPALITY) alignment */
  .report-table th:first-child,
  .report-table td:first-child {
    text-align: left !important;
  }

  /* Other columns remain centered */
  .report-table th:not(:first-child),
  .report-table td:not(:first-child) {
    text-align: center !important;
  }

  /* Colors with proper contrast */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .bg-yellow-100 {
    background-color: #fff5e6 !important;
    color: black !important;
  }
  .bg-green-100 {
    background-color: #dcfce7 !important;
    color: black !important;
  }
  .bg-blue-100 {
    background-color: #dbeafe !important;
    color: black !important;
  }
  .bg-gray-50 {
    background-color: #f8f9fa !important;
    color: black !important;
  }
  .bg-teal-50 {
    background-color: #f0fdfa !important;
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
