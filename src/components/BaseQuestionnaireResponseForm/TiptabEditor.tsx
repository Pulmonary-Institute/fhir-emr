import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';

interface TiptapEditorProps {
    value: string | number;
    onChange: (content: string | number | any) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ value, onChange }) => {
    const [internalValue, setInternalValue] = useState(String(value));
    const editor = useEditor({
        extensions: [StarterKit],
        content: internalValue,
        onUpdate: ({ editor }) => {
            let newValue: string | number = editor.getText();

            if (typeof value === 'number') {
                const numericValue = parseFloat(editor.getText());
                if (!isNaN(numericValue)) {
                    newValue = numericValue;
                }
            }
            setInternalValue(String(newValue));
            onChange(newValue);
        },
    });

    useEffect(() => {
        const stringValue = String(value);
        if (editor && editor.getText() !== stringValue) {
            setInternalValue(stringValue);
            editor.commands.setContent(stringValue);
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
