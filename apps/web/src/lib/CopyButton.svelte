<script lang="ts">
	import { Check, Copy } from "@lucide/svelte";


	let { text, label } = $props<{ text: string; label?: string }>();

	let copied = $state(false);

	const copy = async () => {
		await navigator.clipboard.writeText(text);
		copied = true;
		window.setTimeout(() => {
			copied = false;
		}, 1400);
	};
</script>

<button
	type="button"
	class="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white/80 p-2 text-neutral-900 shadow-sm backdrop-blur hover:bg-white dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-50 dark:hover:bg-neutral-950"
	onclick={copy}
	aria-label={label ?? 'Copy to clipboard'}
	title={label ?? 'Copy'}
>
	{#if copied}
		<Check size={16} strokeWidth={2.25} class="text-orange-600 dark:text-orange-400" />
	{:else}
		<Copy size={16} strokeWidth={2.25} />
	{/if}
</button>


