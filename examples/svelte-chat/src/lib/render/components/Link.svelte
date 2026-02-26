<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";

  interface Props extends ComponentRenderProps<{
    text: string;
    href: string;
  }> {}

  let { element }: Props = $props();
</script>

<a
  href={element.props.href}
  target="_blank"
  rel="noopener noreferrer"
  class="text-primary underline underline-offset-4 hover:text-primary/80"
>
  {element.props.text}
</a>
