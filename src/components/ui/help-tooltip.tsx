import * as React from "react";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HelpTooltipProps {
  content: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export function HelpTooltip({ content, className, side = "top", align = "center" }: HelpTooltipProps) {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <HelpCircle
          className={`inline-block h-4 w-4 cursor-help text-gray-400 hover:text-gray-500 ml-1 ${className}`}
          aria-label="Help information"
        />
      </TooltipTrigger>
      <TooltipContent side={side} align={align} className="max-w-xs">
        <div className="text-sm">{content}</div>
      </TooltipContent>
    </Tooltip>
  );
}
