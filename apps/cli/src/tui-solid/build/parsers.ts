import type { FiletypeParserOptions } from '@opentui/core';

export function getParsers(): FiletypeParserOptions[] {
	return [
		{
			filetype: 'markdown',
			wasm: 'https://github.com/tree-sitter-grammars/tree-sitter-markdown/releases/download/v0.5.1/tree-sitter-markdown.wasm',
			queries: {
				highlights: [
					'https://raw.githubusercontent.com/nvim-treesitter/nvim-treesitter/master/queries/markdown/highlights.scm'
				],
				injections: [
					'https://raw.githubusercontent.com/nvim-treesitter/nvim-treesitter/master/queries/markdown/injections.scm'
				]
			},
			injectionMapping: {
				nodeTypes: { inline: 'markdown_inline', pipe_table_cell: 'markdown_inline' },
				infoStringMap: { markdown: 'markdown', md: 'markdown' }
			}
		},
		{
			filetype: 'markdown_inline',
			wasm: 'https://github.com/tree-sitter-grammars/tree-sitter-markdown/releases/download/v0.5.1/tree-sitter-markdown_inline.wasm',
			queries: {
				highlights: [
					'https://raw.githubusercontent.com/nvim-treesitter/nvim-treesitter/99ddf573531c4dbe53f743ecbc1595af5eb1d32f/queries/markdown_inline/highlights.scm'
				]
			}
		}
	];
}
