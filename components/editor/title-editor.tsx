import { useEditorStore } from "@/lib/hooks/useEditorStore";
import { Input } from "../ui/input";
import { useCallback, useState } from "react";

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

  return (
    <Input
      value={title}
      onChange={handleChange}
      placeholder="Enter document title"
      className="mb-4"
    />
  );
}
