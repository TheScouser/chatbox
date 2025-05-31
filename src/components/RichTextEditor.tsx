import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
	Bold,
	Heading1,
	Heading2,
	Heading3,
	Italic,
	List,
	ListOrdered,
	Quote,
	Redo,
	Undo,
} from "lucide-react";
import { useEffect } from "react";

interface RichTextEditorProps {
	content?: string;
	onChange?: (content: string) => void;
	placeholder?: string;
	className?: string;
}

export default function RichTextEditor({
	content = "",
	onChange,
	placeholder = "Start writing...",
	className = "",
}: RichTextEditorProps) {
	const editor = useEditor({
		extensions: [StarterKit],
		content,
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			onChange?.(html);
		},
		editorProps: {
			attributes: {
				class:
					"prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4",
			},
		},
	});

	// Update editor content when the content prop changes
	useEffect(() => {
		if (editor && content !== editor.getHTML()) {
			editor.commands.setContent(content);
		}
	}, [editor, content]);

	if (!editor) {
		return null;
	}

	const ToolbarButton = ({
		onClick,
		isActive = false,
		children,
		title,
	}: {
		onClick: () => void;
		isActive?: boolean;
		children: React.ReactNode;
		title: string;
	}) => (
		<button
			onClick={onClick}
			className={`p-2 rounded hover:bg-gray-100 transition-colors ${
				isActive ? "bg-gray-200 text-blue-600" : "text-gray-600"
			}`}
			title={title}
			type="button"
		>
			{children}
		</button>
	);

	return (
		<div
			className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}
		>
			{/* Toolbar */}
			<div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1">
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBold().run()}
					isActive={editor.isActive("bold")}
					title="Bold"
				>
					<Bold className="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => editor.chain().focus().toggleItalic().run()}
					isActive={editor.isActive("italic")}
					title="Italic"
				>
					<Italic className="h-4 w-4" />
				</ToolbarButton>

				<div className="w-px h-6 bg-gray-300 mx-1" />

				<ToolbarButton
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 1 }).run()
					}
					isActive={editor.isActive("heading", { level: 1 })}
					title="Heading 1"
				>
					<Heading1 className="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
					isActive={editor.isActive("heading", { level: 2 })}
					title="Heading 2"
				>
					<Heading2 className="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 3 }).run()
					}
					isActive={editor.isActive("heading", { level: 3 })}
					title="Heading 3"
				>
					<Heading3 className="h-4 w-4" />
				</ToolbarButton>

				<div className="w-px h-6 bg-gray-300 mx-1" />

				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					isActive={editor.isActive("bulletList")}
					title="Bullet List"
				>
					<List className="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					isActive={editor.isActive("orderedList")}
					title="Numbered List"
				>
					<ListOrdered className="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					isActive={editor.isActive("blockquote")}
					title="Quote"
				>
					<Quote className="h-4 w-4" />
				</ToolbarButton>

				<div className="w-px h-6 bg-gray-300 mx-1" />

				<ToolbarButton
					onClick={() => editor.chain().focus().undo().run()}
					title="Undo"
				>
					<Undo className="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => editor.chain().focus().redo().run()}
					title="Redo"
				>
					<Redo className="h-4 w-4" />
				</ToolbarButton>
			</div>

			{/* Editor Content */}
			<div className="bg-white">
				<EditorContent editor={editor} placeholder={placeholder} />
			</div>
		</div>
	);
}
