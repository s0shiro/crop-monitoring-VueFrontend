<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Map, Globe2 } from 'lucide-vue-next'
import L from '@/lib/leaflet'

// Define the props the component will accept
const props = defineProps({
  heatmapData: {
    type: Object,
    required: true,
  },
})

// Reference to the map element
const mapElement = ref(null)
// Store the leaflet map instance
const map = ref(null)
// Store the heatmap layer
const heatmapLayer = ref(null)
// Currently selected category
const selectedCategory = ref('')
// Store all categories from data
const categories = ref([])

// Extract all available categories from the data
const extractCategories = () => {
  if (!props.heatmapData) return

  categories.value = Object.keys(props.heatmapData)
  // Set the first category as selected by default if none is selected
  if (categories.value.length > 0 && !selectedCategory.value) {
    selectedCategory.value = categories.value[0]
  }
}

// Compute the current data points based on selected category
const currentDataPoints = computed(() => {
  if (!props.heatmapData || !selectedCategory.value) return []

  const categoryData = props.heatmapData[selectedCategory.value] || []

  // Find the maximum weight in this category to normalize values
  let maxWeight = 0
  categoryData.forEach((point) => {
    if (point.weight > maxWeight) maxWeight = point.weight
  })

  return categoryData.map((point) => ({
    lat: point.location.lat,
    lng: point.location.lng,
    // Enhance the intensity by multiplying the weight value to make it more visible
    // We'll use a square root scale to make smaller values more visible
    intensity: Math.sqrt(point.weight) * 10 + 10, // Add base value and scale up
  }))
})

// Get an array of locations for the current category
const getLocations = () => {
  return currentDataPoints.value.map((point) => [point.lat, point.lng, point.intensity])
}

// Initialize the Leaflet map
const initializeMap = () => {
  if (!mapElement.value) return

  // Destroy previous map if it exists
  if (map.value) {
    map.value.remove()
    map.value = null
  }

  // Create new map centered on Marinduque
  map.value = L.map(mapElement.value, {
    zoomControl: false, // We'll add zoom control in a better position for mobile
    attributionControl: false, // We'll add attribution in a better position
  }).setView([13.4016, 122.0069], 10)

  // Add zoom control to the top-right corner
  L.control
    .zoom({
      position: 'topright',
    })
    .addTo(map.value)

  // Add attribution control to the bottom-right corner
  L.control
    .attribution({
      position: 'bottomright',
      prefix: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    })
    .addTo(map.value)

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map.value)

  // Add a legend control
  addLegend()

  // Update the heatmap
  updateHeatmap()

  // Handle responsiveness on window resize
  window.addEventListener('resize', () => {
    if (map.value) {
      map.value.invalidateSize()
    }
  })
}

// Add a color legend to the map
const addLegend = () => {
  if (!map.value) return

  const legend = L.control({ position: 'bottomright' })

  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'legend')
    const colors = ['#0000ff', '#00ff00', '#ffff00', '#ff0000']
    const labels = ['Low', '', '', 'High']

    div.style.backgroundColor = 'white'
    div.style.padding = '10px'
    div.style.borderRadius = '5px'
    div.style.border = '1px solid #ccc'
    div.style.opacity = '0.9'
    div.style.fontSize = '12px'
    div.style.maxWidth = '120px'

    div.innerHTML +=
      '<h4 style="margin:0 0 8px 0;font-size:13px;font-weight:500;">Planted Area</h4>'

    // Add colored boxes for each color in the gradient
    for (let i = 0; i < colors.length; i++) {
      div.innerHTML +=
        '<div style="display:flex;align-items:center;margin-bottom:3px;">' +
        `<span style="display:inline-block;width:16px;height:12px;background:${colors[i]};margin-right:5px;"></span>` +
        `<span style="font-size:11px;">${labels[i]}</span>` +
        '</div>'
    }

    return div
  }

  legend.addTo(map.value)
}

// Update the heatmap with current data
const updateHeatmap = () => {
  if (!map.value) return

  // Remove previous heatmap layer if exists
  if (heatmapLayer.value) {
    map.value.removeLayer(heatmapLayer.value)
  }

  // Clear existing markers if any
  clearMarkers()

  const locations = getLocations()
  const originalData = props.heatmapData[selectedCategory.value] || []

  if (locations.length === 0) return

  // Create heatmap layer with current locations
  heatmapLayer.value = L.heatLayer(locations, {
    radius: 35, // Increase radius for more visibility
    blur: 20, // Increase blur for smoother transitions
    maxZoom: 17,
    max: Math.max(...locations.map((loc) => loc[2])) * 0.7, // Reduce the max value to intensify colors
    minOpacity: 0.5, // Set minimum opacity to ensure visibility
    gradient: { 0.3: 'blue', 0.5: 'lime', 0.7: 'yellow', 1.0: 'red' }, // Adjusted gradient for better visibility
  }).addTo(map.value)

  // Add clickable markers for each data point
  addLocationMarkers(originalData)

  // Adjust map view to show all points if needed
  if (locations.length > 1) {
    const bounds = L.latLngBounds(locations.map((loc) => [loc[0], loc[1]]))
    map.value.fitBounds(bounds, { padding: [50, 50] })
  }
}

// Reference to store markers
const markers = ref([])

// Clear all markers from the map
const clearMarkers = () => {
  markers.value.forEach((marker) => {
    if (map.value) map.value.removeLayer(marker)
  })
  markers.value = []
}

