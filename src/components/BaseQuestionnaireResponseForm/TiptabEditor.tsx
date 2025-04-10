import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';

interface TiptapEditorProps {
    value: any;
    onChange: (content: string | number | any) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ value, onChange }) => {
    const [internalValue, setInternalValue] = useState(String(value));
    const formatNewlines = (text: string) => {
        return text.replace(/\n/g, '<br>');
    };

    const editor = useEditor({
        extensions: [StarterKit],
        content: formatNewlines(internalValue),
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const newValue = html.replace(/<br\s*\/?>/g, '\n').replace(/<\/?p>/g, '');

            setInternalValue(newValue);
            onChange(typeof value === 'number' ? parseFloat(newValue) : newValue);
        },
    });

    useEffect(() => {
        const stringValue = String(value);
        if (editor && internalValue !== stringValue) {
            const formatted = formatNewlines(stringValue);
            setInternalValue(stringValue);
            editor.commands.setContent(formatted);
        }
    }, [value, editor]);

    if (!editor) return null;

    return (
        <div className="editor-container">
            <EditorContent editor={editor} />
        </div>
    );
};

export default TiptapEditor;
