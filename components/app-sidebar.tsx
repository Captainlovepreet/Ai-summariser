import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  BookOpenCheck,
  FolderSync,
  FileText,
  MessageSquare,
  Music,
  Settings2Icon,
  CircleHelpIcon,
  LayoutDashboardIcon,
} from "lucide-react"

const data = {
  navMain: [
    {
      title: "Workspace",
      url: "#workspace",
      icon: <BookOpenCheck />,
    },
    {
      title: "History",
      url: "#history",
      icon: <FolderSync />,
    },
  ],
  navSources: [
    {
      name: "PDF",
      url: "#pdf",
      icon: <FileText />,
    },
    {
      name: "YouTube",
      url: "#youtube",
      icon: <MessageSquare />,
    },
    {
      name: "Audio",
      url: "#audio",
      icon: <Music />,
    },
    {
      name: "Text",
      url: "#text",
      icon: <BookOpenCheck />,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#settings",
      icon: <Settings2Icon />,
    },
    {
      title: "Help",
      url: "#help",
      icon: <CircleHelpIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="cursor-default" variant="outline" size="lg">
              <LayoutDashboardIcon className="size-5" />
              <span className="text-base font-semibold">Summora</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <SidebarSeparator />
        <NavDocuments items={data.navSources} />
        <SidebarSeparator />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="cursor-default" variant="outline" size="sm">
              <span>Local workspace</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
