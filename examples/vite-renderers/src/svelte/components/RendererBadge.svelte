<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";

  interface Props extends ComponentRenderProps<{ renderer: string }> {}

  let { element }: Props = $props();
  let _props = $derived(element.props);
</script>

<span class="json-render-renderer-badge">
  <span class="json-render-renderer-dot"></span>
  {_props.renderer === "vue"
    ? "Rendered with Vue"
    : _props.renderer === "react"
      ? "Rendered with React"
      : "Rendered with Svelte"}
</span>
