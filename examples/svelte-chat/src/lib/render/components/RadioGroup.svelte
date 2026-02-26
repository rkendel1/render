<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";
  import { getBoundProp } from "@json-render/svelte";
  import * as RadioGroup from "$lib/components/ui/radio-group";
  import { Label } from "$lib/components/ui/label";

  interface Props extends ComponentRenderProps<{
    label?: string | null;
    value?: string | null;
    options: Array<{ value: string; label: string }>;
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

  function handleChange(newValue: string) {
    valueBinding().current = newValue;
  }
</script>

<div class="flex flex-col gap-2">
  {#if element.props.label}
    <Label class="text-sm font-medium">{element.props.label}</Label>
  {/if}
  <RadioGroup.Root value={value} onValueChange={handleChange}>
    {#each element.props.options ?? [] as opt}
      <div class="flex items-center gap-2">
        <RadioGroup.Item value={opt.value} id="rg-{opt.value}" />
        <Label for="rg-{opt.value}" class="font-normal cursor-pointer">
          {opt.label}
        </Label>
      </div>
    {/each}
  </RadioGroup.Root>
</div>
