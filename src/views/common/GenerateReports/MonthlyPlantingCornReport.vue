<template>
  <div class="screen-only">
    <!-- Controls -->
    <div class="flex flex-col gap-6">
      <div class="flex justify-between items-center">
        <h2
          class="text-xl sm:text-2xl lg:text-3xl flex items-center gap-2 font-extrabold text-primary break-words"
        >
          <FileText class="h-6 w-6 text-primary flex-shrink-0" />
          <span class="min-w-0">Monthly Corn Planting Report</span>
        </h2>
        <Button @click="printReport" variant="outline" class="hidden md:flex items-center gap-2">
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
          <!-- Header -->
          <div class="text-center mb-6">
            <h1 class="text-xl font-bold text-foreground">CORN PROGRAM</h1>
            <h2 class="text-lg font-bold text-foreground">
              MONTHLY PLANTING ACCOMPLISHMENT REPORT
            </h2>
            <p class="text-sm text-foreground">For the Month of: {{ currentDate }}</p>
            <div class="mt-4 text-left">
              <p class="font-semibold text-foreground">REGION: IVB</p>
              <p class="font-semibold text-foreground">PROVINCE: MARINDUQUE</p>
              <div class="flex gap-4 mt-2">
                <div class="flex items-center gap-2">
                  <input type="checkbox" id="january-june" />
                  <label for="january-june">JANUARY - JUNE</label>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" id="july-december" />
                  <label for="july-december">JULY - DECEMBER</label>
                </div>
              </div>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full border-collapse border-2 text-xs">
              <thead>
                <tr>
                  <th colspan="5" class="border p-2 text-center">As of {{ currentDate }}</th>
                </tr>
                <tr>
                  <th rowspan="2" class="border p-2">MUNICIPALITY</th>
                  <th rowspan="2" class="border p-2 text-center">
                    VARIETY (GMO, HYBRID,<br />
                    OPV, GREEN CORN/SWEET<br />
                    CORN, TRADITIONAL)
                  </th>
                  <th class="border p-2 text-center">Yellow</th>
                  <th class="border p-2 text-center">White</th>
                  <th class="border p-2 text-center">Total</th>
                </tr>
                <tr>
                  <th class="border p-2 text-center">Area Planted (ha)</th>
                  <th class="border p-2 text-center">Area Planted (ha)</th>
                  <th class="border p-2 text-center">Area Planted (ha)</th>
                </tr>
              </thead>
              <tbody>
                <!-- Municipality row with blue background -->
                <tr class="bg-blue-100">
                  <td colspan="5" class="border p-2 font-bold">
                    {{ selectedMunicipality.toUpperCase() }}
                  </td>
                </tr>
                <template v-if="Object.keys(processedData).length">
                  <template v-for="(barangayData, barangay) in processedData" :key="barangay">
                    <!-- Barangay Header -->
                    <tr>
                      <td class="border p-2">{{ barangay }}</td>
                      <td class="border p-2"></td>
                      <td class="border p-2"></td>
                      <td class="border p-2"></td>
                      <td class="border p-2 text-right">{{ formatNumber(barangayData.total) }}</td>
                    </tr>

                    <!-- Yellow Corn Entries -->
                    <template
                      v-for="(variety, varietyName) in barangayData.Yellow"
                      :key="`${barangay}-Yellow-${varietyName}`"
                    >
                      <template
                        v-for="(entry, index) in variety.entries"
                        :key="`${barangay}-Yellow-${varietyName}-${index}`"
                      >
                        <tr v-if="Number(entry.area) > 0">
                          <td class="border p-2 pl-8">{{ entry.farmer }}</td>
                          <td class="border p-2">{{ varietyName }}</td>
                          <td class="border p-2 text-right">
                            {{ formatNumber(Number(entry.area)) }}
                          </td>
                          <td class="border p-2"></td>
                          <td class="border p-2"></td>
                        </tr>
                      </template>
                    </template>

                    <!-- White Corn Entries -->
                    <template
                      v-for="(variety, varietyName) in barangayData.White"
                      :key="`${barangay}-White-${varietyName}`"
                    >
                      <template
                        v-for="(entry, index) in variety.entries"
                        :key="`${barangay}-White-${varietyName}-${index}`"
                      >
                        <tr v-if="Number(entry.area) > 0">
                          <td class="border p-2 pl-8">{{ entry.farmer }}</td>
                          <td class="border p-2">{{ varietyName }}</td>
                          <td class="border p-2"></td>
                          <td class="border p-2 text-right">
                            {{ formatNumber(Number(entry.area)) }}
                          </td>
                          <td class="border p-2"></td>
                        </tr>
                      </template>
                    </template>
                  </template>

                  <!-- Updated Grand Total Row -->
                  <tr class="font-bold grand-total bg-green-500 text-white">
                    <td colspan="2" class="border p-2 text-right">TOTAL:</td>
                    <td class="border p-2 text-right">{{ formatNumber(yellowTotal) }}</td>
                    <td class="border p-2 text-right">{{ formatNumber(whiteTotal) }}</td>
                    <td class="border p-2 text-right">{{ formatNumber(grandTotal) }}</td>
                  </tr>
                </template>
                <tr v-else>
                  <td colspan="5" class="text-center py-4 border">
                    No data available for {{ selectedMunicipality }}
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
              <p class="text-sm">{{ user?.position || 'Corn AEW' }}</p>
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
    </div>
  </div>

  <!-- Print version -->
  <div class="print-only" v-if="reportData">
    <div id="report-content">
      <!-- Print Header -->
      <div class="text-center">
        <h1 class="text-xl font-bold">CORN PROGRAM</h1>
        <h2 class="text-xl font-bold">MONTHLY PLANTING ACCOMPLISHMENT REPORT</h2>
        <p class="text-sm">For the Month of: {{ currentDate }}</p>
        <div class="mt-4 text-left">
          <p class="font-semibold">REGION: IVB</p>
          <p class="font-semibold">PROVINCE: MARINDUQUE</p>
          <div class="flex gap-4 mt-2">
            <div class="flex items-center gap-2">
              <input type="checkbox" id="january-june" />
              <label for="january-june">JANUARY - JUNE</label>
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" id="july-december" />
              <label for="july-december">JULY - DECEMBER</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Print Table -->
      <table class="report-table">
        <thead>
          <tr>
            <th colspan="5" class="border p-2 text-center">As of {{ currentDate }}</th>
          </tr>
          <tr>
            <th rowspan="2" class="border p-2">MUNICIPALITY</th>
            <th rowspan="2" class="border p-2 text-center">
              VARIETY (GMO, HYBRID,<br />
              OPV, GREEN CORN/SWEET<br />
              CORN, TRADITIONAL)
            </th>
            <th class="border p-2 text-center">Yellow</th>
            <th class="border p-2 text-center">White</th>
            <th class="border p-2 text-center">Total</th>
          </tr>
          <tr>
            <th class="border p-2 text-center">Area Planted (ha)</th>
            <th class="border p-2 text-center">Area Planted (ha)</th>
            <th class="border p-2 text-center">Area Planted (ha)</th>
          </tr>
        </thead>
        <tbody>
          <!-- Municipality row with blue background -->
          <tr class="bg-blue-100">
            <td colspan="5" class="border p-2 font-bold">
              {{ selectedMunicipality.toUpperCase() }}
            </td>
          </tr>
          <template v-if="Object.keys(processedData).length">
            <template v-for="(barangayData, barangay) in processedData" :key="barangay">
              <!-- Barangay Header -->
              <tr>
                <td class="border p-2">{{ barangay }}</td>
                <td class="border p-2"></td>
                <td class="border p-2"></td>
                <td class="border p-2"></td>
                <td class="border p-2 text-right">{{ formatNumber(barangayData.total) }}</td>
              </tr>

              <!-- Yellow Corn Entries -->
              <template
                v-for="(variety, varietyName) in barangayData.Yellow"
                :key="`${barangay}-Yellow-${varietyName}`"
              >
                <template
                  v-for="(entry, index) in variety.entries"
                  :key="`${barangay}-Yellow-${varietyName}-${index}`"
                >
                  <tr v-if="Number(entry.area) > 0">
                    <td class="border p-2 pl-8">{{ entry.farmer }}</td>
                    <td class="border p-2">{{ varietyName }}</td>
                    <td class="border p-2 text-right">{{ formatNumber(Number(entry.area)) }}</td>
                    <td class="border p-2"></td>
                    <td class="border p-2"></td>
                  </tr>
                </template>
              </template>

              <!-- White Corn Entries -->
              <template
                v-for="(variety, varietyName) in barangayData.White"
                :key="`${barangay}-White-${varietyName}`"
              >
                <template
                  v-for="(entry, index) in variety.entries"
                  :key="`${barangay}-White-${varietyName}-${index}`"
                >
                  <tr v-if="Number(entry.area) > 0">
                    <td class="border p-2 pl-8">{{ entry.farmer }}</td>
                    <td class="border p-2">{{ varietyName }}</td>
                    <td class="border p-2"></td>
                    <td class="border p-2 text-right">{{ formatNumber(Number(entry.area)) }}</td>
                    <td class="border p-2"></td>
                  </tr>
                </template>
              </template>
            </template>

            <!-- Updated Grand Total Row -->
            <tr class="font-bold grand-total bg-green-500 text-white">
              <td colspan="2" class="border p-2 text-right">TOTAL:</td>
              <td class="border p-2 text-right">{{ formatNumber(yellowTotal) }}</td>
              <td class="border p-2 text-right">{{ formatNumber(whiteTotal) }}</td>
              <td class="border p-2 text-right">{{ formatNumber(grandTotal) }}</td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="5" class="text-center py-4 border">
              No data available for {{ selectedMunicipality }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Print Signatures -->
      <div class="mt-12 flex justify-between">
        <div class="w-48">
          <p>Prepared by:</p>
          <div class="mt-8 border-t border-black"></div>
          <p class="font-bold">{{ user?.name?.toUpperCase() }}</p>
          <p class="text-sm">{{ user?.position || 'Corn AEW' }}</p>
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
import { useAuthStore } from '@/stores/auth'
import axiosInstance from '@/lib/axios'

const authStore = useAuthStore()
const user = authStore.user
const selectedMunicipality = ref('Boac')
const printableRef = ref(null)
const notedByName = ref('VANESSA TAYABA')
const notedByTitle = ref('Municipal Agricultural Officer')

const currentDate = new Date().toLocaleDateString('en-US', {
  month: 'long',
  year: 'numeric',
})

const {
  data: reportData,
  isLoading,
  error,
} = useQuery({
  queryKey: ['monthly-corn-planting-report', selectedMunicipality],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/reports/corn-planting/monthly', {
      params: {
        municipality: selectedMunicipality.value,
      },
    })
    return response.data
  },
  staleTime: 1000 * 60 * 5,
})

