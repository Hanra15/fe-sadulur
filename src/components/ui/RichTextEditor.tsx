'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { useEffect, useCallback } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered,
  Quote, Code, Code2, Minus,
  Link as LinkIcon, Link2Off,
  Undo2, Redo2,
  AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Tulis konten artikel di sini...',
  minHeight = 340,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: { class: 'focus:outline-none' },
    },
  })

  // Sync when parent value changes (modal open/edit)
  const syncContent = useCallback(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (current !== value) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [editor, value])

  useEffect(() => {
    syncContent()
  }, [syncContent])

  if (!editor) {
    return <div className="border border-slate-200 rounded-xl h-40 bg-slate-50 animate-pulse" />
  }

  function ToolBtn({
    onClick, active = false, title, children, disabled = false,
  }: {
    onClick: () => void
    active?: boolean
    title: string
    children: React.ReactNode
    disabled?: boolean
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={`p-1.5 rounded-lg transition-all disabled:opacity-30 ${
          active
            ? 'text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
        }`}
        style={active ? { background: '#5C8A36' } : {}}
      >
        {children}
      </button>
    )
  }

  function Divider() {
    return <span className="w-px bg-slate-200 mx-0.5 self-stretch" />
  }

  function handleSetLink() {
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Masukkan URL:', prev ?? 'https://')
    if (url === null) return  // cancelled
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run()
    } else {
      editor.chain().focus().setLink({ href: url.trim() }).run()
    }
  }

  const iconSize = 14

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-slate-400 transition-colors bg-white">
      {/* ── Toolbar ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">

        {/* History */}
        <ToolBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={iconSize} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={iconSize} />
        </ToolBtn>

        <Divider />

        {/* Headings */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={iconSize} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={iconSize} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={iconSize} />
        </ToolBtn>

        <Divider />

        {/* Inline formatting */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold size={iconSize} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic size={iconSize} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon size={iconSize} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough size={iconSize} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline Code"
        >
          <Code size={iconSize} />
        </ToolBtn>

        <Divider />

        {/* Lists */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={iconSize} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <ListOrdered size={iconSize} />
        </ToolBtn>

        <Divider />

        {/* Block elements */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote size={iconSize} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Code2 size={iconSize} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus size={iconSize} />
        </ToolBtn>

        <Divider />

        {/* Alignment */}
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Rata Kiri"
        >
          <AlignLeft size={iconSize} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Rata Tengah"
        >
          <AlignCenter size={iconSize} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Rata Kanan"
        >
          <AlignRight size={iconSize} />
        </ToolBtn>

        <Divider />

        {/* Link */}
        <ToolBtn
          onClick={handleSetLink}
          active={editor.isActive('link')}
          title="Sisipkan Link"
        >
          <LinkIcon size={iconSize} />
        </ToolBtn>
        {editor.isActive('link') && (
          <ToolBtn
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Hapus Link"
          >
            <Link2Off size={iconSize} />
          </ToolBtn>
        )}
      </div>

      {/* ── Editor Content ───────────────────────────── */}
      <EditorContent
        editor={editor}
        className="px-4 py-3 text-sm"
        style={{ minHeight }}
      />

      {/* ── Word Count ───────────────────────────────── */}
      <div className="px-4 py-1.5 border-t border-slate-50 text-right">
        <span className="text-[10px] text-slate-300">
          {editor.storage.characterCount?.characters?.() ?? editor.getText().length} karakter
        </span>
      </div>
    </div>
  )
}
