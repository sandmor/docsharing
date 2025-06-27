import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Link, Share2 } from "lucide-react";
import Linker from "next/link";

export default async function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8 bg-gradient-to-b from-white to-gray-50">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 text-gray-900">
          Create & Share Documents
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          A simple way to create documents and generate shareable links for
          others to view them.
        </p>
        <div className="mt-8">
          <Linker href="/documents">
            <Button size="lg">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Linker>
        </div>
      </div>

      <div className="mt-24 grid md:grid-cols-3 gap-12 text-center">
        <div className="flex flex-col items-center">
          <FileText className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Create Documents</h3>
          <p className="text-gray-500">
            Easily write and format your documents with a rich text editor.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Link className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Generate Links</h3>
          <p className="text-gray-500">
            Create unique and shareable links for each of your documents.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Share2 className="h-12 w-12 text-purple-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Share with Others</h3>
          <p className="text-gray-500">
            Share your documents with anyone, anywhere, with a simple link.
          </p>
        </div>
      </div>
    </main>
  );
}
