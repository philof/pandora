import { App, Editor, MarkdownView, MarkdownFileInfo, Modal, Modifier, Notice, Plugin, PluginSettingTab, Setting, TFile, WorkspaceLeaf, KeymapContext, EditorPosition } from 'obsidian';
import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";


// =========================
// Type Definitions
// =========================
interface OrgModeTaskSettings {
	taskStates: TaskState[];
	defaultTaskState: string;
	calculateRatios: boolean;
	keyBindings: KeyBindings;
	bulletStyles: string[];
	enabledByDefault: boolean;
	orgModeParameter: string;
	autoCollapse: boolean;
	ratioColors: string[];
}

interface KeyBindings {
	toggleTask: string;
	createTask: string;
	promoteTask: string;
	demoteTask: string;
	moveTaskUp: string;
	moveTaskDown: string;
}

interface TaskState {
	name: string;
	color: string;
	isDone: boolean;
}

interface TaskItem {
	line: number;
	indentation: number;
	bullet: string;
	state: string;
	content: string;
	completedCount: number;
	totalCount: number;
	restOfLine: string;
	children: TaskItem[];
	isDone: boolean;
}

interface EditorOperations {
	getLine: (line: number) => string;
	setLine: (line: number, text: string) => void;
	getCursor: () => EditorPosition;
	setCursor: (pos: EditorPosition | number, ch?: number) => void;
	replaceRange: (text: string, from: EditorPosition) => void;
}

export enum TaskStateName {
	TODO = "TODO",
	DONE = "DONE",
	HOLD = "HOLD"
}


// =========================
// Constants
// =========================
// [^\S\r\n] equals to \h
const TASK_REGEX = /^(\s*(?:[-*+]\s*)?)([◉○✸✿])\s+(\w+)\s*(.*)(?:\s*\[(\d+)\/(\d+)\])?(.*)$/;
const STATE_REGEX = (state: string) => new RegExp(`^\\s*\\*\\s+${state}\\s+`);

// Update regex to use dynamic bullet styles
const createTaskRegex = (bullets: string[]) => {
	new RegExp(`^\\s*(${bullets.map(bullet => escapeRegExp(bullet)).join('|')})\\s+`);
}

