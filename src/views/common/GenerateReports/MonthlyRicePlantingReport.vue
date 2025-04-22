<script setup>
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Printer, Loader2Icon, AlertCircle } from 'lucide-vue-next'
import { useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axios'
import { computed } from 'vue'

const authStore = useAuthStore()
const user = authStore.user

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
  queryKey: ['monthly-rice-planting-report'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/reports/rice-planting/monthly')
    return response.data
  },
  staleTime: 1000 * 60 * 5,
})

// Process data into the required format for the table
const municipalities = computed(() => {
  // Return a default structure if no data is available
  if (!reportData.value?.data) {
    return {
      municipalities: {
        Marinduque: {
          farmers: 0,
          irrigated: { hybrid: 0, registered: 0, certified: 0, goodQuality: 0, farmersSaved: 0 },
          rainfedLowland: {
            hybrid: 0,
            registered: 0,
            certified: 0,
            goodQuality: 0,
            farmersSaved: 0,
          },
          rainfedUpland: {
            hybrid: 0,
            registered: 0,
            certified: 0,
            goodQuality: 0,
            farmersSaved: 0,
          },
        },
      },
      orderedMunicipalities: ['Marinduque'],
    }
  }

  // Define ordered municipalities
  const orderedMunicipalities = [
    'Marinduque', // Total row
    'Boac',
    'Buenavista',
    'Gasan',
    'Mogpog',
    'Santa Cruz',
    'Torrijos',
  ]

  // Initialize data structure for municipalities
  const municipalityData = {}
  orderedMunicipalities.forEach((municipality) => {
    municipalityData[municipality] = {
      farmers:
        municipality === 'Marinduque'
          ? Object.values(reportData.value?.farmer_counts || {}).reduce((a, b) => a + b, 0)
          : reportData.value?.farmer_counts?.[municipality] || 0,
      irrigated: { hybrid: 0, registered: 0, certified: 0, goodQuality: 0, farmersSaved: 0 },
      rainfedLowland: { hybrid: 0, registered: 0, certified: 0, goodQuality: 0, farmersSaved: 0 },
      rainfedUpland: { hybrid: 0, registered: 0, certified: 0, goodQuality: 0, farmersSaved: 0 },
    }
  })

  // Process the data for each municipality
  reportData.value.data.forEach((planting) => {
    if (!planting?.location_id?.municipality) return // Skip if municipality is undefined

    const municipality = planting.location_id.municipality
    const areaPlanted = parseFloat(planting.area_planted) || 0
    const waterSupply = planting.category_specific?.waterSupply
    const landType = planting.category_specific?.landType
    const classification = planting.category_specific?.classification

    if (!waterSupply || !landType || !classification) return // Skip if required data is missing

    // Map classification to key
    let classificationKey
    switch (classification.toLowerCase()) {
      case 'hybrid':
        classificationKey = 'hybrid'
        break
      case 'registered':
        classificationKey = 'registered'
        break
      case 'certified':
        classificationKey = 'certified'
        break
      case 'good quality':
        classificationKey = 'goodQuality'
        break
      case 'farmer saved seeds':
        classificationKey = 'farmersSaved'
        break
      default:
        classificationKey = 'farmersSaved'
    }

    // Update municipality data
    if (waterSupply === 'irrigated') {
      municipalityData[municipality].irrigated[classificationKey] += areaPlanted
      // Update Marinduque total
      municipalityData['Marinduque'].irrigated[classificationKey] += areaPlanted
    } else if (waterSupply === 'rainfed') {
      const category = landType === 'lowland' ? 'rainfedLowland' : 'rainfedUpland'
      municipalityData[municipality][category][classificationKey] += areaPlanted
      // Update Marinduque total
      municipalityData['Marinduque'][category][classificationKey] += areaPlanted
    }
  })

  return { municipalities: municipalityData, orderedMunicipalities }
})

function formatValue(value) {
  if (!value || value === 0) return ''
  return Number(value).toFixed(4)
}

