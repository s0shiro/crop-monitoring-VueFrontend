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
import { format } from 'date-fns'

const authStore = useAuthStore()
const user = authStore.user

const municipalities = ['Boac', 'Buenavista', 'Gasan', 'Mogpog', 'Santa Cruz', 'Torrijos']
const waterSupplyTypes = ['total', 'irrigated', 'rainfed', 'upland']

const selectedMunicipality = ref('Boac')
const selectedWaterSupply = ref('total')
const startDate = ref(format(new Date(), 'yyyy-MM-01'))
const endDate = ref(format(new Date(), 'yyyy-MM-dd'))

// Fetch report data using Tanstack Query
const {
  data: reportData,
  isLoading,
  error,
  refetch,
} = useQuery({
  queryKey: [
    'rice-harvest-report',
    selectedMunicipality.value,
    selectedWaterSupply.value,
    startDate.value,
    endDate.value,
  ],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/reports/rice-harvest', {
      params: {
        municipality: selectedMunicipality.value,
        water_supply: selectedWaterSupply.value,
        start_date: startDate.value,
        end_date: endDate.value,
      },
    })
    return response.data
  },
  staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
})

function formatValue(value) {
  if (!value || value === 0) return ''
  return value.toFixed(3)
}

function getHeaderClass(supply) {
  return {
    'bg-amber-50': supply === 'irrigated',
    'bg-blue-50': supply === 'rainfed',
    'bg-green-50': supply === 'upland',
    'bg-gray-50': supply === 'total',
  }
}

function printReport() {
  window.print()
}

async function applyFilters() {
  await refetch()
}
</script>