// Add utility function for regex escaping
function escapeRegExp(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const DEFAULT_SETTINGS: OrgModeTaskSettings = {
	taskStates: [
		{ name: 'TODO', color: '#83c5be', isDone: false },
		{ name: 'DONE', color: '#6c757d', isDone: true },
		{ name: 'HOLD', color: '#e9c46a', isDone: false },
	],
	defaultTaskState: TaskStateName.TODO,
	calculateRatios: true,
	keyBindings: {
		toggleTask: 'Ctrl+Enter',
		createTask: 'Ctrl+Shift+Enter',
		promoteTask: 'Ctrl+ArrowLeft',
		demoteTask: 'Ctrl+ArrowRight',
		moveTaskUp: 'Ctrl+ArrowUp',
		moveTaskDown: 'Ctrl+ArrowDown'
	},
	bulletStyles: ['◉', '○', '✸', '✿'],
	enabledByDefault: false,
	orgModeParameter: 'org-mode',
	autoCollapse: true,
	ratioColors: ['#F44336', '#FF9800', '#FFC107', '#8BC34A', '#4CAF50']
}

// =========================
// Main Plugin
// =========================
export default class OrgModeTaskPlugin extends Plugin {
	settings!: OrgModeTaskSettings;
	private taskStateCache = new Map<string, boolean>();
	private statusBarEl?: HTMLElement;
	private editorChangeHandler = this.debouncedEditorChange.bind(this);
	private debounceTimer: number = 0;
	private initialized = false;

	async onload() {
		await this.loadSettings();

		// Register file open handler
		this.registerEvent(
			this.app.workspace.on('file-open', this.handleFileOpen.bind(this))
		);

		// Initial check for active file
		this.handleFileOpen();
	}

	private handleFileOpen() {
		const shouldEnable = this.shouldEnablePlugin();

		if (shouldEnable && !this.initialized) {
			this.initializePlugin();
			this.initialized = true;
		} else if (!shouldEnable && this.initialized) {
			this.onunload();
			this.initialized = false;
		}
	}


	private initializePlugin() {
		// Register custom CSs
		this.addStyle();

		this.registerCommands();

		// Add settings tab
		this.addSettingTab(new OrgModeTaskSettingTab(this.app, this));

		this.registerEventHandlers();
		this.initializeStatusBar();

		new Notice('Org Mode Tasks activated for this file')

		// // Add task toggle command
		// this.addCommand({

		//   id: 'toggle-task-state',
		//   name: 'Toggle Task State',
		//   editorCallback: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
		//     this.toggleTaskState(editor);
		//   },
		// 	hotkeys: [
		// 		{
		// 			modifiers: this.parseHotKey(this.settings.keyBindings.toggleTask).modifiers,
		// 			key: this.parseHotKey(this.settings.keyBindings.toggleTask).key
		// 		}
		// 	]
		// });

		// // Add command to calculate ratios
		// this.addCommand({
		//   id: 'calculate-task-ratios',
		//   name: 'Calculate Task Completion Ratios',
		//   editorCallback: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
		//     this.calculateRatios(editor);
		//   }
		// });

		// // Add command to create new task at current level
		// this.addCommand({
		//   id: 'create-task',
		//   name: 'Create New Task',
		//   editorCallback: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
		//     this.createTask(editor);
		//   },
		// 	hotkeys: [
		// 		{
		// 			modifiers: this.parseHotKey(this.settings.keyBindings.createTask).modifiers,
		// 			key: this.parseHotKey(this.settings.keyBindings.createTask).key
		// 		}
		// 	]
		// });

	}

	parseHotKey(hotKeyStr: string): { modifiers: Modifier[], key: string } {
		const parts = hotKeyStr.split('+');
		const key = parts.pop() || '';
		const modifiers = parts as Modifier[];
		return { modifiers, key };
	}

	// Helper method to create a regex pattern for all possible bullets
	getBulletRegexPattern(): string {
		return this.settings.bulletStyles.map(bullet => {
			return bullet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		}).join('');
	}

	onunload() {
		// this.app.workspace.off('editor-change', this.editorChangeHandler);
		this.statusBarEl?.remove();

		// Clean up custom CSS
		const styleElement = document.getElementById('org-mode-task-styles');
		styleElement?.remove();
	}

	// =========================
	// Core Functionality
	// =========================
	private registerCommands() {
		const commands = [
			{ id: 'toggle-task-state', name: 'Toggle Task State', method: (ops: EditorOperations) => this.toggleTaskState(ops), keyBindName: 'toggleTask' },
			{ id: 'create-task', name: 'Create New Task', method: (ops: EditorOperations) => this.createTask(ops), keyBindName: 'createTask' },
		];

		commands.forEach(({ id, name, method, keyBindName }) => {
			this.addCommand({
				id,
				name,
				editorCallback: (editor: Editor) => this.safeEditorOperation(editor, method),
				hotkeys: [
					{
						modifiers: this.parseHotKey(this.settings.keyBindings[keyBindName as keyof KeyBindings]).modifiers,
						key: this.parseHotKey(this.settings.keyBindings[keyBindName as keyof KeyBindings]).key
					}
				]
			});
		});
	}

	private registerEventHandlers() {
		// Register event handlers for auto-updating task ratios
		this.registerEvent(this.app.workspace.on('editor-change', this.editorChangeHandler));
		this.registerEvent(this.app.workspace.on('file-open', this.handleFileOpen.bind(this)));
		this.registerEditorExtension(this.livePreviewDecorations);
		// this.registerEvent(this.app.workspace.on('editor-change', this.markdownPostProcessor.bind(this)));


		// this.registerEvent(
		// 	this.app.workspace.on('editor-change', (editor: Editor) => {
		// 		if (this.settings.calculateRatios) {
		// 			this.calculateRatios(editor);
		// 		}
		// 	})
		// );

		// // Process documents when opened
		// this.registerEvent(
		// 	this.app.workspace.on('file-open', () => {
		// 		const activeLeaf = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (activeLeaf) {
		// 			this.calculateRatios(activeLeaf.editor);
		// 			this.applyColorFormatting(activeLeaf.editor);
		// 		}
		// 	})
		// );
	}


	addStyle() {
		// Add custom CSS for task states
		const styleEl = document.createElement('style');
		styleEl.id = 'org-mode-task-styles';

		let css = '';
		this.settings.taskStates.forEach(state => {
			css += `
        .org-${state.name.toLowerCase()} {
          color: ${state.color};
        }
      `;
		});

		css += `
			.cm-task-bullet {
				font-weight: bold;
				color: var(--text-accent);
				margin-right: 4px
			}
			.cm-task-state {
				font-weight: 500;
				padding: 2px 4px;
				border-radius: 3px;
				margin-right: 6px;
			}
			.cm-task-ratio {
				font-weight: bold;
				margin-left: 8px;
				opacity: 0.8;
			}
			.cm-line:hover .cm-task-bullet {
				opacity: 0.8;
			}
      .collapse-indicator {
        display: inline-block;
        margin-right: 5px;
        cursor: pointer;
      }
      .task-ratio {
        font-weight: bold;
        margin: 0 4px;
      }
			.task-bullet {
		 	  font-size: 1.2em;
				line-height: 1;
				viertical-align; middle;
			}
			.is-done .task-content {
				text-decoration: line-through;
				opacity: 0.7;
			}
    `;

		styleEl.textContent = css;
		document.head.appendChild(styleEl);
	}

	private toggleTaskState(ops: EditorOperations) {
		try {
			const cursor = ops.getCursor();
			const line = ops.getLine(cursor.line);

			// Check if a line contains a task
			const match = line.match(TASK_REGEX);

			if (match) {
				const indentationAndBullet = match[1]; // Indentation and optional list marker
				const bullet = match[2];
				const currentState = match[3];
				const contentBeforeRatio = match[4];
				const restOfLine = match[7]; // Content after ratio, or empty string

				const nextState = this.getNextTaskState(currentState);

				// Calculate the start and end position of the current state
				const stateStartCh = indentationAndBullet.length + bullet.length + 1; // +1 for space after bullet
				const stateEndCh = stateStartCh + currentState.length;

				ops.replaceRange(
					nextState,
					{ line: cursor.line, ch: stateStartCh },
					{ line: cursor.line, ch: stateEndCh }
				);

				// Adjust cursor position if the new state has a different length
				const newCursorCh = cursor.ch + (nextState.length - currentState.length);
				ops.setCursor(cursor.line, newCursorCh);

				this.refreshUI(ops);

				// Show Notification
				new Notice(`Task state changed to: ${nextState}`);
			}
		} catch (error) {
			new Notice(`Task togglel failed: ${error instanceof Error ? error.message : "Unknown error"}`);
			console.error("toggleTaskState Error:", error);
		}
	}

	// =========================
	// Utilities
	// =========================
	private debouncedEditorChange(editor: Editor) {
		clearTimeout(this.debounceTimer);
		this.debounceTimer = window.setTimeout(() => {
			if (this.settings.calculateRatios) {
				this.calculateRatios(editor);
				this.updateStatusBar();
			}
		}, 500)
	}

	private safeEditorOperation(editor: Editor, operations: (ops: EditorOperations) => void) {
		if (!this.shouldEnablePlugin()) return;

		const ops: EditorOperations = {
			getLine: (line) => editor.getLine(line),
			setLine: (line, text) => editor.setLine(line, text),
			getCursor: () => editor.getCursor(),
			setCursor: (pos, ch) => editor.setCursor(pos, ch),
			replaceRange: (text, from) => editor.replaceRange(text, from)
		};

		try {
			operations(ops);
		} catch (error) {
			this.handleError('Editor operation failed:', error);
		}
	}

	private getNextTaskState = (currentState: string): string => {
		const currentIndex = this.settings.taskStates.findIndex(ts => ts.name === currentState);
		return this.settings.taskStates[(currentIndex + 1) % this.settings.taskStates.length]?.name || TaskStateName.TODO;
	}


	private calculateGlobalStats(): { done: number; total: number } {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) return { done: 0, total: 0 };

		const doc = activeView.editor.getValue();
		let doneCount = 0;
		let totalCount = 0;

		doc.split('\n').forEach(line => {
			const match = line.match(TASK_REGEX);
			if (match) {
				const state = match[3]; // The state (TODO, DONE, HOLD) is the 4th capturing group (index 3)
				totalCount++;
				if (this.isTaskDone(state)) {
					doneCount++;
				}
			}
		});

		return {
			done: doneCount,
			total: totalCount
		};
	}

	private refreshUI(ops: EditorOperations) {
		if (this.settings.calculateRatios) {
			const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;

			if (editor) this.calculateRatios(editor);
		}

		// Update status bar statistics
		this.updateStatusBar();

		// 3. Force redraw of task elements
		this.app.workspace.updateOptions();

		// 4. Refresh syntax highlighting
		this.app.metadataCache.trigger('changed', this.app.vault.getAbstractFileByPath(
			this.app.workspace.getActiveFile()?.path || ''
		));

	}

	private calculateRatios(editor: Editor) {
		const docLines = editor.getValue().split('\n');
		const parsedLines = this.parseTaskStructure(docLines);
		const updatedLines = this.updateRatios(parsedLines);

		// Only update the document if there are changes
		if (JSON.stringify(docLines) !== JSON.stringify(updatedLines)) {
			editor.setValue(updatedLines.join('\n'));
		}
	}

	private parseTaskStructure(lines: string[]) {
		// Parse the document and create a hierarchical structure of tasks
		const taskStructure: TaskItem[] = [];
		const stack: TaskItem[] = [];

		lines.forEach((lines, index) => {
			// Match task pattern indentation, bullet, state, content, and maybe ratio
			const taskRegex = /^(\s*)([◉○✸✿])\s+(\w+)\s+([^[]+)(?:\s+\[(\d+)\/(\d+)\])?(.*)$/;
			const match = lines.match(taskRegex);

			if (match) {
				const indentation = match[1].length;
				const bullet = match[2];
				const state = match[3];
				const content = match[4].trim();
				const completedCount = match[5] ? parseInt(match[5]) : 0;
				const totalCount = match[6] ? parseInt(match[6]) : 0;
				const restOfLine = match[7] || ''

				const taskItem: TaskItem = {
					line: index,
					indentation,
					bullet,
					state,
					content,
					completedCount,
					totalCount,
					restOfLine,
					children: [],
					isDone: this.isTaskDone(state)
				};

				// Find parent based on indentation
				while (stack.length > 0 && stack[stack.length - 1].indentation >= indentation) {
					stack.pop();
				}

				if (stack.length === 0) {
					taskStructure.push(taskItem);
					stack.push(taskItem);
				} else {
					stack[stack.length - 1].children.push(taskItem);
					stack.push(taskItem);
				}
			}
		});

		return lines;
	}

	private updateRatios(lines: string[]) {
		// Create a copy of lines to modify
		const updatedLines = [...lines];

		// Start by finding all tasks with sub-tasks
		for (let i = 0; i < updatedLines.length; i++) {
			const line = updatedLines[i];
			const taskMatch = /^(\s*)([◉○✸✿])\s+(\w+)\s+([^[]+)(?:\s+\[(\d+)\/(\d+)\])?(.*)$/.exec(line);

			if (taskMatch) {
				const indentation = taskMatch[1].length;
				const bullet = taskMatch[2];
				const state = taskMatch[3];
				const content = taskMatch[4].trim();
				const restOfLine = taskMatch[7] || ''

				// Look ahead for child tasks
				let children: any[] = [];
				let j = i + 1;
				while (j < updatedLines.length) {
					const childMatch = /^(\s*)[◉○✸✿]\s+(\w+)\s+/.exec(updatedLines[j]);
					if (childMatch && childMatch[1].length > indentation) {
						children.push({
							line: j,
							indentation: childMatch[1].length,
							state: childMatch[3],
						});
					} else {
						break;
					}
				}

				// Calculate the ratios if children exist
				if (children.length > 0) {
					const completed = children.filter(child => this.isTaskDone(child.state)).length;
					const total = children.length; this.onload

					// Update the line with ratio
					// updatedLines[i] = `${indentation}* ${state} ${restOfLine} [${completed}/${total}]`;
					updatedLines[i] = `${indentation}${bullet} ${state} ${content} [${completed}/${total}]${restOfLine}`;
				}
			}
		}

		return updatedLines;
	}

	private shouldEnablePlugin(): boolean {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) return this.settings.enabledByDefault;

		const frontmatter = this.app.metadataCache.getFileCache(activeFile)?.frontmatter;
		return frontmatter?.[this.settings.orgModeParameter] ?? this.settings.enabledByDefault
	}

	isTaskDone(state: string) {
		const taskState = this.settings.taskStates.find(ts => ts.name === state);
		return taskState ? taskState.isDone : false;
	}

	private createTask = (ops: EditorOperations): void => {
		const cursor = ops.getCursor();
		const currentLine = ops.getLine(cursor.line);
		const lines = currentLine.split('\n');

		// Determine indentation for current line
		const indentMatch = currentLine.match(/^(\s*)/);
		const currentIndent = indentMatch ? indentMatch[1] : '';
		const indentLevel = Math.floor(currentIndent.length / 2); // Assume 2 spaces per level


		// Get appropriate bullet character
		const bullet = this.getBulletForLevel(indentLevel);

		// Create new task line
		const newTaskLine = `${currentIndent}${bullet} ${this.settings.defaultTaskState} `;

		// Insert new line below current position
		ops.replaceRange(newTaskLine, { line: cursor.line + 1, ch: 0 });

		// Move cursor to the end of new task
		ops.setCursor({ line: cursor.line + 1, ch: newTaskLine.length });

		// Refresh UI if needed
		this.refreshUI(ops);

		// 	const taskMatch = /^(\s*)([^\s]+)\s+(\w+)\s+/.exec(line);
		// 	let indentation = '';
		// 	let bullet = '';

		// 	if (taskMatch) {
		// 		indentation = taskMatch[1];
		// 		// Use existing bullet, don't change based on indentation
		// 		bullet = taskMatch[2];
		// 	} else {
		// 		console.log("BBBBBBBBBBBBBBBBBBBBBB")
		// 		const indentMatch = /^(\s*)/.exec(line);
		// 		const indentLevel = indentMatch ? indentMatch[0].length / 2 : 0;
		// 		console.log(indentMatch);
		// 		console.log(indentLevel);
		// 		bullet = this.getBulletForLevel(indentLevel);
		// 	}
		// 	// TODO: Calculate the indentation depth
		// 	// Assuming 2 spaces per indentation level
		// 	// const indentLevel = indentation.startsWith('\t')
		// 	// 	? indentation.length // Count tabs as 1 level
		// 	// 	: Math.floor(indentation.length / 2); //Count 2 spaces as 1 level

		//   // // Check if current line is a task or has indentation
		//   // const indentMatch = /^(\s*)/.exec(line);
		//   // const indentation = indentMatch ? indentMatch[1] : '';

		//   // Create new task with the default state
		//   const newTask = `${indentation}${bullet} ${this.settings.defaultTaskState} New Task`;

		//   // Insert task at current line
		//   editor.replaceRange(newTask + '\n' , {line: cursor.line, ch: 0});

		//   // Move cursor to end of the new task
		//   editor.setCursor({ line: cursor.line + 1, ch: newTask.length });
		// }
	};

	applyColorFormatting(editor: Editor) {
		// TODO: Apply color formatting to task states
	};


	// =========================
	// Plugin Class
	// =========================
	private livePreviewDecorations = ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;
			plugin: OrgModeTaskPlugin;

			constructor(view: EditorView) {
				this.plugin = (view as any).plugin as OrgModeTaskPlugin;
				this.decorations = this.createDecorations(view);
			}

			update(update: ViewUpdate) {
				if (update.docChanged || update.viewportChanged) {
					this.decorations = this.createDecorations(update.view);
				}
			}

			private createDecorations(view: EditorView) {
				const builder = new RangeSetBuilder<Decoration>();
				const decorations: Array<{from: number; to: number; decoration: Decoration}> = [];

				for (const { from: viewFrom, to: viewTo } of view.visibleRanges) {
					const text = view.state.doc.sliceString(viewFrom, viewTo);
					let lineStart = viewFrom;
					const lines = text.split("\n");

					text.split('\n').forEach((line, lineIndex) => {
						const match = line.match(TASK_REGEX);
						if (!match) {
							lineStart += line.length + 1;
							return;
						}

						const [, indent, bullet, state, , completed, total, content] = match;
						const indentLength = indent?.length || 0;
						const bulletLength = bullet?.length || 0;
						const stateLength = state?.length || 0;

						// Calculate positions
						const bulletFrom = lineStart + indentLength;
						const bulletTo = bulletFrom + bulletLength;
						const stateFrom = bulletTo + 1; // +1 for space
						const stateTo = stateFrom + stateLength;

						// const pos = from + lineIndex * (line.length + 1);

						// Add bullet decoration
						decorations.push({
							from: bulletFrom,
							to: bulletTo,
							decoration: Decoration.mark({
								class: 'cm-task-bullet',
								attributes: { 'data-bullet': bullet }
							})
						});

						// Add state description
						decorations.push({
							from: stateFrom,
							to: stateTo,
							decoration: Decoration.mark({
								class: 'cm-task-state',
								attributes: {
									'style': `color: red;`
								}
							})
						});

						// Add ratio decoration
						if (completed && total) {
							const ratioText = `[${completed}/${total}]`;
							const ratioFrom = lineStart + line.length - ratioText.length;
							const ratioTo = ratioFrom + ratioText.length;
							decorations.push({
								from: ratioFrom,
								to: ratioTo,
								decoration: Decoration.mark({
									class: 'cm-task-ratio',
									attributes: {
										'style': `color: black};`
									}
								})
						});
						}

						lineStart += line.length + 1; // Move to next line
					});
				}

				// Sort the decorations to builder
				decorations.forEach(({from, to, decoration}) => {
					try {
						builder.add(from, to, decoration);
					} catch (e) {
						console.error('Error adding decoration:', e);
					}
				});

				return builder.finish();
			}
		},
		{ decorations: v => v.decorations }
	);

	private getStateColor(state: string): string {
		return this.settings.taskStates.find(ts => ts.name === state)?.color || '#000';
	}

	private getRatioColor(completed: string, total: string): string {
		const percentage = (Number(completed) / Number(total)) * 100;
		const index = Math.min(Math.floor(percentage / 20), 4)
		return this.settings.ratioColors[index];
	}

	// Get bullet based on indentation level
	private getBulletForLevel(indentLevel: number): string {
		const { bulletStyles } = this.settings;
		// Use modulo to cycle through bullet styles if we have more levels than styles
		const index = indentLevel % bulletStyles.length;
		return bulletStyles[index] || bulletStyles[bulletStyles.length - 1];

		// Calculate the indentation depth
		// Assuming 2 spaces per indentation level
		// const indentLevel = indentation.startsWith('\t')
		// 	? indentation.length // Count tabs as 1 level
		// 	: Math.floor(indentation.length / 2); //Count 2 spaces as 1 level
	}

	// =========================
	// Settings Handling
	// =========================
	async loadSettings() {
		try {
			const savedData = await this.loadData();
			this.settings = Object.assign({}, DEFAULT_SETTINGS, savedData);

			// Validate task states
			if (!Array.isArray(this.settings.taskStates) || this.settings.taskStates.length === 0) {
				this.settings.taskStates = DEFAULT_SETTINGS.taskStates;
			}
		} catch (error) {
			this.handleError('Settings load failed:', error);
			this.settings = DEFAULT_SETTINGS;
		}

		this.taskStateCache.clear();
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.addStyle(); // Refresh styles after settings change
	}

	// =========================
	// UI
	// =========================
	private initializeStatusBar() {
		this.statusBarEl = this.addStatusBarItem();
		this.updateStatusBar();
	}

	private updateStatusBar() {
		const stats = this.calculateGlobalStats();
		this.statusBarEl?.setText(`Tasks: ${stats.done} / ${stats.total}`);
	}

	private handleError(context: string, error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		new Notice(`${context} ${message}`);
		console.error(context, error);
	}
}

