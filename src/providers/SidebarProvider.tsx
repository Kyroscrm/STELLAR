import { createContext, useContext, useState, useCallback, ReactNode, forwardRef } from 'react';
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  SIDEBAR_COOKIE_NAME,
  SIDEBAR_COOKIE_MAX_AGE,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_MOBILE,
  SIDEBAR_WIDTH_ICON,
  SIDEBAR_KEYBOARD_SHORTCUT,
} from "@/lib/sidebar-constants"
import { sidebarMenuButtonVariants } from "@/lib/sidebar-menu-button-variants"

interface SidebarContextType {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  asChild?: boolean;
}

export const SidebarProvider = forwardRef<HTMLDivElement, SidebarProviderProps>(
  ({ children, className, asChild = false, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [openMobile, setOpenMobile] = useState(false);

    const setOpen = useCallback((open: boolean) => {
      setIsOpen(open);
    }, []);

    const toggleSidebar = useCallback(() => {
      setIsOpen(prev => !prev);
    }, []);

    const contextValue = {
      isOpen,
      setOpen,
      toggleSidebar
    };

    const Comp = asChild ? Slot : "div";

    return (
      <SidebarContext.Provider value={contextValue}>
        <Comp
          ref={ref}
          className={cn(sidebarMenuButtonVariants({ className }))}
          {...props}
        >
          {children}
        </Comp>
      </SidebarContext.Provider>
    );
  }
);

SidebarProvider.displayName = "SidebarProvider";