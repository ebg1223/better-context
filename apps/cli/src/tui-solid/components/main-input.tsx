import { For, Show, type Component } from 'solid-js';
import { colors, getColor } from '../theme';
import { useAppContext } from '../context/app-context';
import { usePaste } from '@opentui/solid';

export const MainInput: Component = () => {
	const appState = useAppContext();

	const getValue = () =>
		appState
			.inputState()
			.map((p) => {
				if (p.type === 'pasted') {
					return `pasted ${p.lines} lines`;
				} else {
					return p.content;
				}
			})
			.join('');

	const isEmpty = () => getValue().length === 0;

	usePaste((text) => {
		const curInput = appState.inputState();
		const lines = text.text.split('\n').length;
		const newInput = [...curInput, { type: 'pasted' as const, content: text.text, lines }];
		appState.setInputState(newInput);
	});

	function parseInputValue(value: string): ReturnType<typeof appState.inputState> {
		if (!value) return [];
		const parts: { type: 'text' | 'command' | 'mention'; content: string }[] = [];

		if (value.startsWith('/')) {
			const spaceIndex = value.indexOf(' ');
			if (spaceIndex === -1) {
				parts.push({ type: 'command', content: value });
			} else {
				parts.push({ type: 'command', content: value.slice(0, spaceIndex) });
				parts.push({ type: 'text', content: value.slice(spaceIndex) });
			}
			return parts;
		}

		const regex = /(^|(?<=\s))@\w*/g;
		let lastIndex = 0;
		let match;
		while ((match = regex.exec(value)) !== null) {
			if (match.index > lastIndex) {
				parts.push({ type: 'text', content: value.slice(lastIndex, match.index) });
			}
			parts.push({ type: 'mention', content: match[0] });
			lastIndex = regex.lastIndex;
		}

		if (lastIndex < value.length) {
			parts.push({ type: 'text', content: value.slice(lastIndex) });
		}
		return parts;
	}

	return (
		<box
			style={{
				border: true,
				borderColor: colors.accent,
				height: 3,
				width: '100%'
			}}
		>
			{/* Styled text overlay - positioned on top of input */}
			<text
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: 1,
					zIndex: 2,
					paddingLeft: 1,
					paddingRight: 1
				}}
				onMouseDown={(e) => {
					const inputRef = appState.inputRef();
					if (!inputRef) return;
					inputRef.cursorPosition = e.x - 1;
					queueMicrotask(() => {
						appState.setCursorPosition(inputRef.cursorPosition);
					});
				}}
			>
				<Show
					when={!isEmpty()}
					fallback={
						<span style={{ fg: colors.textSubtle }}>@repo question... or / for commands</span>
					}
				>
					<For each={appState.inputState()}>
						{(part) => {
							// console.log('part', part);
							if (part.type === 'pasted') {
								return (
									<span style={{ fg: colors.textPasted }}>{`pasted ${part.lines} lines`}</span>
								);
							} else {
								return <span style={{ fg: getColor(part.type) }}>{part.content}</span>;
							}
						}}
					</For>
				</Show>
			</text>
			{/* Hidden input - handles actual typing and cursor */}
			<input
				id="main-input"
				onInput={(v) => {
					console.log('v', v);
					const parts = parseInputValue(v);
					appState.setInputState(parts);
				}}
				onKeyDown={() => {
					queueMicrotask(() => {
						const inputRef = appState.inputRef();
						if (!inputRef) return;
						appState.setCursorPosition(inputRef.cursorPosition);
					});
				}}
				value={getValue()}
				focused={appState.mode() === 'chat'}
				ref={(r) => appState.setInputRef(r)}
				// Make input text transparent so styled overlay shows through
				textColor="transparent"
				backgroundColor="transparent"
				focusedBackgroundColor="transparent"
				cursorColor={colors.accent}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: 1,
					zIndex: 1, // Below the styled text
					paddingLeft: 1,
					paddingRight: 1
				}}
			/>
		</box>
	);
};
