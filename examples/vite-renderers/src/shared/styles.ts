type Style = Record<string, string | number | undefined>;

// ---- Text ----------------------------------------------------------------

export const textSizeMap: Record<string, string> = {
  sm: "12px",
  md: "14px",
  lg: "16px",
  xl: "24px",
};
export const textWeightMap: Record<string, string> = {
  normal: "400",
  medium: "500",
  bold: "700",
};

// ---- Component styles ----------------------------------------------------

export function stackStyle(
  isHorizontal: boolean,
  gap?: number,
  padding?: number,
  align?: string,
): Style {
  return {
    display: "flex",
    flexDirection: isHorizontal ? "row" : "column",
    gap: gap ? `${gap}px` : undefined,
    padding: padding ? `${padding}px` : undefined,
    alignItems: align ?? (isHorizontal ? "center" : "stretch"),
  };
}

export const cardStyle: Style = {
  backgroundColor: "white",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  padding: "20px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

export const cardTitleStyle: Style = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#111827",
  margin: 0,
};

export const cardSubtitleStyle: Style = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "0 0 12px 0",
};

export function textStyle(
  size?: string,
  weight?: string,
  color?: string,
): Style {
  return {
    fontSize: textSizeMap[size ?? "md"] ?? "14px",
    fontWeight: textWeightMap[weight ?? "normal"] ?? "400",
    color: color ?? "#111827",
  };
}

export function buttonStyle(variant?: string, disabled?: boolean): Style {
  return {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "background 0.15s",
    opacity: disabled ? "0.5" : "1",
    backgroundColor:
      variant === "danger"
        ? "#fee2e2"
        : variant === "secondary"
          ? "#f3f4f6"
          : "#3b82f6",
    color:
      variant === "danger"
        ? "#dc2626"
        : variant === "secondary"
          ? "#374151"
          : "white",
  };
}

export function badgeStyle(color?: string): Style {
  return {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "500",
    backgroundColor: color ? `${color}20` : "#e0f2fe",
    color: color ?? "#0369a1",
    border: `1px solid ${color ? `${color}40` : "#bae6fd"}`,
  };
}

export function listItemStyle(completed?: boolean): Style {
  return {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: completed ? "#f0fdf4" : "#f9fafb",
    border: `1px solid ${completed ? "#bbf7d0" : "#e5e7eb"}`,
  };
}

export function listItemCheckStyle(completed?: boolean): Style {
  return {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    border: `2px solid ${completed ? "#16a34a" : "#d1d5db"}`,
    backgroundColor: completed ? "#16a34a" : "transparent",
    flexShrink: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    color: "white",
  };
}

export function listItemTextStyle(completed?: boolean): Style {
  return {
    fontSize: "14px",
    color: completed ? "#6b7280" : "#111827",
    textDecoration: completed ? "line-through" : "none",
  };
}

// ---- RendererBadge -------------------------------------------------------

export function rendererColor(renderer: string): string {
  return renderer === "vue" ? "#42b883" : "#149eca";
}

export function rendererLabel(renderer: string): string {
  return renderer === "vue" ? "Rendered with Vue" : "Rendered with React";
}

export function rendererBadgeStyle(renderer: string): Style {
  const color = rendererColor(renderer);
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "10px 15px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "500",
    backgroundColor: `${color}18`,
    color,
    border: `1px solid ${color}40`,
  };
}

export function rendererDotStyle(renderer: string): Style {
  return {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: rendererColor(renderer),
    display: "inline-block",
  };
}

// ---- RendererTabs --------------------------------------------------------

export const rendererTabsWrapperStyle: Style = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  marginLeft: "auto",
};

export const rendererTabsLabelStyle: Style = {
  fontSize: "13px",
  color: "#6b7280",
  fontWeight: "500",
};

export const rendererTabsStyle: Style = {
  display: "inline-flex",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  overflow: "hidden",
};

export function rendererTabStyle(
  active: boolean,
  isFirst: boolean,
  renderer: string,
): Style {
  return {
    padding: "6px 16px",
    border: "none",
    borderRight: isFirst ? "1px solid #e5e7eb" : "0",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    backgroundColor: active ? rendererColor(renderer) : "white",
    color: active ? "white" : "#374151",
    transition: "background 0.15s",
  };
}
