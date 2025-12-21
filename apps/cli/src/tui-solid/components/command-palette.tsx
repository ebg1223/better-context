import { createSignal, For, Show, type Component } from 'solid-js';
import { colors } from '../theme.ts';

interface Command {
	name: string;
	description: string;
}

export const CommandPalette: Component = () => {
	const [commands, setCommands] = createSignal<Command[]>([
		{
			name: 'help',
			description: 'Show help for a command'
		},
		{
			name: 'clear',
			description: 'Clear the screen'
		},
		{
			name: 'exit',
			description: 'Exit the CLI'
		}
	]);

	const [selectedIndex, setSelectedIndex] = createSignal(0);

	return (
		<Show
			when={commands().length > 0}
			fallback={
				<box
					style={{
						position: 'absolute',
						bottom: 4,
						left: 0,
						width: '100%',
						zIndex: 100,
						backgroundColor: colors.bgSubtle,
						border: true,
						borderColor: colors.border,
						padding: 1
					}}
				>
					<text fg={colors.textSubtle} content="No matching commands" />
				</box>
			}
		>
			<box
				style={{
					position: 'absolute',
					bottom: 4,
					left: 0,
					width: '100%',
					zIndex: 100,
					backgroundColor: colors.bgSubtle,
					border: true,
					borderColor: colors.accent,
					flexDirection: 'column',
					padding: 1
				}}
			>
				<text fg={colors.textMuted} content=" Commands" />
				<text content="" style={{ height: 1 }} />
				<For each={commands()}>
					{(cmd, i) => {
						const isSelected = () => i() === selectedIndex();
						return (
							<box style={{ flexDirection: 'row' }}>
								<text
									fg={isSelected() ? colors.accent : colors.text}
									content={isSelected() ? `▸ /${cmd.name}` : `  /${cmd.name}`}
									style={{ width: 12 }}
								/>
								<text fg={colors.textSubtle} content={` ${cmd.description}`} />
							</box>
						);
					}}
				</For>
			</box>
		</Show>
	);
};
