'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

export default function AboutEditor() {
    const { register, handleSubmit, setValue, reset, watch } = useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // Watch image_url to show preview
    const imageUrl = watch('image_url');

    useEffect(() => {
        fetch('/api/content/about_page')
            .then(res => res.json())
            .then(data => {
                if (data && Object.keys(data).length > 0) {
                    reset(data); // Use reset to populate form
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load about data", err);
                setLoading(false);
            });
    }, [reset]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        setUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            
            if (!res.ok) throw new Error('Upload failed');
            
            const data = await res.json();
            setValue('image_url', data.url);
        } catch (error) {
            console.error(error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (data: any) => {
        setSaving(true);
        await fetch('/api/content/about_page', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        setSaving(false);
        alert('About page updated!');
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Edit About Us Page</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                
                {/* Image Section */}
                <div>
                     <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Hero Image</h3>
                     <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Features Image</label>
                            <input 
                                type="file" 
                                onChange={handleImageUpload} 
                                style={{ marginBottom: '0.5rem', width: '100%' }}
                            />
                            <p style={{ fontSize: '0.8rem', color: '#888' }}>{uploading ? 'Uploading...' : 'Supports JPG, PNG (Max 5MB)'}</p>
                            
                            <input type="hidden" {...register('image_url')} />
                        </div>
                        {imageUrl && (
                            <div style={{ width: '150px', height: '100px', position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                <Image src={imageUrl} alt="Preview" fill style={{ objectFit: 'cover' }} />
                            </div>
                        )}
                     </div>
                </div>

                {/* Header Section */}
                <div>
                     <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Page Header</h3>
                     <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Page Title</label>
                            <input {...register('title')} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Page Subtitle</label>
                            <textarea {...register('subtitle')} rows={2} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                        </div>
                     </div>
                </div>

                {/* Main Content Section */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Main Content ("Who We Are")</h3>
                     <div style={{ display: 'grid', gap: '1rem' }}>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                             <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Stats Number (e.g., 18+)</label>
                                <input {...register('stats_number')} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Stats Label (e.g., Years Experience)</label>
                                <input {...register('stats_label')} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                            </div>
                         </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Section Label</label>
                            <input {...register('section_label')} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Main Heading</label>
                            <textarea {...register('heading')} rows={2} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Content Paragraph 1</label>
                            <textarea {...register('paragraph1')} rows={4} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                        </div>
                         <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Content Paragraph 2</label>
                            <textarea {...register('paragraph2')} rows={4} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                        </div>
                     </div>
                </div>

                 {/* CTA Section */}
                <div>
                     <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Call to Action</h3>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Button Text</label>
                            <input {...register('cta_text')} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Button Link</label>
                            <input {...register('cta_link')} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                        </div>
                     </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <Button type="submit" disabled={saving || uploading} size="lg">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