const processedData = computed(() => {
  if (!reportData.value?.data) return {}
  return reportData.value.data
})

const municipalities = computed(() => {
  return (
    reportData.value?.municipalities || [
      'Boac',
      'Buenavista',
      'Gasan',
      'Mogpog',
      'Santa Cruz',
      'Torrijos',
    ]
  )
})

const grandTotal = computed(() => {
  if (!processedData.value) return 0
  return Object.values(processedData.value).reduce(
    (sum, barangay) => sum + (barangay.total || 0),
    0,
  )
})

const yellowTotal = computed(() => {
  if (!processedData.value) return 0
  return Object.values(processedData.value).reduce((sum, barangay) => {
    const yellowVarieties = barangay.Yellow || {}
    return (
      sum +
      Object.values(yellowVarieties).reduce(
        (varietySum, variety) => varietySum + (variety.area || 0),
        0,
      )
    )
  }, 0)
})

const whiteTotal = computed(() => {
  if (!processedData.value) return 0
  return Object.values(processedData.value).reduce((sum, barangay) => {
    const whiteVarieties = barangay.White || {}
    return (
      sum +
      Object.values(whiteVarieties).reduce(
        (varietySum, variety) => varietySum + (variety.area || 0),
        0,
      )
    )
  }, 0)
})

function formatNumber(value) {
  if (!value || value === 0) return ''
  return Number(value).toFixed(4)
}

function generateRandomFilename() {
  const timestamp = new Date().toISOString().slice(0, 10)
  const uuid = crypto.randomUUID()
  return `corn-planting-report_${timestamp}_${uuid}`
}

function printReport() {
  const filename = generateRandomFilename()
  document.title = filename
  window.print()
  setTimeout(() => {
    document.title = 'Monthly Corn Planting Report'
  }, 1000)
}
</script>

<style scoped>
/* Regular styles */
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
    width: 8.5in !important;
    height: 14in !important;
    padding: 0.5in !important;
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

  /* First column alignment */
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

  .bg-blue-100 {
    background-color: #dbeafe !important;
    color: black !important;
  }

  .bg-green-500 {
    background-color: #22c55e !important;
    color: white !important;
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
