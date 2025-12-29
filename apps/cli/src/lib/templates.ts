export interface RepoInfo {
	name: string;
	url: string;
	specialNotes?: string;
}

export const generateSkillContent = (repos: RepoInfo[]): string => {
	const techList = repos.map((r) => r.name).join(', ');

	// Build per-tech context section
	const techContextLines = repos
		.map((r) => {
			if (r.specialNotes) {
				return `- **${r.name}**: ${r.specialNotes}`;
			}
			return `- **${r.name}**: Source from ${r.url}`;
		})
		.join('\n');

	// Build dynamic examples using first few repos
	const exampleRepos = repos.slice(0, 3);
	const exampleLines = exampleRepos
		.map((r) => `btca ask -t ${r.name} -q "How do I use ${r.name}?"`)
		.join('\n');

	return `---
name: btca
description: Query library documentation and source code using the btca CLI
---

# btca

Query library source code and documentation directly. btca clones repositories locally and uses AI to search and analyze the actual codebase.

## Usage

Run btca via bash:

\`\`\`bash
btca ask -t <tech> -q "<question>"
\`\`\`

## Available technologies

${techContextLines}

## Examples

\`\`\`bash
${exampleLines}
\`\`\`

## Tips

- Be specific with questions - include API names, version info, or use cases
- One question at a time works best
- The tool searches actual source code, so implementation questions work well
- If you need multiple pieces of information, make separate btca calls

## When to use

Use btca when the user asks about:
- How to use a specific API or feature in ${techList}
- Implementation patterns or best practices
- Code examples for specific use cases
- Understanding how something works under the hood
`;
};
