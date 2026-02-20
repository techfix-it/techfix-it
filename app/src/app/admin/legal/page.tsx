'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import dynamic from 'next/dynamic';

export default function LegalEditor() {
    const { register, handleSubmit, setValue, control } = useForm(); // Adicionado control
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pages, setPages] = useState<any[]>([]);
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/content/legal_pages')
            .then(res => res.json())
            .then(data => {
                setPages(data);
                if (data.length > 0) {
                    setSelectedPageId(data[0].id);
                    setValue('title', data[0].title);
                    setValue('content', data[0].content);
                }
                setLoading(false);
            });
    }, [setValue]);

    useEffect(() => {
        const page = pages.find(p => p.id === selectedPageId);
        if (page) {
            setValue('title', page.title);
            setValue('content', page.content);
        }
    }, [selectedPageId, pages, setValue]);

    const onSubmit = async (data: any) => {
        setSaving(true);
        const updatedPages = pages.map(p => 
            p.id === selectedPageId 
                ? { ...p, title: data.title, content: data.content, last_updated: new Date().toISOString() } 
                : p
        );
        
        setPages(updatedPages);

        await fetch('/api/content/legal_pages', {
            method: 'POST',
            body: JSON.stringify(updatedPages),
        });
        setSaving(false);
        alert('Legal page updated!');
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Manage Legal Pages</h2>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {pages.map(page => (
                    <Button 
                        key={page.id} 
                        variant={selectedPageId === page.id ? 'primary' : 'outline'}
                        onClick={() => setSelectedPageId(page.id)}
                    >
                        {page.slug === 'privacy-policy' ? 'Privacy Policy' : 'Terms of Service'}
                    </Button>
                ))}
            </div>

            {selectedPageId && (
                <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Page Title</label>
                            <input {...register('title')} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                        </div>

                        {/* Substituição do Textarea pelo MDEditor */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Content (Markdown Supported)</label>
                            <p style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.5rem' }}>You can use Markdown for formatting.</p>
                            <textarea
                                {...register('content')}
                                rows={20}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '6px',
                                    border: '1px solid #ddd',
                                    fontFamily: 'monospace',
                                    lineHeight: '1.5',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                             <Button type="submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
