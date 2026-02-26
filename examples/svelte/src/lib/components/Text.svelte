<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";

  interface Props extends ComponentRenderProps<{
    content: string;
    size?: "sm" | "md" | "lg" | "xl";
    weight?: "normal" | "medium" | "bold";
    color?: string;
  }> {}

  let { element }: Props = $props();
  let _props = $derived(element.props);

  const sizeMap: Record<string, string> = {
    sm: "12px",
    md: "14px",
    lg: "16px",
    xl: "24px",
  };

  const weightMap: Record<string, string> = {
    normal: "400",
    medium: "500",
    bold: "700",
  };
</script>

<span
  style="
    font-size: {sizeMap[_props.size ?? 'md'] ?? '14px'};
    font-weight: {weightMap[_props.weight ?? 'normal'] ?? '400'};
    color: {_props.color ?? '#111827'};
  ">
  {String(_props.content ?? "")}
</span>
