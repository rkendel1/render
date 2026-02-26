<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";

  interface Props extends ComponentRenderProps<{
    title: string;
    completed?: boolean;
  }> {}

  let { element, emit }: Props = $props();
  let _props = $derived(element.props);
</script>

<button
  type="button"
  onclick={() => emit("press")}
  style="
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    background-color: {_props.completed ? '#f0fdf4' : '#f9fafb'};
    border: 1px solid {_props.completed ? '#bbf7d0' : '#e5e7eb'};
  ">
  <div
    style="
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid {_props.completed ? '#16a34a' : '#d1d5db'};
      background-color: {_props.completed ? '#16a34a' : 'transparent'};
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 11px;
      flex-shrink: 0;
    ">
    {_props.completed ? "✓" : ""}
  </div>
  <span
    style="
      font-size: 14px;
      color: {_props.completed ? '#6b7280' : '#111827'};
      text-decoration: {_props.completed ? 'line-through' : 'none'};
    ">
    {_props.title}
  </span>
</button>
