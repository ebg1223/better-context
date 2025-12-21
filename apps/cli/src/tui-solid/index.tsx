import { colors } from './theme.ts';
import { MainInput } from './components/main-input.tsx';
import { StatusBar } from './components/status-bar.tsx';
import { Messages } from './components/messages.tsx';
import type { Accessor, Component } from 'solid-js';
import { Header } from './components/header.tsx';

export const MainUi: Component<{
	heightPercent: Accessor<`${number}%`>;
}> = (props) => {
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
			<StatusBar />
		</box>
	);
};
