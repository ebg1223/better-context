import { colors } from './theme.ts';
import { MainInput } from './components/main-input.tsx';
import { StatusBar } from './components/status-bar.tsx';
import { Messages } from './components/messages.tsx';
import { Show, type Accessor, type Component } from 'solid-js';
import { Header } from './components/header.tsx';
import { RepoMentionPalette } from './components/repo-mention-palette.tsx';
import { useAppContext } from './context/app-context.tsx';
import { CommandPalette } from './components/command-palette.tsx';

export const MainUi: Component<{
	heightPercent: Accessor<`${number}%`>;
}> = (props) => {
	const appState = useAppContext();

	return (
		<box
			width="100%"
			height={props.heightPercent()}
			style={{
				flexDirection: 'column',
				backgroundColor: colors.bg
			}}
		>
			<Header />
			<Messages />
			<MainInput />
			<Show when={appState.cursorIsCurrentlyIn() === 'mention'}>
				<RepoMentionPalette />
			</Show>
			<Show when={appState.cursorIsCurrentlyIn() === 'command'}>
				<CommandPalette />
			</Show>
			<StatusBar />
		</box>
	);
};
