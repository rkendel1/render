<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";
  import * as Accordion from "$lib/components/ui/accordion";

  interface Props extends ComponentRenderProps<{
    items: Array<{ title: string; content: string }>;
    type?: "single" | "multiple" | null;
  }> {}

  let { element }: Props = $props();
</script>

<Accordion.Root type={element.props.type === "single" ? "single" : "multiple"} class="w-full">
  {#each element.props.items ?? [] as item, i}
    <Accordion.Item value="item-{i}">
      <Accordion.Trigger>{item.title}</Accordion.Trigger>
      <Accordion.Content>
        <p class="text-muted-foreground">{item.content}</p>
      </Accordion.Content>
    </Accordion.Item>
  {/each}
</Accordion.Root>