function renderTotalsRow() {
  if (!municipalities.value.municipalities['Marinduque']) return []

  const { irrigated, rainfedLowland, rainfedUpland } =
    municipalities.value.municipalities['Marinduque']
  const irrigatedTotal = Object.values(irrigated).reduce((a, b) => a + b, 0)
  const rainfedTotalLowland = Object.values(rainfedLowland).reduce((a, b) => a + b, 0)
  const rainfedTotalUpland = Object.values(rainfedUpland).reduce((a, b) => a + b, 0)

  return [
    irrigated.hybrid,
    irrigated.registered,
    irrigated.certified,
    irrigated.goodQuality,
    irrigated.farmersSaved,
    irrigatedTotal,
    rainfedLowland.hybrid,
    rainfedLowland.registered,
    rainfedLowland.certified,
    rainfedLowland.goodQuality,
    rainfedLowland.farmersSaved,
    rainfedUpland.hybrid,
    rainfedUpland.registered,
    rainfedUpland.certified,
    rainfedUpland.goodQuality,
    rainfedUpland.farmersSaved,
    rainfedTotalLowland + rainfedTotalUpland,
  ]
}

function renderMunicipalityRow(municipalityData) {
  const { irrigated, rainfedLowland, rainfedUpland } = municipalityData
  const irrigatedTotal = Object.values(irrigated).reduce((a, b) => a + b, 0)
  const rainfedTotalLowland = Object.values(rainfedLowland).reduce((a, b) => a + b, 0)
  const rainfedTotalUpland = Object.values(rainfedUpland).reduce((a, b) => a + b, 0)

  return [
    irrigated.hybrid,
    irrigated.registered,
    irrigated.certified,
    irrigated.goodQuality,
    irrigated.farmersSaved,
    irrigatedTotal,
    rainfedLowland.hybrid,
    rainfedLowland.registered,
    rainfedLowland.certified,
    rainfedLowland.goodQuality,
    rainfedLowland.farmersSaved,
    rainfedUpland.hybrid,
    rainfedUpland.registered,
    rainfedUpland.certified,
    rainfedUpland.goodQuality,
    rainfedUpland.farmersSaved,
    rainfedTotalLowland + rainfedTotalUpland,
  ]
}

function generateRandomFilename() {
  const timestamp = new Date().toISOString().slice(0, 10)
  const uuid = crypto.randomUUID()
  return `rice-planting-report_${timestamp}_${uuid}`
}

function printReport() {
  // Set filename for print
  const filename = generateRandomFilename()
  document.title = filename
  window.print()
  // Reset document title after printing
  setTimeout(() => {
    document.title = 'Monthly Rice Planting Report'
  }, 1000)
}
</script>

