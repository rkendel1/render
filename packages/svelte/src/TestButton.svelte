<script lang="ts">
  import type { ComponentRenderProps } from "./types.js";

  interface Props extends ComponentRenderProps<{ label?: string }> {}

  let { element, emit, bindings, loading }: Props = $props();
</script>

<button
  class="test-button"
  data-type={element.type}
  onclick={() => emit("press")}>
  {element.props.label ?? "Button"}
</button>
