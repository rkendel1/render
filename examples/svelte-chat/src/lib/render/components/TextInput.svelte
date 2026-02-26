<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";
  import { getBoundProp } from "@json-render/svelte";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";

  interface Props extends ComponentRenderProps<{
    label?: string | null;
    value?: string | null;
    placeholder?: string | null;
    type?: "text" | "email" | "number" | "password" | "url" | null;
  }> {}

  let { element, bindings }: Props = $props();

  function valueBinding() {
    return getBoundProp<string>(
      () => (element.props.value ?? undefined) as string | undefined,
      () => bindings?.value,
    );
  }

  let value = $derived(
    valueBinding().current ?? ""
  );

  function handleInput(e: Event) {
    const newValue = (e.target as HTMLInputElement).value;
    valueBinding().current = newValue;
  }
</script>

<div class="flex flex-col gap-2">
  {#if element.props.label}
    <Label class="text-sm font-medium">{element.props.label}</Label>
  {/if}
  <Input
    type={element.props.type ?? "text"}
    placeholder={element.props.placeholder ?? ""}
    value={value}
    oninput={handleInput}
  />
</div>
