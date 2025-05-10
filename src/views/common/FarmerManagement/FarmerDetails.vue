<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast/use-toast'
import {
  Trash2Icon,
  ArrowLeftIcon,
  UserIcon,
  MapPinIcon,
  UsersIcon,
  ClipboardIcon,
  RulerIcon,
  CalendarIcon,
  BuildingIcon,
  ShieldIcon,
  AlertTriangleIcon,
  LeafIcon,
  Eye,
  PencilIcon,
} from 'lucide-vue-next'
import axiosInstance from '@/lib/axios'
import { useQuery } from '@tanstack/vue-query'
import EditFarmerModal from './EditFarmerModal.vue'
import DeleteFarmerDialog from './DeleteFarmerDialog.vue'
import { useUserAuth } from '@/composables/useUserAuth'

const route = useRoute()
const router = useRouter()
const { toast } = useToast()
const { hasPermission } = useUserAuth()

const farmerId = route.params.id
const showDeleteDialog = ref(false)
const showEditModal = ref(false)

// Fetch farmer details
const { data: farmer, isLoading: isLoadingFarmer } = useQuery({
  queryKey: ['farmer', farmerId],
  queryFn: async () => {
    try {
      const response = await axiosInstance.get(`/api/farmers/${farmerId}`)
      const data = response.data.data
      return data
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.status === 404 ? 'Farmer not found' : 'Failed to load farmer details',
      })
      router.push({ name: 'farmer-management' })
      throw error
    }
  },
})

const onFarmerDeleted = () => {
  router.push({ name: 'farmer-management' })
}

