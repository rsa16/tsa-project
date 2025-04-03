import * as React from "react"
import {
  BookOpen,
  Command,
  LifeBuoy,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useStore } from "@/store"

export function AppSidebar({ ...props }) {
  const { chats } = useStore()
  const [showAllChats, setShowAllChats] = React.useState(false)

  // Limit the number of chats shown in the sidebar
  const visibleChats = showAllChats ? chats : chats.slice(0, 5)

  // Static navigation items
  const navMainItems = [
    {
      title: "Chats",
      url: "/chats",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Tutorial",
      url: "#",
      icon: BookOpen,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
  ]

  const navSecondaryItems = [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ]

  // Combine static items with dynamic chats
  const dynamicNavItems = [
    ...navMainItems,
    ...visibleChats.map((chat) => ({
      title: chat.title,
      url: `#chat-${chat.id}`, // Placeholder URL for now
      icon: SquareTerminal,
    })),
  ]

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">TSA Project</span>
                  <span className="truncate text-xs">For the environment</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Pass dynamicNavItems to NavMain */}
        <NavMain items={dynamicNavItems} />
        {chats.length > 5 && (
          <button
            onClick={() => setShowAllChats(!showAllChats)}
            className="mt-2 text-primary"
          >
            {showAllChats ? "Show Less" : "Show More"}
          </button>
        )}
        <NavSecondary items={navSecondaryItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: "shadcn", email: "m@example.com", avatar: "/avatars/shadcn.jpg" }} />
      </SidebarFooter>
    </Sidebar>
  )
}