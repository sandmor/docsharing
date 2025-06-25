import { Textarea } from "@/components/ui/textarea";
import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { useCallback } from "react";

interface ContentEditorProps {
  initialContent?: string;
}

export default function ContentEditor({ initialContent }: ContentEditorProps) {
  const setMarkdownContent = useEditorStore(
    (state) => state.setMarkdownContent
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMarkdownContent(e.target.value);
    },
    [setMarkdownContent]
  );

  return (
    <Textarea
      defaultValue={initialContent}
      onChange={onChange}
      className="h-[500px] w-full"
    />
  );
}