const onFarmerUpdated = (updatedFarmer) => {
  // Update the farmer data in the cache
  farmer.value = updatedFarmer
  toast({
    title: 'Success',
    description: 'Farmer information updated successfully.',
  })
}
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
          <h1 class="text-3xl font-extrabold tracking-tight text-primary">Farmer Details</h1>
          <p class="text-sm text-muted-foreground mt-1" v-if="farmer">
            Member since
            {{
              new Date(farmer.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Button
          @click="showEditModal = true"
          variant="outline"
          class="gap-2 hover:bg-primary/10 transition-colors"
        >
          <PencilIcon class="w-4 h-4" />
          Edit
        </Button>
        <Button
          v-if="hasPermission('delete_farmers')"
          @click="showDeleteDialog = true"
          variant="destructive"
          class="gap-2 hover:bg-destructive/90 transition-colors"
        >
          <Trash2Icon class="w-4 h-4" />
          Delete
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingFarmer" class="flex items-center justify-center min-h-[400px]">
      <div class="flex flex-col items-center gap-2">
        <div
          class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
        ></div>
        <p class="text-muted-foreground">Loading farmer details...</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="farmer" class="space-y-6">
      <!-- View Mode - Bento Grid Layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Name Card - Span 2 columns -->
        <Card
          class="md:col-span-2 group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-primary/5 to-transparent"
        >
          <CardContent class="p-6">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-full bg-primary/10">
                <UserIcon class="w-6 h-6 text-primary" />
              </div>
              <div>
                <p class="text-sm font-medium text-muted-foreground">Full Name</p>
                <h3 class="text-2xl font-bold text-primary mt-1">{{ farmer.name }}</h3>
                <p class="text-sm text-muted-foreground mt-2">
                  Member since
                  {{
                    new Date(farmer.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- RSBSA Card -->
        <Card
          class="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-500/5 to-transparent"
        >
          <CardContent class="p-6">
            <div class="flex flex-col h-full">
              <div class="p-2 rounded-full bg-blue-500/10 w-fit">
                <ClipboardIcon class="w-5 h-5 text-blue-500" />
              </div>
              <p class="text-sm font-medium text-muted-foreground mt-4">RSBSA Number</p>
              <p class="text-lg font-semibold mt-1">{{ farmer.rsbsa || 'Not available' }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Gender Card -->
        <Card
          class="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-500/5 to-transparent"
        >
          <CardContent class="p-6">
            <div class="flex flex-col h-full">
              <div class="p-2 rounded-full bg-green-500/10 w-fit">
                <ShieldIcon class="w-5 h-5 text-green-500" />
              </div>
              <p class="text-sm font-medium text-muted-foreground mt-4">Gender</p>
              <p class="text-lg font-semibold capitalize mt-1">{{ farmer.gender }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Location Card - Span 2 columns -->
        <Card
          class="md:col-span-2 group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-500/5 to-transparent"
        >
          <CardContent class="p-6">
            <div class="flex flex-col">
              <div class="p-2 rounded-full bg-orange-500/10 w-fit">
                <MapPinIcon class="w-5 h-5 text-orange-500" />
              </div>
              <div class="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p class="text-sm font-medium text-muted-foreground">Barangay</p>
                  <p class="text-lg font-semibold mt-1">{{ farmer.barangay }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-muted-foreground">Municipality</p>
                  <p class="text-lg font-semibold mt-1">{{ farmer.municipality }}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Land Size Card -->
        <Card
          class="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-yellow-500/5 to-transparent"
        >
          <CardContent class="p-6">
            <div class="flex flex-col h-full">
              <div class="p-2 rounded-full bg-yellow-500/10 w-fit">
                <RulerIcon class="w-5 h-5 text-yellow-500" />
              </div>
              <p class="text-sm font-medium text-muted-foreground mt-4">Land Size</p>
              <p class="text-lg font-semibold mt-1">
                {{ farmer.landsize ? `${farmer.landsize} hectares` : 'Not specified' }}
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Association Card -->
        <Card
          class="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-500/5 to-transparent"
        >
          <CardContent class="p-6">
            <div class="flex flex-col h-full">
              <div class="p-2 rounded-full bg-purple-500/10 w-fit">
                <BuildingIcon class="w-5 h-5 text-purple-500" />
              </div>
              <p class="text-sm font-medium text-muted-foreground mt-4">Farmers Association</p>
              <p class="text-lg font-semibold mt-1">
                {{ farmer.association?.name || 'Not assigned' }}
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Technical Support Card - Span full width -->
        <Card
          class="md:col-span-2 lg:col-span-4 group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-indigo-500/5 to-transparent"
        >
          <CardContent class="p-6">
            <div class="flex items-start gap-4">
              <div class="p-2 rounded-full bg-indigo-500/10">
                <UsersIcon class="w-5 h-5 text-indigo-500" />
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">Technical Support</p>
                    <p class="text-lg font-semibold mt-1">
                      {{ farmer.technician?.name || 'Not assigned' }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-muted-foreground">Last Updated</p>
                    <p class="text-sm mt-1">
                      {{
                        new Date(farmer.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Crop Plantings Section -->
        <Card
          class="md:col-span-2 lg:col-span-4 mt-6 group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-muted/20 border-border/50 hover:border-primary/20"
        >
          <CardHeader class="border-b">
            <CardTitle class="flex items-center gap-2">
              <CalendarIcon class="w-5 h-5 text-primary" />
              Crop Plantings History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-6">
              <!-- No Plantings State -->
              <div v-if="!farmer.crop_plantings?.length" class="text-center py-12">
                <div class="bg-muted/10 rounded-full p-4 w-fit mx-auto">
                  <CalendarIcon class="w-12 h-12 text-muted-foreground/30" />
                </div>
                <p class="text-muted-foreground mt-4">No crop plantings recorded yet.</p>
              </div>

              <!-- Plantings List -->
              <div v-else class="space-y-8 mt-4">
                <div v-for="planting in farmer.crop_plantings" :key="planting.id" class="relative">
                  <!-- Timeline Connector -->
                  <div
                    class="absolute left-6 top-14 bottom-0 w-0.5 bg-border -z-10"
                    v-if="!$last"
                  ></div>

                  <div class="group relative flex gap-6">
                    <!-- Timeline Dot -->
                    <div class="relative">
                      <div
                        :class="{
                          'w-12 h-12 rounded-full border-2 flex items-center justify-center': true,
                          'border-yellow-500 bg-yellow-50': planting.status === 'standing',
                          'border-green-500 bg-green-50': planting.status === 'harvested',
                          'border-blue-500 bg-blue-50': planting.status === 'partially harvested',
                          'border-primary bg-primary/5': planting.status === 'harvest',
                        }"
                      >
                        <span
                          :class="{
                            'text-sm font-medium': true,
                            'text-yellow-700': planting.status === 'standing',
                            'text-green-700': planting.status === 'harvested',
                            'text-blue-700': planting.status === 'partially harvested',
                            'text-primary': planting.status === 'harvest',
                          }"
                        >
                          {{
                            new Date(planting.planting_date).toLocaleDateString('en-US', {
                              month: 'short',
                            })
                          }}
                        </span>
                        <span
                          :class="{
                            'text-xs font-medium block -mt-1': true,
                            'text-yellow-600': planting.status === 'standing',
                            'text-green-600': planting.status === 'harvested',
                            'text-blue-600': planting.status === 'partially harvested',
                            'text-primary/80': planting.status === 'harvest',
                          }"
                        >
                          {{
                            new Date(planting.planting_date).toLocaleDateString('en-US', {
                              day: '2-digit',
                            })
                          }}
                        </span>
                      </div>
                    </div>

                    <!-- Content Card -->
                    <div
                      class="flex-1 bg-card rounded-lg border shadow-sm group-hover:shadow-md transition-all duration-200"
                    >
                      <!-- Header -->
                      <div
                        class="p-4 flex flex-wrap items-start justify-between gap-4 border-b bg-muted/5"
                      >
                        <div class="space-y-1">
                          <div class="flex items-center gap-2">
                            <h3 class="text-lg font-semibold text-primary">
                              {{ planting.category?.name }} - {{ planting.crop?.name }}
                            </h3>
                            <span class="text-sm text-muted-foreground">
                              ({{ planting.variety?.name }})
                            </span>
                          </div>
                          <p class="text-sm text-muted-foreground">
                            Maturity: {{ planting.variety?.maturity_days }} days
                          </p>
                        </div>

                        <div class="flex items-center gap-2">
                          <RouterLink
                            :to="{ name: 'crop-planting-details', params: { id: planting.id } }"
                          >
                            <Button variant="outline" class="gap-2 hover:bg-primary/5">
                              <Eye class="w-4 h-4" />
                              View Details
                            </Button>
                          </RouterLink>

                          <div
                            :class="{
                              'px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5': true,
                              'bg-yellow-100 text-yellow-800': planting.status === 'standing',
                              'bg-green-100 text-green-800': planting.status === 'harvested',
                              'bg-blue-100 text-blue-800':
                                planting.status === 'partially harvested',
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
                      </div>

                      <!-- Content -->
                      <div class="p-4 space-y-4">
                        <!-- Progress Bar -->
                        <div class="space-y-2">
                          <div class="flex justify-between text-sm">
                            <span class="text-muted-foreground">Harvest Progress</span>
                            <span class="font-medium">
                              {{
                                ((planting.harvested_area / planting.area_planted) * 100).toFixed(
                                  1,
                                )
                              }}%
                            </span>
                          </div>
                          <div class="h-2 rounded-full bg-muted/20 overflow-hidden">
                            <div
                              :style="{
                                width: `${(planting.harvested_area / planting.area_planted) * 100}%`,
                              }"
                              :class="{
                                'h-full rounded-full transition-all': true,
                                'bg-yellow-500': planting.status === 'standing',
                                'bg-green-500': planting.status === 'harvested',
                                'bg-blue-500': planting.status === 'partially harvested',
                                'bg-primary': planting.status === 'harvest',
                              }"
                            ></div>
                          </div>
                        </div>

                        <!-- Area Stats -->
                        <div
                          class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/5"
                        >
                          <div>
                            <p class="text-sm text-muted-foreground">Area Planted</p>
                            <p class="font-medium mt-0.5">{{ planting.area_planted }} ha</p>
                          </div>
                          <div>
                            <p class="text-sm text-muted-foreground">Area Harvested</p>
                            <p class="font-medium mt-0.5">{{ planting.harvested_area }} ha</p>
                          </div>
                          <div>
                            <p class="text-sm text-muted-foreground">Damaged Area</p>
                            <div class="flex items-baseline gap-1">
                              <p class="font-medium mt-0.5">{{ planting.damaged_area }} ha</p>
                              <span
                                class="text-xs text-destructive"
                                v-if="planting.damaged_area > 0"
                              >
                                ({{
                                  ((planting.damaged_area / planting.area_planted) * 100).toFixed(
                                    1,
                                  )
                                }}%)
                              </span>
                            </div>
                          </div>
                        </div>

                        <!-- Timeline -->
                        <div class="relative">
                          <div class="absolute left-0 right-0 top-1/2 h-0.5 bg-border -z-10"></div>
                          <div class="flex justify-between">
                            <!-- Planting Date -->
                            <div class="text-center bg-background px-2">
                              <p class="text-xs text-muted-foreground">Planted</p>
                              <p class="font-medium mt-1">
                                {{ new Date(planting.planting_date).toLocaleDateString() }}
                              </p>
                            </div>
                            <!-- Expected Harvest -->
                            <div class="text-center bg-background px-2">
                              <p class="text-xs text-muted-foreground">Expected Harvest</p>
                              <p class="font-medium mt-1">
                                {{ new Date(planting.expected_harvest_date).toLocaleDateString() }}
                              </p>
                            </div>
                          </div>
                        </div>

                        <!-- Monitoring Summary -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                          <!-- Inspections -->
                          <div class="space-y-3">
                            <p class="text-sm font-medium flex items-center gap-2">
                              <ClipboardIcon class="w-4 h-4 text-muted-foreground" />
                              Latest Inspections
                            </p>
                            <div v-if="planting.inspections?.length" class="space-y-2">
                              <div
                                v-for="inspection in planting.inspections.slice(0, 2)"
                                :key="inspection.id"
                                class="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/5"
                              >
                                <span class="text-muted-foreground">
                                  {{ new Date(inspection.inspection_date).toLocaleDateString() }}
                                </span>
                                <span class="text-destructive font-medium flex items-center gap-1">
                                  <AlertTriangleIcon class="w-3.5 h-3.5" />
                                  {{ inspection.damaged_area }} ha
                                </span>
                                <span class="text-muted-foreground">damaged</span>
                              </div>
                            </div>
                            <p v-else class="text-sm text-muted-foreground italic">
                              No inspections recorded
                            </p>
                          </div>

                          <!-- Harvests -->
                          <div class="space-y-3">
                            <p class="text-sm font-medium flex items-center gap-2">
                              <LeafIcon class="w-4 h-4 text-muted-foreground" />
                              Harvest Reports
                            </p>
                            <div v-if="planting.harvest_reports?.length" class="space-y-2">
                              <div
                                v-for="harvest in planting.harvest_reports.slice(0, 2)"
                                :key="harvest.id"
                                class="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/5"
                              >
                                <span class="text-muted-foreground">
                                  {{ new Date(harvest.harvest_date).toLocaleDateString() }}
                                </span>
                                <span class="text-green-600 font-medium">
                                  {{ harvest.total_yield }} kg
                                </span>
                                <span class="text-muted-foreground">from</span>
                                <span class="font-medium">{{ harvest.area_harvested }} ha</span>
                              </div>
                            </div>
                            <p v-else class="text-sm text-muted-foreground italic">
                              No harvests recorded
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <DeleteFarmerDialog
      v-model:isOpen="showDeleteDialog"
      :farmer="farmer"
      @farmer-deleted="onFarmerDeleted"
    />

    <!-- Edit Farmer Modal -->
    <EditFarmerModal
      v-if="farmer"
      v-model:isOpen="showEditModal"
      :farmer="farmer"
      @farmer-updated="onFarmerUpdated"
    />
  </div>
</template>
