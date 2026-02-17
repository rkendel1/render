"use client";

import { useState, type ReactNode } from "react";
import {
  useBoundProp,
  useStateBinding,
  useFieldValidation,
} from "@json-render/react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Switch } from "./ui/switch";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import {
  Dialog as DialogPrimitive,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Accordion as AccordionPrimitive,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Badge } from "./ui/badge";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Carousel as CarouselPrimitive,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  Table as TablePrimitive,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Drawer as DrawerPrimitive,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import {
  DropdownMenu as DropdownMenuPrimitive,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Pagination as PaginationPrimitive,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import {
  Popover as PopoverPrimitive,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Skeleton } from "./ui/skeleton";
import { Slider } from "./ui/slider";
import { Tabs as TabsPrimitive, TabsList, TabsTrigger } from "./ui/tabs";
import { Toggle } from "./ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import {
  Tooltip as TooltipPrimitive,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

// =============================================================================
// Types
// =============================================================================

interface ComponentProps {
  props: Record<string, unknown>;
  children?: ReactNode;
  emit: (event: string) => void;
  bindings?: Record<string, string>;
  loading?: boolean;
}

// =============================================================================
// Standard Component Implementations
// =============================================================================

/**
 * Standard shadcn/ui component implementations.
 *
 * Pass to `defineRegistry()` from `@json-render/react` to create a
 * component registry for rendering JSON specs with shadcn/ui components.
 *
 * @example
 * ```ts
 * import { defineRegistry } from "@json-render/react";
 * import { shadcnComponents } from "@json-render/shadcn";
 *
 * const { registry } = defineRegistry(catalog, {
 *   components: {
 *     Card: shadcnComponents.Card!,
 *     Button: shadcnComponents.Button!,
 *   },
 * });
 * ```
 */
export const shadcnComponents = {
  // ── Layout ────────────────────────────────────────────────────────────

  Card: ({ props, children }: ComponentProps) => {
    const p = props as {
      title?: string | null;
      description?: string | null;
      maxWidth?: "sm" | "md" | "lg" | "full" | null;
      centered?: boolean | null;
    };
    const maxWidthClass =
      p.maxWidth === "sm"
        ? "max-w-xs sm:min-w-[280px]"
        : p.maxWidth === "md"
          ? "max-w-sm sm:min-w-[320px]"
          : p.maxWidth === "lg"
            ? "max-w-md sm:min-w-[360px]"
            : "w-full";
    const centeredClass = p.centered ? "mx-auto" : "";

    return (
      <div
        className={`border border-border rounded-lg p-4 bg-card text-card-foreground overflow-hidden ${maxWidthClass} ${centeredClass}`}
      >
        {(p.title || p.description) && (
          <div className="mb-4">
            {p.title && (
              <h3 className="font-semibold text-lg text-left">{p.title}</h3>
            )}
            {p.description && (
              <p className="text-sm text-muted-foreground mt-1 text-left">
                {p.description}
              </p>
            )}
          </div>
        )}
        <div className="space-y-3">{children}</div>
      </div>
    );
  },

  Stack: ({ props, children }: ComponentProps) => {
    const p = props as {
      direction?: "horizontal" | "vertical" | null;
      gap?: "none" | "sm" | "md" | "lg" | null;
      align?: "start" | "center" | "end" | "stretch" | null;
      justify?: "start" | "center" | "end" | "between" | "around" | null;
    };
    const isHorizontal = p.direction === "horizontal";
    const gapClass =
      p.gap === "lg"
        ? "gap-4"
        : p.gap === "md"
          ? "gap-3"
          : p.gap === "sm"
            ? "gap-2"
            : p.gap === "none"
              ? "gap-0"
              : "gap-3";
    const alignClass =
      p.align === "center"
        ? "items-center"
        : p.align === "end"
          ? "items-end"
          : p.align === "stretch"
            ? "items-stretch"
            : "items-start";
    const justifyClass =
      p.justify === "center"
        ? "justify-center"
        : p.justify === "end"
          ? "justify-end"
          : p.justify === "between"
            ? "justify-between"
            : p.justify === "around"
              ? "justify-around"
              : "";

    return (
      <div
        className={`flex ${isHorizontal ? "flex-row flex-wrap" : "flex-col"} ${gapClass} ${alignClass} ${justifyClass}`}
      >
        {children}
      </div>
    );
  },

  Grid: ({ props, children }: ComponentProps) => {
    const p = props as {
      columns?: number | null;
      gap?: "sm" | "md" | "lg" | null;
    };
    const n = p.columns ?? 1;
    const cols =
      n >= 6
        ? "grid-cols-6"
        : n >= 5
          ? "grid-cols-5"
          : n >= 4
            ? "grid-cols-4"
            : n >= 3
              ? "grid-cols-3"
              : n >= 2
                ? "grid-cols-2"
                : "grid-cols-1";
    const gridGap =
      p.gap === "lg" ? "gap-4" : p.gap === "sm" ? "gap-2" : "gap-3";

    return <div className={`grid ${cols} ${gridGap}`}>{children}</div>;
  },

  Separator: ({ props }: ComponentProps) => {
    const p = props as { orientation?: "horizontal" | "vertical" | null };
    return (
      <Separator
        orientation={p.orientation ?? "horizontal"}
        className={p.orientation === "vertical" ? "h-full mx-2" : "my-3"}
      />
    );
  },

  Tabs: ({ props, bindings, emit }: ComponentProps) => {
    const p = props as {
      tabs?: Array<{ label: string; value: string }> | null;
      defaultValue?: string | null;
      value?: string | null;
    };
    const tabs = p.tabs ?? [];
    const [boundValue, setBoundValue] = useBoundProp<string>(
      p.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState(
      p.defaultValue ?? tabs[0]?.value ?? "",
    );
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? tabs[0]?.value ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    return (
      <TabsPrimitive
        value={value}
        onValueChange={(v) => {
          setValue(v);
          emit("change");
        }}
      >
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </TabsPrimitive>
    );
  },

  Accordion: ({ props }: ComponentProps) => {
    const p = props as {
      items?: Array<{ title: string; content: string }> | null;
      type?: "single" | "multiple" | null;
    };
    const items = p.items ?? [];
    const accordionType = p.type ?? "single";

    if (accordionType === "multiple") {
      return (
        <AccordionPrimitive type="multiple" className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.title}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </AccordionPrimitive>
      );
    }
    return (
      <AccordionPrimitive type="single" collapsible className="w-full">
        {items.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </AccordionPrimitive>
    );
  },

  Collapsible: ({ props, children }: ComponentProps) => {
    const p = props as {
      title?: string | null;
      defaultOpen?: boolean | null;
    };
    const [open, setOpen] = useState(p.defaultOpen ?? false);
    return (
      <Collapsible open={open} onOpenChange={setOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
            {p.title}
            <svg
              className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">{children}</CollapsibleContent>
      </Collapsible>
    );
  },

  Dialog: ({ props, children }: ComponentProps) => {
    const p = props as {
      title?: string | null;
      description?: string | null;
      openPath?: string | null;
    };
    const [open, setOpen] = useStateBinding<boolean>(p.openPath ?? "");
    return (
      <DialogPrimitive open={open ?? false} onOpenChange={(v) => setOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{p.title}</DialogTitle>
            {p.description && (
              <DialogDescription>{p.description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
        </DialogContent>
      </DialogPrimitive>
    );
  },

  Drawer: ({ props, children }: ComponentProps) => {
    const p = props as {
      title?: string | null;
      description?: string | null;
      openPath?: string | null;
    };
    const [open, setOpen] = useStateBinding<boolean>(p.openPath ?? "");
    return (
      <DrawerPrimitive open={open ?? false} onOpenChange={(v) => setOpen(v)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{p.title}</DrawerTitle>
            {p.description && (
              <DrawerDescription>{p.description}</DrawerDescription>
            )}
          </DrawerHeader>
          <div className="p-4">{children}</div>
        </DrawerContent>
      </DrawerPrimitive>
    );
  },

  Carousel: ({ props }: ComponentProps) => {
    const p = props as {
      items?: Array<{
        title?: string | null;
        description?: string | null;
      }> | null;
    };
    const items = p.items ?? [];
    return (
      <CarouselPrimitive className="w-full">
        <CarouselContent>
          {items.map((item, i) => (
            <CarouselItem
              key={i}
              className="basis-3/4 md:basis-1/2 lg:basis-1/3"
            >
              <div className="border border-border rounded-lg p-4 bg-card h-full">
                {item.title && (
                  <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                )}
                {item.description && (
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </CarouselPrimitive>
    );
  },

  // ── Data Display ──────────────────────────────────────────────────────

  Table: ({ props }: ComponentProps) => {
    const p = props as {
      columns?: string[] | null;
      rows?: unknown[] | null;
      caption?: string | null;
    };
    const columns = p.columns ?? [];
    const rawRows: unknown[] = Array.isArray(p.rows) ? p.rows : [];

    const rows = rawRows.map((row) => {
      if (Array.isArray(row)) return row.map(String);
      if (row && typeof row === "object") {
        const obj = row as Record<string, unknown>;
        return columns.map((col) =>
          String(obj[col] ?? obj[col.toLowerCase()] ?? ""),
        );
      }
      return columns.map(() => "");
    });

    return (
      <div className="rounded-md border border-border overflow-hidden">
        <TablePrimitive>
          {p.caption && <TableCaption>{p.caption}</TableCaption>}
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col}>{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                {row.map((cell, j) => (
                  <TableCell key={j}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </TablePrimitive>
      </div>
    );
  },

  Heading: ({ props }: ComponentProps) => {
    const p = props as {
      text?: string | null;
      level?: "h1" | "h2" | "h3" | "h4" | null;
    };
    const level = p.level ?? "h2";
    const headingClass =
      level === "h1"
        ? "text-2xl font-bold"
        : level === "h3"
          ? "text-base font-semibold"
          : level === "h4"
            ? "text-sm font-semibold"
            : "text-lg font-semibold";

    if (level === "h1")
      return <h1 className={`${headingClass} text-left`}>{p.text}</h1>;
    if (level === "h3")
      return <h3 className={`${headingClass} text-left`}>{p.text}</h3>;
    if (level === "h4")
      return <h4 className={`${headingClass} text-left`}>{p.text}</h4>;
    return <h2 className={`${headingClass} text-left`}>{p.text}</h2>;
  },

  Text: ({ props }: ComponentProps) => {
    const p = props as {
      text?: string | null;
      variant?: "body" | "caption" | "muted" | "lead" | "code" | null;
    };
    const textClass =
      p.variant === "caption"
        ? "text-xs"
        : p.variant === "muted"
          ? "text-sm text-muted-foreground"
          : p.variant === "lead"
            ? "text-xl text-muted-foreground"
            : p.variant === "code"
              ? "font-mono text-sm bg-muted px-1.5 py-0.5 rounded"
              : "text-sm";

    if (p.variant === "code") {
      return <code className={`${textClass} text-left`}>{p.text}</code>;
    }
    return <p className={`${textClass} text-left`}>{p.text}</p>;
  },

  Image: ({ props }: ComponentProps) => {
    const p = props as {
      alt?: string | null;
      width?: number | null;
      height?: number | null;
    };
    return (
      <div
        className="bg-muted border border-border rounded flex items-center justify-center text-xs text-muted-foreground aspect-video"
        style={{ width: p.width ?? 80, height: p.height ?? 60 }}
      >
        {p.alt || "img"}
      </div>
    );
  },

  Avatar: ({ props }: ComponentProps) => {
    const p = props as {
      src?: string | null;
      name?: string | null;
      size?: "sm" | "md" | "lg" | null;
    };
    const name = p.name || "?";
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const avatarSize =
      p.size === "lg"
        ? "w-12 h-12 text-base"
        : p.size === "sm"
          ? "w-8 h-8 text-xs"
          : "w-10 h-10 text-sm";

    return (
      <div
        className={`${avatarSize} rounded-full bg-muted flex items-center justify-center font-medium`}
      >
        {initials}
      </div>
    );
  },

  Badge: ({ props }: ComponentProps) => {
    const p = props as {
      text?: string | null;
      variant?: "default" | "success" | "warning" | "danger" | null;
    };
    const variant =
      p.variant === "success" || p.variant === "warning"
        ? "secondary"
        : p.variant === "danger"
          ? "destructive"
          : "default";
    const customClass =
      p.variant === "success"
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
        : p.variant === "warning"
          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
          : "";

    return (
      <Badge variant={variant} className={customClass}>
        {p.text}
      </Badge>
    );
  },

  Alert: ({ props }: ComponentProps) => {
    const p = props as {
      title?: string | null;
      message?: string | null;
      type?: "info" | "success" | "warning" | "error" | null;
    };
    const variant = p.type === "error" ? "destructive" : "default";
    const customClass =
      p.type === "success"
        ? "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100"
        : p.type === "warning"
          ? "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100"
          : p.type === "info"
            ? "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100"
            : "";

    return (
      <Alert variant={variant} className={customClass}>
        <AlertTitle>{p.title}</AlertTitle>
        {p.message && <AlertDescription>{p.message}</AlertDescription>}
      </Alert>
    );
  },

  Progress: ({ props }: ComponentProps) => {
    const p = props as {
      value?: number | null;
      max?: number | null;
      label?: string | null;
    };
    const value = Math.min(100, Math.max(0, p.value || 0));
    return (
      <div className="space-y-2">
        {p.label && (
          <Label className="text-sm text-muted-foreground">{p.label}</Label>
        )}
        <Progress value={value} />
      </div>
    );
  },

  Skeleton: ({ props }: ComponentProps) => {
    const p = props as {
      width?: string | null;
      height?: string | null;
      rounded?: boolean | null;
    };
    return (
      <Skeleton
        className={p.rounded ? "rounded-full" : "rounded-md"}
        style={{
          width: p.width ?? "100%",
          height: p.height ?? "1.25rem",
        }}
      />
    );
  },

  Spinner: ({ props }: ComponentProps) => {
    const p = props as {
      size?: "sm" | "md" | "lg" | null;
      label?: string | null;
    };
    const sizeClass =
      p.size === "lg" ? "h-8 w-8" : p.size === "sm" ? "h-4 w-4" : "h-6 w-6";
    return (
      <div className="flex items-center gap-2">
        <svg
          className={`${sizeClass} animate-spin text-muted-foreground`}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        {p.label && (
          <span className="text-sm text-muted-foreground">{p.label}</span>
        )}
      </div>
    );
  },

  Tooltip: ({ props }: ComponentProps) => {
    const p = props as { content?: string | null; text?: string | null };
    return (
      <TooltipProvider>
        <TooltipPrimitive>
          <TooltipTrigger asChild>
            <span className="text-sm underline decoration-dotted cursor-help">
              {p.text}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{p.content}</p>
          </TooltipContent>
        </TooltipPrimitive>
      </TooltipProvider>
    );
  },

  Popover: ({ props }: ComponentProps) => {
    const p = props as { trigger?: string | null; content?: string | null };
    return (
      <PopoverPrimitive>
        <PopoverTrigger asChild>
          <Button variant="outline" className="text-sm">
            {p.trigger}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <p className="text-sm">{p.content}</p>
        </PopoverContent>
      </PopoverPrimitive>
    );
  },

  // ── Form Inputs ───────────────────────────────────────────────────────

  Input: ({ props, bindings, emit }: ComponentProps) => {
    const p = props as {
      label?: string | null;
      name?: string | null;
      type?: "text" | "email" | "password" | "number" | null;
      placeholder?: string | null;
      value?: string | null;
      checks?: Array<{
        type: string;
        message: string;
        args?: Record<string, unknown>;
      }> | null;
    };
    const [boundValue, setBoundValue] = useBoundProp<string>(
      p.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState("");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    const hasValidation = !!(bindings?.value && p.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.value ?? "",
      hasValidation ? { checks: p.checks ?? [] } : undefined,
    );

    return (
      <div className="space-y-2">
        {p.label && <Label htmlFor={p.name ?? undefined}>{p.label}</Label>}
        <Input
          id={p.name ?? undefined}
          name={p.name ?? undefined}
          type={p.type ?? "text"}
          placeholder={p.placeholder ?? ""}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") emit("submit");
          }}
          onFocus={() => emit("focus")}
          onBlur={() => {
            if (hasValidation) validate();
            emit("blur");
          }}
        />
        {errors.length > 0 && (
          <p className="text-sm text-destructive">{errors[0]}</p>
        )}
      </div>
    );
  },

  Textarea: ({ props, bindings }: ComponentProps) => {
    const p = props as {
      label?: string | null;
      name?: string | null;
      placeholder?: string | null;
      rows?: number | null;
      value?: string | null;
      checks?: Array<{
        type: string;
        message: string;
        args?: Record<string, unknown>;
      }> | null;
    };
    const [boundValue, setBoundValue] = useBoundProp<string>(
      p.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState("");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    const hasValidation = !!(bindings?.value && p.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.value ?? "",
      hasValidation ? { checks: p.checks ?? [] } : undefined,
    );

    return (
      <div className="space-y-2">
        {p.label && <Label htmlFor={p.name ?? undefined}>{p.label}</Label>}
        <Textarea
          id={p.name ?? undefined}
          name={p.name ?? undefined}
          placeholder={p.placeholder ?? ""}
          rows={p.rows ?? 3}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            if (hasValidation) validate();
          }}
        />
        {errors.length > 0 && (
          <p className="text-sm text-destructive">{errors[0]}</p>
        )}
      </div>
    );
  },

  Select: ({ props, bindings, emit }: ComponentProps) => {
    const p = props as {
      label?: string | null;
      name?: string | null;
      options?: string[] | null;
      placeholder?: string | null;
      value?: string | null;
      checks?: Array<{
        type: string;
        message: string;
        args?: Record<string, unknown>;
      }> | null;
    };
    const [boundValue, setBoundValue] = useBoundProp<string>(
      p.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState<string>("");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;
    const rawOptions = p.options ?? [];
    const options = rawOptions.map((opt) =>
      typeof opt === "string" ? opt : String(opt ?? ""),
    );

    const hasValidation = !!(bindings?.value && p.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.value ?? "",
      hasValidation ? { checks: p.checks ?? [] } : undefined,
    );

    return (
      <div className="space-y-2">
        <Label>{p.label}</Label>
        <Select
          value={value}
          onValueChange={(v) => {
            setValue(v);
            if (hasValidation) validate();
            emit("change");
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={p.placeholder ?? "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt, idx) => (
              <SelectItem key={`${idx}-${opt}`} value={opt || `option-${idx}`}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.length > 0 && (
          <p className="text-sm text-destructive">{errors[0]}</p>
        )}
      </div>
    );
  },

  Checkbox: ({ props, bindings, emit }: ComponentProps) => {
    const p = props as {
      label?: string | null;
      name?: string | null;
      checked?: boolean | null;
    };
    const [boundChecked, setBoundChecked] = useBoundProp<boolean>(
      p.checked as boolean | undefined,
      bindings?.checked,
    );
    const [localChecked, setLocalChecked] = useState(!!p.checked);
    const isBound = !!bindings?.checked;
    const checked = isBound ? (boundChecked ?? false) : localChecked;
    const setChecked = isBound ? setBoundChecked : setLocalChecked;

    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          id={p.name ?? undefined}
          checked={checked}
          onCheckedChange={(c) => {
            setChecked(c === true);
            emit("change");
          }}
        />
        <Label htmlFor={p.name ?? undefined} className="cursor-pointer">
          {p.label}
        </Label>
      </div>
    );
  },

  Radio: ({ props, bindings, emit }: ComponentProps) => {
    const p = props as {
      label?: string | null;
      name?: string | null;
      options?: string[] | null;
      value?: string | null;
    };
    const rawOptions = p.options ?? [];
    const options = rawOptions.map((opt) =>
      typeof opt === "string" ? opt : String(opt ?? ""),
    );
    const [boundValue, setBoundValue] = useBoundProp<string>(
      p.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState(options[0] ?? "");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    return (
      <div className="space-y-2">
        {p.label && <Label>{p.label}</Label>}
        <RadioGroup
          value={value}
          onValueChange={(v) => {
            setValue(v);
            emit("change");
          }}
        >
          {options.map((opt, idx) => (
            <div key={`${idx}-${opt}`} className="flex items-center space-x-2">
              <RadioGroupItem
                value={opt || `option-${idx}`}
                id={`${p.name}-${idx}-${opt}`}
              />
              <Label
                htmlFor={`${p.name}-${idx}-${opt}`}
                className="cursor-pointer"
              >
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  },

  Switch: ({ props, bindings, emit }: ComponentProps) => {
    const p = props as {
      label?: string | null;
      name?: string | null;
      checked?: boolean | null;
    };
    const [boundChecked, setBoundChecked] = useBoundProp<boolean>(
      p.checked as boolean | undefined,
      bindings?.checked,
    );
    const [localChecked, setLocalChecked] = useState(!!p.checked);
    const isBound = !!bindings?.checked;
    const checked = isBound ? (boundChecked ?? false) : localChecked;
    const setChecked = isBound ? setBoundChecked : setLocalChecked;

    return (
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor={p.name ?? undefined} className="cursor-pointer">
          {p.label}
        </Label>
        <Switch
          id={p.name ?? undefined}
          checked={checked}
          onCheckedChange={(c) => {
            setChecked(c);
            emit("change");
          }}
        />
      </div>
    );
  },

  Slider: ({ props, bindings, emit }: ComponentProps) => {
    const p = props as {
      label?: string | null;
      min?: number | null;
      max?: number | null;
      step?: number | null;
      value?: number | null;
    };
    const [boundValue, setBoundValue] = useBoundProp<number>(
      p.value as number | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState(p.min ?? 0);
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? p.min ?? 0) : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    return (
      <div className="space-y-2">
        {p.label && (
          <div className="flex justify-between">
            <Label className="text-sm">{p.label}</Label>
            <span className="text-sm text-muted-foreground">{value}</span>
          </div>
        )}
        <Slider
          value={[value]}
          min={p.min ?? 0}
          max={p.max ?? 100}
          step={p.step ?? 1}
          onValueChange={(v) => {
            setValue(v[0] ?? 0);
            emit("change");
          }}
        />
      </div>
    );
  },

  // ── Actions ───────────────────────────────────────────────────────────

  Button: ({ props, emit }: ComponentProps) => {
    const p = props as {
      label?: string | null;
      variant?: "primary" | "secondary" | "danger" | null;
      disabled?: boolean | null;
    };
    const variant =
      p.variant === "danger"
        ? "destructive"
        : p.variant === "secondary"
          ? "secondary"
          : "default";

    return (
      <Button
        variant={variant}
        disabled={p.disabled ?? false}
        onClick={() => emit("press")}
      >
        {p.label}
      </Button>
    );
  },

  Link: ({ props, emit }: ComponentProps) => {
    const p = props as { label?: string | null; href?: string | null };
    return (
      <Button
        variant="link"
        className="h-auto p-0"
        onClick={() => emit("press")}
      >
        {p.label}
      </Button>
    );
  },

  DropdownMenu: ({ props, emit }: ComponentProps) => {
    const p = props as {
      label?: string | null;
      items?: Array<{ label: string; value: string }> | null;
    };
    const items = p.items ?? [];
    return (
      <DropdownMenuPrimitive>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{p.label}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {items.map((item) => (
            <DropdownMenuItem key={item.value} onClick={() => emit("select")}>
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenuPrimitive>
    );
  },

  Toggle: ({ props, bindings, emit }: ComponentProps) => {
    const p = props as {
      label?: string | null;
      pressed?: boolean | null;
      variant?: "default" | "outline" | null;
    };
    const [boundPressed, setBoundPressed] = useBoundProp<boolean>(
      p.pressed as boolean | undefined,
      bindings?.pressed,
    );
    const [localPressed, setLocalPressed] = useState(p.pressed ?? false);
    const isBound = !!bindings?.pressed;
    const pressed = isBound ? (boundPressed ?? false) : localPressed;
    const setPressed = isBound ? setBoundPressed : setLocalPressed;

    return (
      <Toggle
        variant={p.variant ?? "default"}
        pressed={pressed}
        onPressedChange={(v) => {
          setPressed(v);
          emit("change");
        }}
      >
        {p.label}
      </Toggle>
    );
  },

  ToggleGroup: ({ props, bindings, emit }: ComponentProps) => {
    const p = props as {
      items?: Array<{ label: string; value: string }> | null;
      type?: "single" | "multiple" | null;
      value?: string | null;
    };
    const type = p.type ?? "single";
    const items = p.items ?? [];
    const [boundValue, setBoundValue] = useBoundProp<string>(
      p.value as string | undefined,
      bindings?.value,
    );
    const [localValue, setLocalValue] = useState(items[0]?.value ?? "");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    if (type === "multiple") {
      return (
        <ToggleGroup type="multiple">
          {items.map((item) => (
            <ToggleGroupItem key={item.value} value={item.value}>
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      );
    }

    return (
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => {
          if (v) {
            setValue(v);
            emit("change");
          }
        }}
      >
        {items.map((item) => (
          <ToggleGroupItem key={item.value} value={item.value}>
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );
  },

  ButtonGroup: ({ props, bindings, emit }: ComponentProps) => {
    const p = props as {
      buttons?: Array<{ label: string; value: string }> | null;
      selected?: string | null;
    };
    const buttons = p.buttons ?? [];
    const [boundSelected, setBoundSelected] = useBoundProp<string>(
      p.selected as string | undefined,
      bindings?.selected,
    );
    const [localValue, setLocalValue] = useState(buttons[0]?.value ?? "");
    const isBound = !!bindings?.selected;
    const value = isBound ? (boundSelected ?? "") : localValue;
    const setValue = isBound ? setBoundSelected : setLocalValue;

    return (
      <div className="inline-flex rounded-md border border-border">
        {buttons.map((btn, i) => (
          <button
            key={btn.value}
            className={`px-3 py-1.5 text-sm transition-colors ${
              value === btn.value
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-muted"
            } ${i > 0 ? "border-l border-border" : ""} ${
              i === 0 ? "rounded-l-md" : ""
            } ${i === buttons.length - 1 ? "rounded-r-md" : ""}`}
            onClick={() => {
              setValue(btn.value);
              emit("change");
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    );
  },

  Pagination: ({ props, bindings, emit }: ComponentProps) => {
    const p = props as {
      totalPages?: number | null;
      page?: number | null;
    };
    const [boundPage, setBoundPage] = useBoundProp<number>(
      p.page as number | undefined,
      bindings?.page,
    );
    const currentPage = boundPage ?? 1;
    const totalPages = p.totalPages ?? 1;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <PaginationPrimitive>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) {
                  setBoundPage(currentPage - 1);
                  emit("change");
                }
              }}
            />
          </PaginationItem>
          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  setBoundPage(page);
                  emit("change");
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) {
                  setBoundPage(currentPage + 1);
                  emit("change");
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </PaginationPrimitive>
    );
  },
} as Record<string, (ctx: ComponentProps) => ReactNode>;

// =============================================================================
// Standard Action Implementations
// =============================================================================

/**
 * shadcn/ui action implementations.
 *
 * These are stubs for the built-in state actions (setState, pushState,
 * removeState) which are handled by ActionProvider from `@json-render/react`.
 *
 * Pass to `defineRegistry()` to satisfy the type requirements.
 */
export const shadcnActions = {
  setState: async () => {},
  pushState: async () => {},
  removeState: async () => {},
} as Record<string, (...args: unknown[]) => Promise<void>>;