<template>
  <!-- Screen version -->
  <div class="screen-only">
    <!-- Controls -->
    <div class="bg-card text-card-foreground rounded-lg shadow">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold flex items-center gap-2 text-foreground">
          <FileText class="h-5 w-5" />
          Rice Harvesting Report
        </h2>
        <Button @click="printReport" variant="default" class="flex items-center gap-2">
          <Printer class="h-4 w-4" />
          Print Report
        </Button>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <Label class="text-foreground">Municipality</Label>
            <Select v-model="selectedMunicipality">
              <SelectTrigger class="w-full">
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
            <Label class="text-foreground">Water Supply Type</Label>
            <Select v-model="selectedWaterSupply">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select water supply type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="type in waterSupplyTypes" :key="type" :value="type">
                  {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <Label class="text-foreground">Date Range</Label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label class="text-xs text-muted-foreground">Start Date</Label>
                <Input type="date" v-model="startDate" />
              </div>
              <div>
                <Label class="text-xs text-muted-foreground">End Date</Label>
                <Input type="date" v-model="endDate" :min="startDate" />
              </div>
            </div>
          </div>

          <Button @click="applyFilters" class="w-full" variant="default">Apply Filters</Button>
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
    <div v-else-if="reportData" class="printable-report">
      <div id="report-content" class="text-card-foreground">
        <!-- Header -->
        <div class="text-center mb-6">
          <h1 class="text-xl font-bold text-foreground">RICE HARVESTING REPORT</h1>
          <h2 class="text-xl font-bold text-foreground">HARVESTING ACCOMPLISHMENT REPORT</h2>
          <p class="text-lg font-bold text-foreground">{{ reportData.meta.season_year }}</p>
          <p class="text-sm text-foreground">For the Month of: {{ reportData.meta.date_range }}</p>
          <div class="mt-4 text-left">
            <p class="font-semibold text-foreground">REGION: IV - MIMAROPA</p>
            <p class="font-semibold text-foreground">PROVINCE: MARINDUQUE</p>
            <p class="font-semibold text-foreground">
              MUNICIPALITY: {{ reportData.meta.municipality.toUpperCase() }}
            </p>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="report-table">
            <thead>
              <tr>
                <th rowspan="3" class="border p-2 min-w-[120px]">BARANGAY</th>
                <th rowspan="3" class="border p-2">No. of Farmer Harvested</th>
                <th
                  colspan="18"
                  class="border text-center"
                  :class="getHeaderClass(selectedWaterSupply)"
                >
                  {{ selectedWaterSupply.toUpperCase() }}
                </th>
              </tr>
              <tr>
                <th
                  v-for="type in [
                    'HYBRID SEEDS',
                    'REGISTERED SEEDS',
                    'CERTIFIED SEEDS',
                    'GOOD QUALITY SEEDS',
                    'FARMER SAVED SEEDS',
                    'TOTAL',
                  ]"
                  :key="type"
                  colspan="3"
                  class="border text-center"
                >
                  {{ type }}
                </th>
              </tr>
              <tr>
                <template v-for="i in 6" :key="i">
                  <th class="border text-center">Area<br />(ha)</th>
                  <th class="border text-center">Average Yield<br />(mt/ha)</th>
                  <th class="border text-center">Production<br />(mt)</th>
                </template>
              </tr>
            </thead>
            <tbody>
              <template v-if="Object.keys(reportData.data).length">
                <tr v-for="(barangayData, barangay) in reportData.data" :key="barangay">
                  <td class="border p-2">{{ barangay }}</td>
                  <td class="border text-center">{{ barangayData.noOfFarmerHarvested }}</td>
                  <!-- Hybrid Seeds -->
                  <td class="border text-center">
                    {{ formatValue(barangayData.hybridSeeds.area) }}
                  </td>
                  <td class="border text-center">
                    {{ formatValue(barangayData.hybridSeeds.averageYield) }}
                  </td>
                  <td class="border text-center">
                    {{ formatValue(barangayData.hybridSeeds.production) }}
                  </td>
                  <!-- Registered Seeds -->
                  <td class="border text-center">
                    {{ formatValue(barangayData.registeredSeeds.area) }}
                  </td>
                  <td class="border text-center">
                    {{ formatValue(barangayData.registeredSeeds.averageYield) }}
                  </td>
                  <td class="border text-center">
                    {{ formatValue(barangayData.registeredSeeds.production) }}
                  </td>
                  <!-- Certified Seeds -->
                  <td class="border text-center">
                    {{ formatValue(barangayData.certifiedSeeds.area) }}
                  </td>
                  <td class="border text-center">
                    {{ formatValue(barangayData.certifiedSeeds.averageYield) }}
                  </td>
                  <td class="border text-center">
                    {{ formatValue(barangayData.certifiedSeeds.production) }}
                  </td>
                  <!-- Good Quality Seeds -->
                  <td class="border text-center">
                    {{ formatValue(barangayData.goodQualitySeeds.area) }}
                  </td>
                  <td class="border text-center">
                    {{ formatValue(barangayData.goodQualitySeeds.averageYield) }}
                  </td>
                  <td class="border text-center">
                    {{ formatValue(barangayData.goodQualitySeeds.production) }}
                  </td>
                  <!-- Farmer Saved Seeds -->
                  <td class="border text-center">
                    {{ formatValue(barangayData.farmerSavedSeeds.area) }}
                  </td>
                  <td class="border text-center">
                    {{ formatValue(barangayData.farmerSavedSeeds.averageYield) }}
                  </td>
                  <td class="border text-center">
                    {{ formatValue(barangayData.farmerSavedSeeds.production) }}
                  </td>
                  <!-- Total -->
                  <td class="border text-center">
                    {{
                      formatValue(
                        Object.values(barangayData).reduce(
                          (sum, type) => sum + (type.area || 0),
                          0,
                        ),
                      )
                    }}
                  </td>
                  <td class="border text-center">
                    {{
                      formatValue(
                        Object.values(barangayData).reduce(
                          (sum, type) => sum + (type.averageYield || 0),
                          0,
                        ) / 5,
                      )
                    }}
                  </td>
                  <td class="border text-center">
                    {{
                      formatValue(
                        Object.values(barangayData).reduce(
                          (sum, type) => sum + (type.production || 0),
                          0,
                        ),
                      )
                    }}
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td colspan="20" class="border text-center py-4">
                  No harvesting data available for {{ selectedMunicipality }}
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
            <p class="font-bold">VANESSA TAYABA</p>
            <p class="text-sm text-muted-foreground">Municipal Agricultural Officer</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Print version - absolutely positioned outside of Vue layout -->
  <div class="print-only" v-if="reportData">
    <div id="report-content">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-xl font-bold">RICE HARVESTING REPORT</h1>
        <h2 class="text-xl font-bold">HARVESTING ACCOMPLISHMENT REPORT</h2>
        <p class="text-lg font-bold">{{ reportData.meta.season_year }}</p>
        <p class="text-sm">For the Month of: {{ reportData.meta.date_range }}</p>
        <div class="mt-4 text-left">
          <p class="font-semibold">REGION: IV - MIMAROPA</p>
          <p class="font-semibold">PROVINCE: MARINDUQUE</p>
          <p class="font-semibold">
            MUNICIPALITY: {{ reportData.meta.municipality.toUpperCase() }}
          </p>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="report-table">
          <thead>
            <tr>
              <th rowspan="3" class="border p-2 min-w-[120px]">BARANGAY</th>
              <th rowspan="3" class="border p-2">No. of Farmer Harvested</th>
              <th
                colspan="18"
                class="border text-center"
                :class="getHeaderClass(selectedWaterSupply)"
              >
                {{ selectedWaterSupply.toUpperCase() }}
              </th>
            </tr>
            <tr>
              <th
                v-for="type in [
                  'HYBRID SEEDS',
                  'REGISTERED SEEDS',
                  'CERTIFIED SEEDS',
                  'GOOD QUALITY SEEDS',
                  'FARMER SAVED SEEDS',
                  'TOTAL',
                ]"
                :key="type"
                colspan="3"
                class="border text-center"
              >
                {{ type }}
              </th>
            </tr>
            <tr>
              <template v-for="i in 6" :key="i">
                <th class="border text-center">Area<br />(ha)</th>
                <th class="border text-center">Average Yield<br />(mt/ha)</th>
                <th class="border text-center">Production<br />(mt)</th>
              </template>
            </tr>
          </thead>
          <tbody>
            <template v-if="Object.keys(reportData.data).length">
              <tr v-for="(barangayData, barangay) in reportData.data" :key="barangay">
                <td class="border p-2">{{ barangay }}</td>
                <td class="border text-center">{{ barangayData.noOfFarmerHarvested }}</td>
                <!-- Hybrid Seeds -->
                <td class="border text-center">{{ formatValue(barangayData.hybridSeeds.area) }}</td>
                <td class="border text-center">
                  {{ formatValue(barangayData.hybridSeeds.averageYield) }}
                </td>
                <td class="border text-center">
                  {{ formatValue(barangayData.hybridSeeds.production) }}
                </td>
                <!-- Registered Seeds -->
                <td class="border text-center">
                  {{ formatValue(barangayData.registeredSeeds.area) }}
                </td>
                <td class="border text-center">
                  {{ formatValue(barangayData.registeredSeeds.averageYield) }}
                </td>
                <td class="border text-center">
                  {{ formatValue(barangayData.registeredSeeds.production) }}
                </td>
                <!-- Certified Seeds -->
                <td class="border text-center">
                  {{ formatValue(barangayData.certifiedSeeds.area) }}
                </td>
                <td class="border text-center">
                  {{ formatValue(barangayData.certifiedSeeds.averageYield) }}
                </td>
                <td class="border text-center">
                  {{ formatValue(barangayData.certifiedSeeds.production) }}
                </td>
                <!-- Good Quality Seeds -->
                <td class="border text-center">
                  {{ formatValue(barangayData.goodQualitySeeds.area) }}
                </td>
                <td class="border text-center">
                  {{ formatValue(barangayData.goodQualitySeeds.averageYield) }}
                </td>
                <td class="border text-center">
                  {{ formatValue(barangayData.goodQualitySeeds.production) }}
                </td>
                <!-- Farmer Saved Seeds -->
                <td class="border text-center">
                  {{ formatValue(barangayData.farmerSavedSeeds.area) }}
                </td>
                <td class="border text-center">
                  {{ formatValue(barangayData.farmerSavedSeeds.averageYield) }}
                </td>
                <td class="border text-center">
                  {{ formatValue(barangayData.farmerSavedSeeds.production) }}
                </td>
                <!-- Total -->
                <td class="border text-center">
                  {{
                    formatValue(
                      Object.values(barangayData).reduce((sum, type) => sum + (type.area || 0), 0),
                    )
                  }}
                </td>
                <td class="border text-center">
                  {{
                    formatValue(
                      Object.values(barangayData).reduce(
                        (sum, type) => sum + (type.averageYield || 0),
                        0,
                      ) / 5,
                    )
                  }}
                </td>
                <td class="border text-center">
                  {{
                    formatValue(
                      Object.values(barangayData).reduce(
                        (sum, type) => sum + (type.production || 0),
                        0,
                      ),
                    )
                  }}
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="20" class="border text-center py-4">
                No harvesting data available for {{ selectedMunicipality }}
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
          <p class="font-bold">VANESSA TAYABA</p>
          <p class="text-sm">Municipal Agricultural Officer</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Regular styles */
