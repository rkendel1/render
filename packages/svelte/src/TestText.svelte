<script lang="ts">
  import type { ComponentRenderProps } from "./types.js";

  interface Props extends ComponentRenderProps<{ text?: string }> {}

  let { element, emit, bindings, loading }: Props = $props();
</script>

<span class="test-text" data-type={element.type}
  >{element.props.text ?? ""}</span>
