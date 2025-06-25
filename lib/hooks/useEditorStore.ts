import { create } from "zustand";

interface EditorState {
  documentId: string | null;
  title: string;
  markdownContent: string;
  setTitle: (title: string) => void;
  setDocumentId: (id: string | null) => void;
  setMarkdownContent: (content: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  documentId: null,
  title: "",
  markdownContent: "",
  setDocumentId: (id: string | null) => set({ documentId: id }),
  setMarkdownContent: (content: string) => set({ markdownContent: content }),
  setTitle: (title: string) => set({ title }),
}));
