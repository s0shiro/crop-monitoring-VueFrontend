<script setup>
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Printer, Loader2Icon, AlertCircle } from 'lucide-vue-next'
import { useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axios'

const authStore = useAuthStore()
const user = authStore.user

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
  queryKey: ['rice-standing-report'],
  queryFn: async () => {
    const response = await axiosInstance.get('/api/reports/rice-standing')
    return response.data
  },
  staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
})

function getValue(municipality, category, stage) {
  if (!reportData.value?.data?.[municipality]?.[category]) return 0
  return stage === 'TOTAL'
    ? reportData.value.data[municipality][category].total || 0
    : reportData.value.data[municipality][category][stage] || 0
}

function formatValue(value) {
  if (!value || value === 0) return ''
  return value.toFixed(4)
}

function getHeaderClass(category) {
  return {
    'bg-amber-50': category === 'irrigated',
    'bg-blue-50': category === 'rainfed',
    'bg-green-50': category === 'upland',
  }
}

function getCellClass(category) {
  return getHeaderClass(category)
}

function generateRandomFilename() {
  const timestamp = new Date().toISOString().slice(0, 10)
  const uuid = crypto.randomUUID()
  return `rice-harvest-report_${timestamp}_${uuid}`
}

function printReport() {
  // Set filename for print
  const filename = generateRandomFilename()
  document.title = filename
  window.print()
  // Reset document title after printing
  setTimeout(() => {
    document.title = 'Rice Standing Report'
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
          Rice Standing Report
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
          <h1 class="text-xl font-bold text-foreground">RICE STANDING CROP REPORT</h1>
          <p class="text-sm text-foreground">As of {{ currentDate }}</p>
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
                <th rowspan="2" class="border p-2">MUNICIPALITY</th>
                <template v-for="category in reportData.categories" :key="category">
                  <th :colspan="5" class="border p-2 text-center" :class="getHeaderClass(category)">
                    {{ category.toUpperCase() }} (ha)
                  </th>
                </template>
              </tr>
              <tr>
                <template v-for="category in reportData.categories" :key="category">
                  <template v-for="stage in reportData.stages" :key="stage">
                    <th class="border p-2 text-center text-sm" :class="getCellClass(category)">
                      {{ stage }}
                    </th>
                  </template>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="municipality in reportData.municipalities"
                :key="municipality"
                :class="{ 'font-bold bg-gray-50': municipality === 'Marinduque' }"
              >
                <td class="border p-2">{{ municipality }}</td>
                <template v-for="category in reportData.categories" :key="category">
                  <template v-for="stage in reportData.stages" :key="stage">
                    <td class="border p-2 text-center">
                      {{ formatValue(getValue(municipality, category, stage)) }}
                    </td>
                  </template>
                </template>
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
  <div class="print-only">
    <div id="report-content">
      <!-- Header -->
      <div class="text-center mb-6">
        <h1 class="text-xl font-bold">RICE STANDING CROP REPORT</h1>
        <p class="text-sm">As of {{ currentDate }}</p>
        <div class="mt-4 text-left">
          <p class="font-semibold">REGION: IV - MIMAROPA</p>
          <p class="font-semibold">PROVINCE: MARINDUQUE</p>
        </div>
      </div>

      <!-- Table -->
      <table class="report-table">
        <thead>
          <tr>
            <th rowspan="2" class="border p-2">MUNICIPALITY</th>
            <template v-for="category in reportData?.categories" :key="category">
              <th :colspan="5" class="border p-2 text-center" :class="getHeaderClass(category)">
                {{ category.toUpperCase() }} (ha)
              </th>
            </template>
          </tr>
          <tr>
            <template v-for="category in reportData?.categories" :key="category">
              <template v-for="stage in reportData?.stages" :key="stage">
                <th class="border p-2 text-center text-sm" :class="getCellClass(category)">
                  {{ stage }}
                </th>
              </template>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="municipality in reportData?.municipalities"
            :key="municipality"
            :class="{ 'font-bold bg-gray-50': municipality === 'Marinduque' }"
          >
            <td class="border p-2">{{ municipality }}</td>
            <template v-for="category in reportData?.categories" :key="category">
              <template v-for="stage in reportData?.stages" :key="stage">
                <td class="border p-2 text-center">
                  {{ formatValue(getValue(municipality, category, stage)) }}
                </td>
              </template>
            </template>
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

/* Screen-only styles */
.screen-only .report-table {
  table-layout: fixed; /* Fixed layout for better width control on screen */
  font-size: 0.75rem; /* Smaller font for screen */
}

.screen-only .report-table th,
.screen-only .report-table td {
  font-size: 0.75rem;
  padding: 0.25rem;
  text-align: center;
  vertical-align: middle;
}

/* First column (MUNICIPALITY) on screen */
.screen-only .report-table th:first-child,
.screen-only .report-table td:first-child {
  width: 8rem;
  text-align: left;
}

/* Category headers (IRRIGATED, RAINFED, UPLAND) on screen */
.screen-only .report-table th[colspan='5'] {
  font-weight: bold;
  height: 2rem;
}

/* Each stage column on screen */
.screen-only .report-table th:not(:first-child):not([colspan]) {
  width: 4rem;
  white-space: normal;
  word-break: break-word;
  font-weight: normal;
}

/* Data cells on screen */
.screen-only .report-table td:not(:first-child) {
  width: 4rem;
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
  /* Reset table styles for printing */
  .report-table {
    table-layout: auto !important;
    font-size: unset !important;
    width: 100% !important;
  }

  .report-table th,
  .report-table td {
    max-width: none !important;
    width: auto !important;
    word-wrap: normal !important;
    padding: 0.25rem !important;
  }

  .report-table th:first-child,
  .report-table td:first-child {
    width: auto !important;
  }

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

  #report-content p.text-sm {
    color: black !important;
  }

  #report-content .font-semibold {
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
    font-size: 10pt !important;
    color: black !important;
  }

  /* Make header cells taller */
  .report-table th {
    padding: 8px 6px !important;
  }

  /* Colors with proper contrast */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .bg-amber-50 {
    background-color: #fff5e6 !important;
    color: black !important;
  }
  .bg-blue-50 {
    background-color: #e6f3ff !important;
    color: black !important;
  }
  .bg-green-50 {
    background-color: #e6ffe6 !important;
    color: black !important;
  }
  .bg-gray-50 {
    background-color: #f8f9fa !important;
    color: black !important;
  }

  /* Signature section */
  .mt-12 {
    margin-top: 20pt !important;
  }

  /* Signature text */
  .mt-12 p,
  .mt-12 .font-bold,
  .mt-12 .text-sm {
    color: black !important;
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
