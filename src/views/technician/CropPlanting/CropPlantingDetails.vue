<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast/use-toast'
import {
  PencilIcon,
  Trash2Icon,
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  Wheat,
  LayersIcon,
  Loader2Icon,
  UserIcon,
  SproutIcon,
  LeafIcon,
  CompassIcon,
  CopyIcon,
  HomeIcon,
  BuildingIcon,
  CalendarDaysIcon,
  SquareIcon,
  ScaleIcon,
  WalletIcon,
  MessageSquareIcon,
  ListIcon,
  TagIcon,
  DropletIcon,
  LandmarkIcon,
} from 'lucide-vue-next'
import { format } from 'date-fns'
import axiosInstance from '@/lib/axios'
import { useQuery, useMutation } from '@tanstack/vue-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import InspectionSection from './components/InspectionSection.vue'
import HarvestSection from './components/HarvestSection.vue'
import SummarySection from './components/SummarySection.vue'

// Fix Leaflet's default icon path issues
const fixLeafletIcon = () => {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
  })
}

const route = useRoute()
const router = useRouter()
const { toast } = useToast()

const plantingId = route.params.id
const showDeleteDialog = ref(false)

// Fetch planting details
const { data: planting, isLoading: isLoadingPlanting } = useQuery({
  queryKey: ['planting', plantingId],
  queryFn: async () => {
    const response = await axiosInstance.get(`/api/crop-plantings/${plantingId}`)
    return response.data.data
  },
})

// Delete planting mutation
const { mutate: deletePlanting, isPending: isDeleting } = useMutation({
  mutationFn: async () => {
    return await axiosInstance.delete(`/api/crop-plantings/${plantingId}`)
  },
  onSuccess: () => {
    toast({
      title: 'Success',
      description: 'Crop planting record deleted successfully.',
    })
    router.push({ name: 'crop-planting-management' })
  },
  onError: (error) => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.response?.data?.message || 'Failed to delete crop planting record.',
    })
  },
})

const confirmDelete = () => {
  showDeleteDialog.value = true
}

const handleDelete = () => {
  deletePlanting()
}

// Status badge color mapping
const getStatusColor = (status) => {
  const colors = {
    standing: 'bg-yellow-500',
    harvest: 'bg-green-500',
    'partially harvested': 'bg-blue-500',
    harvested: 'bg-gray-500',
  }
  return colors[status] || 'bg-gray-500'
}

// Map related refs
const zoom = ref(13)
const center = computed(() => {
  if (planting.value?.latitude && planting.value?.longitude) {
    return [parseFloat(planting.value.latitude), parseFloat(planting.value.longitude)]
  }
  return [13.4417, 121.9032] // Default center (Marinduque)
})

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    toast({
      title: 'Copied',
      description: 'Coordinates copied to clipboard.',
    })
  })
}

