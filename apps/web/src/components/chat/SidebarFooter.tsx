// components/sidebar/custom-sidebar-footer.tsx

import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { LogOut, Moon, MoreHorizontalIcon, Sun } from "lucide-react";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { useTheme } from "@repo/ui/components/providers/theme-provider";
import { Button } from "@repo/ui/components/button";

const CustomSidebarFooter = () => {
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <SidebarMenuButton className="h-auto px-3 py-2">
              <div className="flex items-center gap-3 w-full">
                <UserButton />
                {/* User info */}
                <div className="flex-1 text-left leading-tight">
                  <p className="text-sm font-medium">Yash Pede</p>
                  <p className="text-xs text-muted-foreground truncate">
                    yash@example.com
                  </p>
                </div>
              </div>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" aria-label="Open menu" size="icon-sm">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
            </SidebarMenuButton>
            <DropdownMenuContent side="top" align="start" className="w-56">
              {/* Theme toggle */}
              <DropdownMenuItem
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="gap-2"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                Toggle theme
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem
                onClick={() => signOut()}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};

export default CustomSidebarFooter;