// Add clickable markers for each location
const addLocationMarkers = (data) => {
  if (!map.value || !data) return

  // Detect if device is likely mobile (simplistic check based on screen width)
  const isMobile = window.innerWidth < 768

  data.forEach((point) => {
    // Create an invisible marker at each location that's clickable
    // Make the marker area larger on mobile for easier touch interaction
    const markerRadius = isMobile ? 15 : 10

    const marker = L.circleMarker([point.location.lat, point.location.lng], {
      radius: markerRadius,
      fillColor: 'transparent',
      fillOpacity: 0,
      stroke: false,
      interactive: true,
    }).addTo(map.value)

    // Create popup content with responsive sizing
    const popupContent = `
      <div style="min-width: ${isMobile ? '180px' : '200px'};">
        <h5 style="margin: 0 0 8px 0; font-weight: 600; font-size: ${isMobile ? '14px' : '15px'};">${selectedCategory.value}</h5>
        <div style="margin-bottom: 4px; font-size: ${isMobile ? '12px' : '13px'};">
          <span style="font-weight: 500;">Municipality:</span> ${point.municipality}
        </div>
        <div style="margin-bottom: 4px; font-size: ${isMobile ? '12px' : '13px'};">
          <span style="font-weight: 500;">Barangay:</span> ${point.barangay || 'N/A'}
        </div>
        <div style="margin-bottom: 4px; font-size: ${isMobile ? '12px' : '13px'};">
          <span style="font-weight: 500;">Planted Area:</span> ${point.weight.toFixed(2)} hectares
        </div>
        <div style="font-size: ${isMobile ? '12px' : '13px'};">
          <span style="font-weight: 500;">Number of Plantings:</span> ${point.count}
        </div>
      </div>
    `

    // Create popup options with mobile considerations
    const popupOptions = {
      closeButton: true,
      autoPan: true,
      autoClose: true,
      closeOnEscapeKey: true,
      className: 'custom-popup',
    }

    // Bind popup to marker
    marker.bindPopup(popupContent, popupOptions)

    // Store marker reference
    markers.value.push(marker)
  })
}

// Watch for changes in selected category and update the heatmap
watch(selectedCategory, () => {
  updateHeatmap()
})

// Watch for changes in the heatmap data
watch(
  () => props.heatmapData,
  () => {
    extractCategories()
    updateHeatmap()
  },
  { deep: true },
)

// Initialize when component is mounted
onMounted(() => {
  extractCategories()
  setTimeout(() => {
    initializeMap()
  }, 100) // Short delay to ensure DOM is ready
})
</script>

<template>
  <div class="space-y-4 w-full">
    <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
      <Globe2 class="h-5 w-5 text-primary" />
      Marinduque Crop Heatmap
    </h3>

    <Card class="overflow-hidden transition-all hover:shadow-lg w-full">
      <div class="p-4 sm:p-6 w-full">
        <div class="mb-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <p class="text-sm text-muted-foreground">
            Heat map showing crop distribution in Marinduque for the current year
          </p>

          <div v-if="categories.length > 0" class="flex flex-wrap gap-2 sm:gap-3">
            <RadioGroup v-model="selectedCategory" class="flex flex-wrap gap-2 sm:gap-3">
              <div
                v-for="category in categories"
                :key="category"
                class="flex items-center space-x-2"
              >
                <RadioGroupItem :value="category" :id="`cat-${category}`" />
                <Label
                  :for="`cat-${category}`"
                  class="cursor-pointer font-medium text-sm sm:text-base"
                  >{{ category }}</Label
                >
              </div>
            </RadioGroup>
          </div>
        </div>

        <div
          v-if="!props.heatmapData || Object.keys(props.heatmapData).length === 0"
          class="h-[400px] md:h-[500px] flex items-center justify-center bg-muted/20 rounded-lg"
        >
          <p class="text-muted-foreground">No heatmap data available for Marinduque</p>
        </div>
        <div
          v-else
          ref="mapElement"
          class="h-[400px] md:h-[500px] rounded-lg shadow-sm border map-container max-w-full"
        ></div>

        <div v-if="categories.length > 0" class="mt-4 text-sm text-muted-foreground">
          <p>
            Click on any location on the map to view detailed information about the plantings in
            that area.
          </p>
        </div>
      </div>
    </Card>
  </div>
</template>

<style scoped>
/* Add custom styles for the map container */
:deep(.leaflet-container) {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    sans-serif;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.leaflet-popup-content) {
  margin: 12px 16px;
  line-height: 1.5;
}

/* Fix z-index issues */
.map-container {
  position: relative;
  z-index: 0; /* Keep the map container at a low z-index */
  overflow: hidden; /* Prevent map overflow */
  width: 100%; /* Ensure map takes full width of container */
  max-width: 100%; /* Prevent overflow */
}

:deep(.leaflet-pane) {
  z-index: 1; /* Adjust base pane z-index */
}

:deep(.leaflet-top),
:deep(.leaflet-bottom) {
  z-index: 10; /* Lower z-index for controls */
}

:deep(.leaflet-popup) {
  z-index: 20; /* Higher z-index for popups */
}

/* Responsive design for controls */
@media (max-width: 640px) {
  :deep(.leaflet-control-zoom),
  :deep(.legend) {
    /* Make controls more touch-friendly on small screens */
    margin-right: 10px !important;
  }

  :deep(.leaflet-control-zoom a) {
    width: 36px !important;
    height: 36px !important;
    line-height: 36px !important;
    font-size: 18px !important;
  }

  :deep(.legend) {
    padding: 8px !important;
    max-width: 80% !important;
  }
}
</style>
