<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";

  interface Props extends ComponentRenderProps<{
    label: string;
    color?: string;
  }> {}

  let { element }: Props = $props();
  let _props = $derived(element.props);
</script>

<span
  style="
    display: inline-block;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    background-color: {_props.color ? `${_props.color}20` : '#e0f2fe'};
    color: {_props.color ?? '#0369a1'};
    border: 1px solid {_props.color ? `${_props.color}40` : '#bae6fd'};
  ">
  {_props.label}
</span>
