<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";

  interface Props extends ComponentRenderProps<{
    label: string;
    variant?: "primary" | "secondary" | "danger";
    disabled?: boolean;
  }> {}

  let { element, emit }: Props = $props();
  let _props = $derived(element.props);

  let backgroundColor = $derived(
    _props.variant === "danger"
      ? "#fee2e2"
      : _props.variant === "secondary"
        ? "#f3f4f6"
        : "#3b82f6",
  );
  let textColor = $derived(
    _props.variant === "danger"
      ? "#dc2626"
      : _props.variant === "secondary"
        ? "#374151"
        : "white",
  );
</script>

<button
  disabled={_props.disabled}
  onclick={() => emit("press")}
  style="
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    cursor: {_props.disabled ? 'not-allowed' : 'pointer'};
    font-weight: 500;
    font-size: 14px;
    transition: background 0.15s;
    opacity: {_props.disabled ? '0.5' : '1'};
    background-color: {backgroundColor};
    color: {textColor};
  ">
  {_props.label}
</button>