<template>
  <!-- Screen version -->
  <div class="screen-only p-4">
    <!-- Controls -->
    <div class="bg-card text-card-foreground rounded-lg shadow p-4 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold flex items-center gap-2 text-foreground">
          <FileText class="h-5 w-5" />
          Monthly Rice Planting Report
        </h2>
        <Button @click="printReport" variant="default" class="flex items-center gap-2">
          <Printer class="h-4 w-4" />
          Print Report
        </Button>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
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
    <div v-else-if="reportData" class="printable-report">
      <div id="report-content" class="text-card-foreground">
        <!-- Header -->
        <div class="text-center mb-6">
          <h1 class="text-xl font-bold text-foreground">RICE PLANTING REPORT</h1>
          <h2 class="text-lg font-bold text-foreground">MONTHLY PLANTING ACCOMPLISHMENT REPORT</h2>
          <p class="text-sm text-foreground">For the Month of: {{ currentDate }}</p>
          <div class="mt-4 text-left">
            <p class="font-semibold text-foreground">REGION: IV - MIMAROPA</p>
            <p class="font-semibold text-foreground">PROVINCE: MARINDUQUE</p>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="report-table">
            <thead>
              <tr>
                <th rowspan="3" class="border p-2">MUNICIPALITY</th>
                <th rowspan="3" class="border p-2">NO. OF FARMERS PLANTED</th>
                <th class="irrigated border p-2" colspan="6">IRRIGATED</th>
                <th class="rainfed border p-2" colspan="11">RAINFED</th>
              </tr>
              <tr>
                <th class="irrigated border p-2" rowspan="2">HYBRID</th>
                <th class="irrigated border p-2" rowspan="2">REGISTERED</th>
                <th class="irrigated border p-2" rowspan="2">CERTIFIED</th>
                <th class="irrigated border p-2" rowspan="2">GOOD QUALITY</th>
                <th class="irrigated border p-2" rowspan="2">FARMER SAVED SEEDS</th>
                <th class="irrigated border p-2" rowspan="2">TOTAL</th>
                <th class="rainfed-lowland border p-2" colspan="5">LOWLAND</th>
                <th class="rainfed-upland border p-2" colspan="6">UPLAND</th>
              </tr>
              <tr>
                <th class="rainfed-lowland border p-2">HYBRID</th>
                <th class="rainfed-lowland border p-2">REGISTERED</th>
                <th class="rainfed-lowland border p-2">CERTIFIED</th>
                <th class="rainfed-lowland border p-2">GOOD QUALITY</th>
                <th class="rainfed-lowland border p-2">FARMER SAVED SEEDS</th>
                <th class="rainfed-upland border p-2">HYBRID</th>
                <th class="rainfed-upland border p-2">REGISTERED</th>
                <th class="rainfed-upland border p-2">CERTIFIED</th>
                <th class="rainfed-upland border p-2">GOOD QUALITY</th>
                <th class="rainfed-upland border p-2">FARMER SAVED SEEDS</th>
                <th class="rainfed-upland border p-2">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <!-- Municipality Rows -->
              <template v-if="municipalities?.orderedMunicipalities">
                <tr
                  v-for="municipality in municipalities.orderedMunicipalities"
                  :key="municipality"
                  :class="{ 'font-bold bg-gray-50': municipality === 'Marinduque' }"
                >
                  <td class="border p-2">{{ municipality }}</td>
                  <td class="border text-center">
                    {{ municipalities.municipalities[municipality]?.farmers || 0 }}
                  </td>
                  <!-- Irrigated Fields -->
                  <td class="border text-center">
                    {{ formatValue(municipalities.municipalities[municipality]?.irrigated.hybrid) }}
                  </td>
                  <td class="border text-center">
                    {{
                      formatValue(municipalities.municipalities[municipality]?.irrigated.registered)
                    }}
                  </td>
                  <td class="border text-center">
                    {{
                      formatValue(municipalities.municipalities[municipality]?.irrigated.certified)
                    }}
                  </td>
                  <td class="border text-center">
                    {{
                      formatValue(
                        municipalities.municipalities[municipality]?.irrigated.goodQuality,
                      )
                    }}
                  </td>
                  <td class="border text-center">
                    {{
                      formatValue(
                        municipalities.municipalities[municipality]?.irrigated.farmersSaved,
                      )
                    }}
                  </td>
                  <td class="border text-center">
                    {{
                      formatValue(
                        Object.values(
                          municipalities.municipalities[municipality]?.irrigated || {},
                        ).reduce((a, b) => a + b, 0),
                      )
                    }}
                  </td>

                  <!-- Rainfed Lowland Fields -->
                  <td class="border text-center">
                    {{
                      formatValue(
                        municipalities.municipalities[municipality]?.rainfedLowland.hybrid,
                      )
                    }}
                  </td>
                  <td class="border text-center">
                    {{
                      formatValue(
                        municipalities.municipalities[municipality]?.rainfedLowland.registered,
                      )
                    }}
                  </td>
                  <td class="border text-center">
                    {{
                      formatValue(
                        municipalities.municipalities[municipality]?.rainfedLowland.certified,
                      )
                    }}
                  </td>
                  <td class="border text-center">
                    {{
                      formatValue(
                        municipalities.municipalities[municipality]?.rainfedLowland.goodQuality,
                      )
                    }}
                  </td>
                  <td class="border text-center">
                    {{
                      formatValue(
                        municipalities.municipalities[municipality]?.rainfedLowland.farmersSaved,
                      )
                    }}
                  </td>

                  <!-- Rainfed Upland Fields -->
                  <td class="border text-center">
                    {{
                      formatValue(municipalities.municipalities[municipality]?.rainfedUpland.hybrid)
                    }}
                  </td>
                  <td class="border text-center">
                    {{
                      formatValue(
                        municipalities.municipalities[municipality]?.rainfedUpland.registered,
                      )
                    }}
                  </td>
                  <td class="border text-center">
                    {{
                      formatValue(
                        municipalities.municipalities[municipality]?.rainfedUpland.certified,
                      )
                    }}
                  </td>
                  <td class="border text-center">
                    {{
                      formatValue(
                        municipalities.municipalities[municipality]?.rainfedUpland.goodQuality,
                      )
                    }}
                  </td>
                  <td class="border text-center">
                    {{
                      formatValue(
                        municipalities.municipalities[municipality]?.rainfedUpland.farmersSaved,
                      )
                    }}
                  </td>

                  <!-- Total Rainfed -->
                  <td class="border text-center">
                    {{
                      formatValue(
                        Object.values(
                          municipalities.municipalities[municipality]?.rainfedLowland || {},
                        ).reduce((a, b) => a + b, 0) +
                          Object.values(
                            municipalities.municipalities[municipality]?.rainfedUpland || {},
                          ).reduce((a, b) => a + b, 0),
                      )
                    }}
                  </td>
                </tr>
              </template>
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

  <!-- Print version -->
  <div class="print-only" v-if="reportData">
    <div id="report-content">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-xl font-bold">RICE PLANTING REPORT</h1>
        <h2 class="text-lg font-bold">MONTHLY PLANTING ACCOMPLISHMENT REPORT</h2>
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
            <th rowspan="3" class="border p-2">NO. OF FARMERS PLANTED</th>
            <th class="irrigated border p-2" colspan="6">IRRIGATED</th>
            <th class="rainfed border p-2" colspan="11">RAINFED</th>
          </tr>
          <tr>
            <th class="irrigated border p-2" rowspan="2">HYBRID</th>
            <th class="irrigated border p-2" rowspan="2">REGISTERED</th>
            <th class="irrigated border p-2" rowspan="2">CERTIFIED</th>
            <th class="irrigated border p-2" rowspan="2">GOOD QUALITY</th>
            <th class="irrigated border p-2" rowspan="2">FARMER SAVED SEEDS</th>
            <th class="irrigated border p-2" rowspan="2">TOTAL</th>
            <th class="rainfed-lowland border p-2" colspan="5">LOWLAND</th>
            <th class="rainfed-upland border p-2" colspan="6">UPLAND</th>
          </tr>
          <tr>
            <th class="rainfed-lowland border p-2">HYBRID</th>
            <th class="rainfed-lowland border p-2">REGISTERED</th>
            <th class="rainfed-lowland border p-2">CERTIFIED</th>
            <th class="rainfed-lowland border p-2">GOOD QUALITY</th>
            <th class="rainfed-lowland border p-2">FARMER SAVED SEEDS</th>
            <th class="rainfed-upland border p-2">HYBRID</th>
            <th class="rainfed-upland border p-2">REGISTERED</th>
            <th class="rainfed-upland border p-2">CERTIFIED</th>
            <th class="rainfed-upland border p-2">GOOD QUALITY</th>
            <th class="rainfed-upland border p-2">FARMER SAVED SEEDS</th>
            <th class="rainfed-upland border p-2">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <!-- Municipality Rows -->
          <template v-if="municipalities?.orderedMunicipalities">
            <tr
              v-for="municipality in municipalities.orderedMunicipalities"
              :key="municipality"
              :class="{ 'font-bold bg-gray-50': municipality === 'Marinduque' }"
            >
              <td class="border p-2">{{ municipality }}</td>
              <td class="border text-center">
                {{ municipalities.municipalities[municipality]?.farmers || 0 }}
              </td>
              <!-- Irrigated Fields -->
              <td class="border text-center">
                {{ formatValue(municipalities.municipalities[municipality]?.irrigated.hybrid) }}
              </td>
              <td class="border text-center">
                {{ formatValue(municipalities.municipalities[municipality]?.irrigated.registered) }}
              </td>
              <td class="border text-center">
                {{ formatValue(municipalities.municipalities[municipality]?.irrigated.certified) }}
              </td>
              <td class="border text-center">
                {{
                  formatValue(municipalities.municipalities[municipality]?.irrigated.goodQuality)
                }}
              </td>
              <td class="border text-center">
                {{
                  formatValue(municipalities.municipalities[municipality]?.irrigated.farmersSaved)
                }}
              </td>
              <td class="border text-center">
                {{
                  formatValue(
                    Object.values(
                      municipalities.municipalities[municipality]?.irrigated || {},
                    ).reduce((a, b) => a + b, 0),
                  )
                }}
              </td>

              <!-- Rainfed Lowland Fields -->
              <td class="border text-center">
                {{
                  formatValue(municipalities.municipalities[municipality]?.rainfedLowland.hybrid)
                }}
              </td>
              <td class="border text-center">
                {{
                  formatValue(
                    municipalities.municipalities[municipality]?.rainfedLowland.registered,
                  )
                }}
              </td>
              <td class="border text-center">
                {{
                  formatValue(municipalities.municipalities[municipality]?.rainfedLowland.certified)
                }}
              </td>
              <td class="border text-center">
                {{
                  formatValue(
                    municipalities.municipalities[municipality]?.rainfedLowland.goodQuality,
                  )
                }}
              </td>
              <td class="border text-center">
                {{
                  formatValue(
                    municipalities.municipalities[municipality]?.rainfedLowland.farmersSaved,
                  )
                }}
              </td>

              <!-- Rainfed Upland Fields -->
              <td class="border text-center">
                {{ formatValue(municipalities.municipalities[municipality]?.rainfedUpland.hybrid) }}
              </td>
              <td class="border text-center">
                {{
                  formatValue(municipalities.municipalities[municipality]?.rainfedUpland.registered)
                }}
              </td>
              <td class="border text-center">
                {{
                  formatValue(municipalities.municipalities[municipality]?.rainfedUpland.certified)
                }}
              </td>
              <td class="border text-center">
                {{
                  formatValue(
                    municipalities.municipalities[municipality]?.rainfedUpland.goodQuality,
                  )
                }}
              </td>
              <td class="border text-center">
                {{
                  formatValue(
                    municipalities.municipalities[municipality]?.rainfedUpland.farmersSaved,
                  )
                }}
              </td>

              <!-- Total Rainfed -->
              <td class="border text-center">
                {{
                  formatValue(
                    Object.values(
                      municipalities.municipalities[municipality]?.rainfedLowland || {},
                    ).reduce((a, b) => a + b, 0) +
                      Object.values(
                        municipalities.municipalities[municipality]?.rainfedUpland || {},
                      ).reduce((a, b) => a + b, 0),
                  )
                }}
              </td>
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

