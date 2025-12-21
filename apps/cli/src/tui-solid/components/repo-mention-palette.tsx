import { createSignal, For, type Component } from 'solid-js';
import { colors } from '../theme.ts';

interface Repo {
	name: string;
}

export const RepoMentionPalette: Component = () => {
	const [selectedIndex, setSelectedIndex] = createSignal(0);
	// TODO: pull these in dynamically
	const [repos, setRepos] = createSignal<Repo[]>([
		{
			name: 'svelte'
		},
		{
			name: 'effect'
		},
		{
			name: 'solid'
		},
		{
			name: 'react'
		},
		{
			name: 'vue'
		},
		{
			name: 'angular'
		}
	]);
	const maxVisible = 8;

	const visibleRange = () => {
		const start = Math.max(
			0,
			Math.min(selectedIndex() - Math.floor(maxVisible / 2), repos().length - maxVisible)
		);
		return {
			start,
			repos: repos().slice(start, start + maxVisible)
		};
	};

	return (
		<box
			style={{
				position: 'absolute',
				bottom: 5,
				left: 1,
				width: 40,
				backgroundColor: colors.bgSubtle,
				border: true,
				borderColor: colors.accent,
				flexDirection: 'column',
				padding: 1
			}}
		>
			<text fg={colors.textMuted} content=" Select repo:" />
			<For each={visibleRange().repos}>
				{(repo, i) => {
					const actualIndex = () => visibleRange().start + i();
					const isSelected = () => actualIndex() === selectedIndex();
					return (
						<text
							fg={isSelected() ? colors.accent : colors.text}
							content={isSelected() ? `▸ @${repo.name}` : `  @${repo.name}`}
						/>
					);
				}}
			</For>
		</box>
	);
};