.printable-report {
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  padding: 2rem;
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
  font-size: 0.75rem;
  color: hsl(var(--foreground));
}

/* Screen styles */
.screen-only {
  display: block;
}

.print-only {
  display: none;
}

/* Print styles only */
@media print {
  /* Hide screen version but maintain text visibility */
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
    height: 11in !important;
    margin: 0 !important;
    padding: 0 !important;
    z-index: 99999 !important;
    background: white !important;
    overflow: hidden !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
  }

  .print-only * {
    visibility: visible !important;
    color: black !important;
  }

  #report-content {
    transform: rotate(90deg);
    transform-origin: center center;
    width: 11in !important;
    height: 8.5in !important;
    padding: 0.25in !important;
    margin: 0 auto !important;
    background: white !important;
    visibility: visible !important;
    color: black !important;
  }

  #report-content * {
    visibility: visible !important;
    color: black !important;
  }

  /* Header text sizes */
  #report-content h1 {
    font-size: 14px !important;
  }

  #report-content h2 {
    font-size: 14px !important;
  }

  #report-content p {
    font-size: 12px !important;
  }

  /* Signature section */
  #report-content .mt-12 p {
    font-size: 11px !important;
    margin-bottom: 0 !important;
  }

  #report-content .mt-12 .font-bold {
    font-size: 12px !important;
  }

  #report-content .mt-12 .text-sm {
    font-size: 10px !important;
  }

  /* Table styles */
  .report-table {
    width: 100% !important;
    border-collapse: collapse !important;
    table-layout: fixed !important;
    font-size: 10px !important;
    margin: 0 !important;
    color: black !important;
  }

  .report-table th,
  .report-table td {
    border: 1px solid black !important;
    padding: 2px !important;
    font-size: 10px !important;
    color: black !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  /* Colors and backgrounds */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .bg-amber-50 {
    background-color: #fff5e6 !important;
  }
  .bg-blue-50 {
    background-color: #e6f3ff !important;
  }
  .bg-green-50 {
    background-color: #e6ffe6 !important;
  }
  .bg-gray-50 {
    background-color: #f8f9fa !important;
  }

  /* Hide screen elements */
  .screen-only {
    display: none !important;
  }

  /* Page settings */
  @page {
    size: portrait;
    margin: 0;
  }
}
</style>
