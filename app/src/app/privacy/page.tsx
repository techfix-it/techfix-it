import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHeader from '@/components/layout/PageHeader';
import styles from '@/components/layout/Legal.module.css';
import { getLegalPages } from '@/lib/db';
import MarkdownView from '@/components/common/MarkdownView';

export const revalidate = 0; // Force dynamic rendering to show updates immediately

export default async function PrivacyPolicy() {
  const pages = await getLegalPages();
  const page = pages.find((p: any) => p.slug === 'privacy-policy') || { title: 'Privacy Policy', content: 'Content not found.', last_updated: new Date().toISOString() };

  return (
    <main>
      <Header />
      <PageHeader title={page.title} subtitle="How we handle your data" />
      
      <div className="container">
        <div className={styles.legalContainer}>
          <p className={styles.lastUpdated}>Last Updated: {new Date(page.last_updated).toLocaleDateString()}</p>
          
          {/* Rendering content. For safety/simplicity we render as text with preserving newlines, 
              or if we trusted the admin we'd use dangerouslySetInnerHTML. 
              The Implementation Plan had hardcoded HTML structure.
              For a generic "Editor", the content in JSON is likely just a big string or markdown.
              If we want to support the structure we had (headings etc), the editor needs to write HTML or Markdown.
              Let's assume the content field contains simple HTML or we render it loosely.
              For now, to keep the layout, I will wrap it in a div.
              In a real app, I'd use a Markdown renderer. 
              Here I'll use dangerouslySetInnerHTML assuming Admin is trusted.
          */}
          <MarkdownView content={page.content || "No content defined yet."} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
