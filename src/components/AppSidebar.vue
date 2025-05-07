<script setup>
import NavMain from '@/components/NavMain.vue'
import NavProjects from '@/components/NavProjects.vue'
import NavUser from '@/components/NavUser.vue'
import TeamSwitcher from '@/components/TeamSwitcher.vue'
import { useUserAuth } from '@/composables/useUserAuth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

import {
  AudioWaveform,
  BookOpen,
  Building2,
  Users,
  Sprout,
  GalleryVerticalEnd,
  Command,
  Wheat,
  LeafyGreen,
  Apple,
  CalendarCheck,
  LineChart,
  ClipboardList,
  Settings,
  UserCog,
} from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  side: { type: String, required: false },
  variant: { type: String, required: false },
  collapsible: { type: String, required: false, default: 'icon' },
  class: { type: null, required: false },
})

const { hasRole } = useUserAuth()

// Filter navigation items based on roles
const filteredNavMain = computed(() => {
  return data.navMain
    .map((section) => {
      // Hide production reports for coordinator role
      if (
        ['Rice Production', 'Corn Production', 'HVC Production'].includes(section.title) &&
        hasRole('coordinator')
      ) {
        return null
      }

      // First check if any items in the section should be visible
      const filteredItems =
        section.items?.filter((item) => {
          switch (item.title) {
            case 'Users':
              return hasRole('admin')
            case 'My Technicians':
              return hasRole('coordinator')
            case 'Crops':
              return hasRole('admin') || hasRole('technician')
            case 'Associations':
              return hasRole('admin') || hasRole('coordinator')
            case 'Farmers':
              return hasRole('admin') || hasRole('technician')
            case 'Crop Plantings':
              return hasRole('admin') || hasRole('technician')
            default:
              return true
          }
        }) || []

      // Only return the section if it has visible items
      if (filteredItems.length > 0) {
        return {
          ...section,
          items: filteredItems,
        }
      }
      return null
    })
    .filter((section) => section !== null)
})

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Provincial Agriculture Office',
      logo: GalleryVerticalEnd,
      plan: 'Goverment Agency',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Management',
      url: '#',
      icon: Settings,
      isActive: true,
      items: [
        {
          title: 'Users',
          url: '/users',
          icon: UserCog,
        },
        {
          title: 'My Technicians',
          url: '/my-technicians',
          icon: Users,
        },
        {
          title: 'Farmers',
          url: '/farmers',
          icon: Users,
        },
        {
          title: 'Associations',
          url: '/associations',
          icon: Building2,
        },
      ],
    },

    {
      title: 'Production',
      url: '#',
      icon: Sprout,
      isActive: true,
      items: [
        {
          title: 'Crops',
          url: '/crops',
          icon: Sprout,
        },
        {
          title: 'Crop Plantings',
          url: '/crop-plantings',
          icon: CalendarCheck,
        },
      ],
    },

    {
      title: 'Rice Production',
      url: '#',
      icon: Wheat,
      items: [
        {
          title: 'Monthly Planting',
          url: '/reports/rice-planting',
          icon: CalendarCheck,
        },
        {
          title: 'Rice Standing',
          url: '/reports/rice-standing',
          icon: LineChart,
        },
        {
          title: 'Rice Harvest',
          url: '/reports/rice-harvest',
          icon: ClipboardList,
        },
      ],
    },

    {
      title: 'Corn Production',
      url: '#',
      icon: LeafyGreen,
      items: [
        {
          title: 'Monthly Planting',
          url: '/reports/corn-planting',
          icon: CalendarCheck,
        },
        {
          title: 'Corn Standing Report',
          url: '/reports/corn-standing',
          icon: LineChart,
        },
        {
          title: 'Monthly Harvest',
          url: '/reports/corn-harvest',
          icon: ClipboardList,
        },
      ],
    },

    {
      title: 'HVC Production',
      url: '#',
      icon: Apple,
      items: [
        {
          title: 'HVC Report',
          url: '/reports/high-value',
          icon: ClipboardList,
        },
      ],
    },
  ],
  // projects: [
  //   {
  //     name: 'Design Engineering',
  //     url: '#',
  //     icon: Frame,
  //   },
  //   {
  //     name: 'Sales & Marketing',
  //     url: '#',
  //     icon: PieChart,
  //   },
  //   {
  //     name: 'Travel',
  //     url: '#',
  //     icon: Map,
  //   },
  // ],
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher :teams="data.teams" />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="filteredNavMain" />
      <!-- <NavProjects :projects="data.projects" /> -->
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