class OrgModeTaskSettingTab extends PluginSettingTab {
	plugin: OrgModeTaskPlugin;

	constructor(app: App, plugin: OrgModeTaskPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Org-Mode Task Settings' });

		this.createToggleSetting('Calculate task ratios automatically', 'Automatically calculate and update task completion ratios', 'calculateRatios');
		this.createTaskStateSettings();
		this.createBulletStyleSettings();
		this.createKeybindingSettings();
		this.createActivationSettings();

	}

	private createToggleSetting(name: string, description: string, key: keyof OrgModeTaskSettings) {
		new Setting(this.containerEl)
			.setName(name)
			.setDesc(description)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings[key] as boolean)
				.onChange(async value => {
					this.plugin.settings[key] = value as never;
					await this.plugin.saveSettings();
				}));
	}

	private createKeybindingSettings() {
		this.containerEl.createEl('h4', { text: 'Key Bindings' });
		const { keyBindings } = this.plugin.settings;
		Object.entries(keyBindings).forEach(([name, value]) => {
			new Setting(this.containerEl)
				.setName(name)
				.addText(text => text
					.setValue(value)
					.onChange(async newValue => {
						keyBindings[name as keyof KeyBindings] = newValue;
						await this.plugin.saveSettings();
					}));
		});
	}

	private createTaskStateSettings() {
		this.containerEl.createEl('h4', { text: 'Task States' });

		this.plugin.settings.taskStates.forEach((state, index) => {
			new Setting(this.containerEl)
				.setName(`Task State ${index + 1}`)
				.addText(text => text
					.setValue(state.name)
					.onChange(async value => {
						if (!this.validateStateName(value)) return;
						state.name = value;
						await this.plugin.saveSettings();
					}))
				.addColorPicker(color => color
					.setValue(state.color)
					.onChange(async value => {
						state.color = value;
						await this.plugin.saveSettings();
					}));
		});
	}

	private createBulletStyleSettings() {
		this.containerEl.createEl('h3', { text: 'Bullet Styles' });

		new Setting(this.containerEl)
			.setName('Bullet Styles')
			.setDesc('Comma-separated bullets for indentation levels')
			.addText(text => text
				.setPlaceholder('◉, ○, ✸, ✿')
				.setValue(this.plugin.settings.bulletStyles.join(','))
				.onChange(async (value) => {
					const bullets = value.split(',')
						.map(b => b.trim())
						.filter(b => b.length > 0)
						.map(b => b[0]); // Take the first character only

					this.plugin.settings.bulletStyles = bullets.length > 0 ? bullets : DEFAULT_SETTINGS.bulletStyles;
					await this.plugin.saveSettings();
				}));
	}

	private createActivationSettings() {
		new Setting(this.containerEl)
			.setName('Enable Plugin by Default')
			.setDesc('Enable the plugin by default for all files unless disabled in frontmatter')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enabledByDefault)
				.onChange(async value => {
					this.plugin.settings.enabledByDefault = value;
					await this.plugin.saveSettings();
				}));

		new Setting(this.containerEl)
			.setName('Frontmatter Parameter to enable plugin for files')
			.addText(text => text
				.setValue(this.plugin.settings.orgModeParameter)
				.onChange(async value => {
					this.plugin.settings.orgModeParameter = value.trim();
					await this.plugin.saveSettings();
				}));
	}

	private validateStateName(name: string): boolean {
		const exists = this.plugin.settings.taskStates.some(ts => ts.name === name);
		if (exists) {
			new Notice(`State name "${name}" already exists!`);
			return false;
		}
		return true;
	}
}
