<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { getInitialTheme, setTheme, type Theme } from '$lib/theme';
	import { Bot, Github, Moon, Sun } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	let theme = $state<Theme>('dark');

	const toggleTheme = () => {
		theme = theme === 'dark' ? 'light' : 'dark';
		setTheme(theme);
	};

	onMount(() => {
		theme = getInitialTheme();
		setTheme(theme);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Better Context</title>
	<meta name="description" content="btca: local-first CLI for asking questions about codebases." />
</svelte:head>

<div class="relative min-h-dvh overflow-hidden">
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_20%_-10%,rgba(249,115,22,0.20),transparent_60%),radial-gradient(50rem_30rem_at_90%_0%,rgba(249,115,22,0.12),transparent_55%),radial-gradient(50rem_30rem_at_70%_110%,rgba(249,115,22,0.12),transparent_55%)] dark:bg-[radial-gradient(60rem_40rem_at_20%_-10%,rgba(249,115,22,0.14),transparent_60%),radial-gradient(50rem_30rem_at_90%_0%,rgba(249,115,22,0.10),transparent_55%),radial-gradient(50rem_30rem_at_70%_110%,rgba(249,115,22,0.10),transparent_55%)]"
		></div>

	<header class="sticky top-0 z-20 border-b border-neutral-200/70 bg-neutral-50/80 backdrop-blur dark:border-neutral-800/70 dark:bg-neutral-950/60">
		<div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
			<a href="/" class="no-underline">
				<div class="flex items-center gap-2">
					<div
						class="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-sm shadow-orange-500/20"
					>
						<!-- <span class="text-sm font-semibold tracking-tight">btca</span> -->
						<Bot />
					</div>
					<div class="leading-tight">
						<div class="text-sm font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
							The Better Context App
						</div>
						<div class="text-xs text-neutral-600 dark:text-neutral-400">CLI: btca</div>
					</div>
				</div>
			</a>

			<div class="flex items-center gap-2">
				<a
					class="hidden rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 no-underline shadow-sm hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-50 dark:hover:bg-neutral-900 sm:inline-flex"
					href="https://github.com/bmdavis419/better-context"
					target="_blank"
					rel="noreferrer"
					aria-label="GitHub"
					title="GitHub"
				>
					<Github size={18} strokeWidth={2.25} />
				</a>

				<button
					type="button"
					class="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 shadow-sm hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-50 dark:hover:bg-neutral-900"
					onclick={toggleTheme}
					aria-label="Toggle theme"
					title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
				>
					{#if theme === 'dark'}
						<Sun size={18} strokeWidth={2.25} />
					{:else}
						<Moon size={18} strokeWidth={2.25} />
					{/if}
				</button>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-5xl px-6 py-12">
		{@render children()}
	</main>

	<footer class="border-t border-neutral-200/70 py-10 dark:border-neutral-800/70">
		<div class="mx-auto flex max-w-5xl flex-col gap-3 px-6 text-sm text-neutral-600 dark:text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
			<div>Built with Bun + Effect + SvelteKit</div>
			<div class="flex gap-4">
				<a href="https://github.com/bmdavis419/better-context" target="_blank" rel="noreferrer">GitHub</a>
				<a href="#install">Install</a>
			</div>
		</div>
	</footer>
</div>
