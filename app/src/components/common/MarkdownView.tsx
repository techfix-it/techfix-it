'use client';

import dynamic from 'next/dynamic';
import '@uiw/react-markdown-preview/markdown.css';

const MarkdownPreview = dynamic(
  () => import('@uiw/react-markdown-preview'),
  { ssr: false }
);

interface MarkdownViewProps {
  content: string;
}

export default function MarkdownView({ content }: MarkdownViewProps) {
  return (
    <div data-color-mode="light" style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '8px' }}>
      <MarkdownPreview source={content.replace(/\\n/g, '\n')} style={{ backgroundColor: 'transparent', color: 'inherit' }} />
    </div>
  );
}
