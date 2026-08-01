"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";

export function RichTextEditor({
  name,
  defaultHtml = "",
}: {
  name: string;
  defaultHtml?: string;
}) {
  const [html, setHtml] = useState(defaultHtml || "<p></p>");

  const editor = useEditor({
    extensions: [StarterKit],
    content: defaultHtml || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => setHtml(ed.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[220px] rounded-xl border border-input bg-white px-4 py-3 focus:outline-none",
      },
    },
  });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {[
          {
            label: "Bold",
            action: () => editor?.chain().focus().toggleBold().run(),
          },
          {
            label: "Italic",
            action: () => editor?.chain().focus().toggleItalic().run(),
          },
          {
            label: "H2",
            action: () =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run(),
          },
          {
            label: "List",
            action: () => editor?.chain().focus().toggleBulletList().run(),
          },
          {
            label: "Quote",
            action: () => editor?.chain().focus().toggleBlockquote().run(),
          },
        ].map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.action}
            className="rounded-lg border border-border px-2 py-1 text-xs font-medium hover:bg-surface-low"
          >
            {btn.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} readOnly />
    </div>
  );
}
