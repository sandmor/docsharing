import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { Input } from "../ui/input";
import { useCallback, useEffect, useState } from "react";

interface TitleEditorProps {
  initialTitle?: string;
}

export default function TitleEditor({ initialTitle }: TitleEditorProps) {
  const setTitleAction = useEditorStore((state) => state.setTitle);
  const [title, setTitle] = useState(initialTitle || "");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      setTitleAction(e.target.value);
    },
    [setTitle, setTitleAction]
  );

  useEffect(() => {
    if (initialTitle) {
      setTitleAction(initialTitle);
    }
  }, [initialTitle]);

  return (
    <Input
      value={title}
      onChange={handleChange}
      placeholder="Enter document title"
      className="mb-4"
    />
  );
}
