<script setup>
import NavMain from '@/components/NavMain.vue'
import NavProjects from '@/components/NavProjects.vue'
import NavUser from '@/components/NavUser.vue'
import TeamSwitcher from '@/components/TeamSwitcher.vue'
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
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
} from 'lucide-vue-next'

const props = defineProps({
  side: { type: String, required: false },
  variant: { type: String, required: false },
  collapsible: { type: String, required: false, default: 'icon' },
  class: { type: null, required: false },
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
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'User Management',
          url: '/dashboard/users',
        },
      ],
    },
    {
      title: 'Common',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
        },
        {
          title: 'Crop Management',
          url: '/dashboard/crops',
          icon: BookOpen,
        },
        {
          title: 'Associations Management',
          url: '/dashboard/associations',
          icon: BookOpen,
        },
        {
          title: 'Farmer Management',
          url: '/dashboard/farmers',
          icon: Users,
        },
        {
          title: 'Crop Planting',
          url: '/dashboard/crop-plantings',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map,
    },
  ],
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher :teams="data.teams" />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
      <NavProjects :projects="data.projects" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