onMounted(() => {
  fixLeafletIcon()
})
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 pb-4"
    >
      <div class="flex items-center gap-4">
        <Button
          @click="router.back()"
          variant="ghost"
          class="rounded-full hover:bg-primary/10 transition-colors"
        >
          <ArrowLeftIcon class="w-4 h-4" />
        </Button>
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-primary">Crop Planting Details</h1>
          <p class="text-sm text-muted-foreground mt-1" v-if="planting?.updated_at">
            Last updated:
            {{
              planting.updated_at ? format(new Date(planting.updated_at), 'MMMM d, yyyy') : 'N/A'
            }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Button
          @click="router.push({ name: 'crop-planting-edit', params: { id: plantingId } })"
          variant="outline"
          class="gap-2 hover:border-primary/50 transition-colors"
        >
          <PencilIcon class="w-4 h-4" />
          Edit Details
        </Button>
        <Button
          @click="confirmDelete"
          variant="destructive"
          :disabled="isDeleting"
          class="gap-2 hover:bg-destructive/90 transition-colors"
        >
          <Trash2Icon class="w-4 h-4" />
          {{ isDeleting ? 'Deleting...' : 'Delete' }}
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingPlanting" class="flex items-center justify-center min-h-[400px]">
      <div class="flex flex-col items-center gap-2">
        <div
          class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
        ></div>
        <p class="text-muted-foreground">Loading planting details...</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="planting" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Basic Information -->
      <Card
        class="lg:col-span-2 group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-primary/5 to-transparent border-border/50 hover:border-primary/20"
      >
        <CardHeader class="border-b">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Wheat class="w-5 h-5 text-primary" />
              <CardTitle class="text-lg">Basic Information</CardTitle>
            </div>
            <div
              :class="{
                'px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5': true,
                'bg-yellow-100 text-yellow-800': planting.status === 'standing',
                'bg-green-100 text-green-800': planting.status === 'harvested',
                'bg-blue-100 text-blue-800': planting.status === 'partially harvested',
                'bg-primary/10 text-primary': planting.status === 'harvest',
              }"
            >
              <span class="relative flex h-2 w-2">
                <span
                  :class="{
                    'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75': true,
                    'bg-yellow-400': planting.status === 'standing',
                    'bg-green-400': planting.status === 'harvested',
                    'bg-blue-400': planting.status === 'partially harvested',
                    'bg-primary': planting.status === 'harvest',
                  }"
                ></span>
                <span
                  :class="{
                    'relative inline-flex rounded-full h-2 w-2': true,
                    'bg-yellow-500': planting.status === 'standing',
                    'bg-green-500': planting.status === 'harvested',
                    'bg-blue-500': planting.status === 'partially harvested',
                    'bg-primary': planting.status === 'harvest',
                  }"
                ></span>
              </span>
              {{ planting.status }}
            </div>
          </div>
        </CardHeader>
        <CardContent class="p-6">
          <div class="grid gap-6 sm:grid-cols-2">
            <!-- Farmer Info -->
            <div class="group/item hover:bg-muted/50 p-3 rounded-lg transition-colors">
              <div class="flex items-center gap-2 text-muted-foreground">
                <UserIcon class="w-4 h-4" />
                <span class="text-sm font-medium">Farmer</span>
              </div>
              <p class="mt-2 text-lg font-semibold tracking-tight">{{ planting.farmer.name }}</p>
            </div>

            <!-- Crop Info -->
            <div class="group/item hover:bg-muted/50 p-3 rounded-lg transition-colors">
              <div class="flex items-center gap-2 text-muted-foreground">
                <SproutIcon class="w-4 h-4" />
                <span class="text-sm font-medium">Crop</span>
              </div>
              <p class="mt-2 text-lg font-semibold tracking-tight">{{ planting.crop.name }}</p>
            </div>

            <!-- Variety Info -->
            <div class="group/item hover:bg-muted/50 p-3 rounded-lg transition-colors">
              <div class="flex items-center gap-2 text-muted-foreground">
                <LeafIcon class="w-4 h-4" />
                <span class="text-sm font-medium">Variety</span>
              </div>
              <p class="mt-2 text-lg font-semibold tracking-tight">{{ planting.variety.name }}</p>
            </div>

            <!-- Category Info -->
            <div class="group/item hover:bg-muted/50 p-3 rounded-lg transition-colors">
              <div class="flex items-center gap-2 text-muted-foreground">
                <LayersIcon class="w-4 h-4" />
                <span class="text-sm font-medium">Category</span>
              </div>
              <p class="mt-2 text-lg font-semibold tracking-tight">{{ planting.category.name }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Location Details -->
      <Card
        class="lg:col-span-1 group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-500/5 to-transparent border-border/50 hover:border-primary/20"
      >
        <CardHeader class="border-b">
          <div class="flex items-center gap-2">
            <MapPinIcon class="w-5 h-5 text-primary" />
            <CardTitle class="text-lg">Location Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="p-6">
          <div class="space-y-6">
            <!-- Coordinates -->
            <div class="group/item hover:bg-muted/50 p-3 rounded-lg transition-colors">
              <div class="flex items-center gap-2 text-muted-foreground">
                <CompassIcon class="w-4 h-4" />
                <span class="text-sm font-medium">Coordinates</span>
              </div>
              <div class="mt-2 flex items-center gap-2">
                <p class="text-lg font-semibold tracking-tight">
                  {{ planting.latitude }}, {{ planting.longitude }}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 opacity-0 group-hover/item:opacity-100 transition-opacity"
                  @click="copyToClipboard(`${planting.latitude}, ${planting.longitude}`)"
                  title="Copy coordinates"
                >
                  <CopyIcon class="h-4 w-4" />
                </Button>
              </div>
            </div>

            <!-- Location -->
            <div class="space-y-4">
              <div class="group/item hover:bg-muted/50 p-3 rounded-lg transition-colors">
                <div class="flex items-center gap-2 text-muted-foreground">
                  <HomeIcon class="w-4 h-4" />
                  <span class="text-sm font-medium">Barangay</span>
                </div>
                <p class="mt-2 text-lg font-semibold tracking-tight">{{ planting.barangay }}</p>
              </div>

              <div class="group/item hover:bg-muted/50 p-3 rounded-lg transition-colors">
                <div class="flex items-center gap-2 text-muted-foreground">
                  <BuildingIcon class="w-4 h-4" />
                  <span class="text-sm font-medium">Municipality</span>
                </div>
                <p class="mt-2 text-lg font-semibold tracking-tight">{{ planting.municipality }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Map View -->
      <Card
        class="lg:col-span-3 group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-500/5 to-transparent border-border/50 hover:border-primary/20"
      >
        <CardHeader class="border-b">
          <div class="flex items-center gap-2">
            <MapPinIcon class="w-5 h-5 text-primary" />
            <CardTitle class="text-lg">Location Map</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="p-6">
          <div class="relative h-[400px] rounded-lg border overflow-hidden">
            <l-map v-model:zoom="zoom" :center="center" class="h-[400px] w-full z-0">
              <l-tile-layer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                layer-type="base"
                name="OpenStreetMap"
                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              />
              <l-marker
                v-if="planting.latitude && planting.longitude"
                :lat-lng="[parseFloat(planting.latitude), parseFloat(planting.longitude)]"
              />
            </l-map>
          </div>
        </CardContent>
      </Card>

      <!-- Planting Details -->
      <Card
        class="lg:col-span-3 group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-500/5 to-transparent border-border/50 hover:border-primary/20"
      >
        <CardHeader class="border-b">
          <div class="flex items-center gap-2">
            <CalendarIcon class="w-5 h-5 text-primary" />
            <CardTitle class="text-lg">Planting Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="detail in [
                {
                  icon: CalendarIcon,
                  label: 'Planting Date',
                  value: format(new Date(planting.planting_date), 'MMMM d, yyyy'),
                },
                planting.expected_harvest_date && {
                  icon: CalendarDaysIcon,
                  label: 'Expected Harvest',
                  value: format(new Date(planting.expected_harvest_date), 'MMMM d, yyyy'),
                },
                {
                  icon: SquareIcon,
                  label: 'Area Planted',
                  value: `${planting.area_planted} hectares`,
                },
                {
                  icon: ScaleIcon,
                  label: 'Quantity',
                  value: planting.quantity,
                },
                planting.expenses && {
                  icon: WalletIcon,
                  label: 'Expenses',
                  value: `₱${planting.expenses.toLocaleString()}`,
                },
              ].filter(Boolean)"
              :key="detail.label"
              class="group/item hover:bg-muted/50 p-3 rounded-lg transition-colors"
            >
              <div class="flex items-center gap-2 text-muted-foreground">
                <component :is="detail.icon" class="w-4 h-4" />
                <span class="text-sm font-medium">{{ detail.label }}</span>
              </div>
              <p class="mt-2 text-lg font-semibold tracking-tight">{{ detail.value }}</p>
            </div>

            <!-- Remarks -->
            <div
              v-if="planting.remarks"
              class="group/item hover:bg-muted/50 p-3 rounded-lg transition-colors sm:col-span-2 lg:col-span-4"
            >
              <div class="flex items-center gap-2 text-muted-foreground">
                <MessageSquareIcon class="w-4 h-4" />
                <span class="text-sm font-medium">Remarks</span>
              </div>
              <p class="mt-2 text-base text-muted-foreground">{{ planting.remarks }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Category Specific Details -->
      <Card
        v-if="planting.hvc_detail || planting.rice_detail"
        class="lg:col-span-3 group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-500/5 to-transparent border-border/50 hover:border-primary/20"
      >
        <CardHeader class="border-b">
          <div class="flex items-center gap-2">
            <ListIcon class="w-5 h-5 text-primary" />
            <CardTitle class="text-lg">Additional Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="p-6">
          <div class="space-y-6">
            <!-- HVC Details -->
            <div
              v-if="planting.hvc_detail"
              class="group/item hover:bg-muted/50 p-3 rounded-lg transition-colors"
            >
              <div class="flex items-center gap-2 text-muted-foreground">
                <TagIcon class="w-4 h-4" />
                <span class="text-sm font-medium">HVC Classification</span>
              </div>
              <p class="mt-2 text-lg font-semibold tracking-tight">
                {{ planting.hvc_detail.classification }}
              </p>
            </div>

            <!-- Rice Details -->
            <div v-if="planting.rice_detail" class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="group/item hover:bg-muted/50 p-3 rounded-lg transition-colors">
                <div class="flex items-center gap-2 text-muted-foreground">
                  <TagIcon class="w-4 h-4" />
                  <span class="text-sm font-medium">Rice Classification</span>
                </div>
                <p class="mt-2 text-lg font-semibold tracking-tight">
                  {{ planting.rice_detail.classification }}
                </p>
              </div>

              <div class="group/item hover:bg-muted/50 p-3 rounded-lg transition-colors">
                <div class="flex items-center gap-2 text-muted-foreground">
                  <DropletIcon class="w-4 h-4" />
                  <span class="text-sm font-medium">Water Supply</span>
                </div>
                <p class="mt-2 text-lg font-semibold tracking-tight">
                  {{ planting.rice_detail.water_supply }}
                </p>
              </div>

              <div
                v-if="planting.rice_detail.land_type"
                class="group/item hover:bg-muted/50 p-3 rounded-lg transition-colors"
              >
                <div class="flex items-center gap-2 text-muted-foreground">
                  <LandmarkIcon class="w-4 h-4" />
                  <span class="text-sm font-medium">Land Type</span>
                </div>
                <p class="mt-2 text-lg font-semibold tracking-tight">
                  {{ planting.rice_detail.land_type }}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Summary Section -->
      <SummarySection
        v-if="planting.status === 'harvested'"
        :planting-id="plantingId"
        :planting="planting"
      />

      <!-- Inspections Section -->
      <InspectionSection v-if="planting" :planting-id="plantingId" :planting="planting" />

      <!-- Harvest Reports Section -->
      <HarvestSection :planting-id="plantingId" :planting="planting" />
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2 text-lg font-semibold text-destructive">
            <Trash2Icon class="w-5 h-5" />
            Delete Crop Planting
          </DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground mt-2">
            Are you sure you want to delete this crop planting record? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="mt-4">
          <Button
            variant="ghost"
            @click="showDeleteDialog = false"
            class="hover:bg-muted/10 transition-colors"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            :disabled="isDeleting"
            @click="handleDelete"
            class="hover:bg-destructive/90 transition-colors gap-2"
          >
            <Loader2Icon v-if="isDeleting" class="h-4 w-4 animate-spin" />
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