.irrigated {
  background-color: #90ee90;
}

.rainfed-lowland {
  background-color: #ffd700;
}

.rainfed-upland {
  background-color: #f0e68c;
}

/* Screen-only styles - fix horizontal scrollbar */
.screen-only .report-table {
  table-layout: fixed;
}

.screen-only .report-table th,
.screen-only .report-table td {
  vertical-align: middle;
  word-break: break-word;
}

/* First two columns (Municipality & Farmers) */
.screen-only .report-table th[rowspan="3"]:first-child {
  width: 110px;
}

.screen-only .report-table th[rowspan="3"]:nth-child(2) {
  width: 70px;
}

/* Category columns */
.screen-only .report-table th[colspan="6"] {
  font-size: 0.75rem;
}

.screen-only .report-table th[colspan="11"] {
  font-size: 0.75rem;
}

.screen-only .report-table th[colspan="5"],
.screen-only .report-table th[colspan="6"] {
  font-size: 0.7rem;
}

/* Individual columns */
.screen-only .report-table th[rowspan="2"] {
  width: 40px;
  font-size: 0.65rem;
}

.screen-only .report-table th:not([rowspan]):not([colspan]) {
  width: 40px;
  font-size: 0.65rem;
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
    padding: 0.15in !important;
    margin: 0 auto !important;
    background: white !important;
    visibility: visible !important;
    color: black !important;
  }

  /* Header text */
  #report-content h1.text-xl {
    font-size: 16pt !important;
    margin-bottom: 2pt !important;
    color: black !important;
  }

  #report-content h2.text-lg {
    font-size: 14pt !important;
    margin-bottom: 2pt !important;
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

  /* Table styles - made more compact */
  .report-table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin: 12pt 0 !important;
    color: black !important;
  }

  .report-table th,
  .report-table td {
    border: 1px solid black !important;
    padding: 4px !important;
    font-size: 9pt !important;
    color: black !important;
  }

  /* Make header cells slightly taller but still compact */
  .report-table th {
    padding: 6px 4px !important;
    font-size: 9pt !important;
    font-weight: bold !important;
    line-height: 1.1 !important;
  }

  /* Colors with proper contrast */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .irrigated {
    background-color: #90ee90 !important;
    color: black !important;
  }

  .rainfed-lowland {
    background-color: #ffd700 !important;
    color: black !important;
  }

  .rainfed-upland {
    background-color: #f0e68c !important;
    color: black !important;
  }

  /* Signature section - more compact */
  .mt-12 {
    margin-top: 24pt !important;
  }

  .mt-8 {
    margin-top: 16pt !important;
  }

  .mt-4 {
    margin-top: 8pt !important;
  }

  /* Signature text */
  .mt-12 p,
  .mt-12 .font-bold,
  .mt-12 .text-sm {
    color: black !important;
    font-size: 10pt !important;
  }

  /* Adjust section spacing */
  .mb-6 {
    margin-bottom: 12pt !important;
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
