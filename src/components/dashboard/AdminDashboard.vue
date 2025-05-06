<script setup>
import { Card } from '@/components/ui/card'
import { Users, Activity, Building2, ChartBar } from 'lucide-vue-next'

const props = defineProps({
  stats: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="space-y-8">
    <!-- System Overview Section -->
    <div>
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <ChartBar class="h-5 w-5 text-primary" />
        System Overview
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Total Users Card -->
        <Card class="overflow-hidden transition-all hover:shadow-lg">
          <div class="p-6 relative overflow-hidden">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-blue-500/10 rounded-lg">
                <Users class="h-5 w-5 text-blue-500" />
              </div>
              <h4 class="text-lg font-semibold">Total Users</h4>
            </div>
            <div class="text-3xl font-bold text-blue-500 mb-3">
              {{ stats.system_overview.total_users }}
            </div>
            <div class="space-y-1.5">
              <div
                v-for="(count, role) in stats.system_overview.users_by_role"
                :key="role"
                class="flex justify-between items-center text-sm"
              >
                <span class="text-muted-foreground capitalize">{{ role }}</span>
                <span class="font-medium text-foreground">{{ count }}</span>
              </div>
            </div>
          </div>
        </Card>

        <!-- Active Fields Card -->
        <Card class="overflow-hidden transition-all hover:shadow-lg">
          <div class="p-6 relative overflow-hidden">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-green-500/10 rounded-lg">
                <Activity class="h-5 w-5 text-green-500" />
              </div>
              <h4 class="text-lg font-semibold">Active Fields</h4>
            </div>
            <div class="text-3xl font-bold text-green-500">
              {{ stats.system_overview.active_fields }}
            </div>
            <p class="mt-2 text-sm text-muted-foreground">
              Currently monitored agricultural fields
            </p>
          </div>
        </Card>

        <!-- Total Farmers Card -->
        <Card class="overflow-hidden transition-all hover:shadow-lg">
          <div class="p-6 relative overflow-hidden">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-orange-500/10 rounded-lg">
                <Users class="h-5 w-5 text-orange-500" />
              </div>
              <h4 class="text-lg font-semibold">Total Farmers</h4>
            </div>
            <div class="text-3xl font-bold text-orange-500">
              {{ stats.system_overview.total_farmers }}
            </div>
            <p class="mt-2 text-sm text-muted-foreground">Registered farmers in the system</p>
          </div>
        </Card>
      </div>
    </div>

    <!-- Farm Registrations Section -->
    <div>
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <Building2 class="h-5 w-5 text-primary" />
        Farm Registration Analytics
      </h3>
      <Card class="overflow-hidden transition-all hover:shadow-lg">
        <div class="p-6">
          <div class="space-y-4">
            <div
              v-for="stat in stats.analytics.farm_registrations"
              :key="stat.month"
              class="flex items-center"
            >
              <div class="w-48 shrink-0">
                <span class="text-muted-foreground">
                  {{
                    new Date(stat.month + '-01').toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })
                  }}
                </span>
              </div>
              <div class="flex-1 ml-4">
                <div class="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    class="h-full bg-primary transition-all"
                    :style="{
                      width: `${(stat.count / Math.max(...stats.analytics.farm_registrations.map((s) => s.count))) * 100}%`,
                    }"
                  ></div>
                </div>
              </div>
              <div class="w-16 text-right font-medium">
                {{ stat.count }}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
