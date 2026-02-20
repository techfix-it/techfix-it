'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';

export default function HeroEditor() {
  const { register, handleSubmit, setValue, watch } = useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const backgroundImage = watch('background_image');

  useEffect(() => {
    fetch('/api/content/hero_section')
      .then(res => res.json())
      .then(data => {
        if (data) {
            Object.keys(data).forEach(key => setValue(key, data[key]));
            // Ensure defaults
            if (data.show_lottie === undefined) setValue('show_lottie', true);
        }
        setLoading(false);
      });
  }, [setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        setValue('background_image', data.url);
    } catch (error) {
        console.error(error);
        alert('Failed to upload image');
    } finally {
        setUploading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    await fetch('/api/content/hero_section', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setSaving(false);
    alert('Hero section updated!');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Edit Hero Section</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Background Image Upload */}
        <div>
             <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Background Image</h3>
             <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Upload Image</label>
                    <input 
                        type="file" 
                        onChange={handleImageUpload} 
                        style={{ marginBottom: '0.5rem', width: '100%' }}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#888' }}>{uploading ? 'Uploading...' : 'Supports JPG, PNG (Max 5MB)'}</p>
                    <input type="hidden" {...register('background_image')} />
                </div>
                {backgroundImage && (
                    <div style={{ width: '150px', height: '100px', position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={backgroundImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}
             </div>
        </div>

        {/* Lottie Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#f9f9fab', borderRadius: '8px' }}>
            <input type="checkbox" {...register('show_lottie')} id="showLottie" style={{ width: '20px', height: '20px' }} />
            <label htmlFor="showLottie" style={{ fontWeight: '500', cursor: 'pointer' }}>Show Lottie Animation (Right Side)</label>
        </div>


        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Main Title</label>
          <input {...register('title', { required: true })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
        </div>

        <div>
           <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Subtitle</label>
           <textarea {...register('subtitle', { required: true })} rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Primary CTA Text</label>
                <input {...register('cta_primary_text')} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
            <div>
                 <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Primary CTA Link</label>
                 <input {...register('cta_primary_link')} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
        </div>

         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Secondary CTA Text</label>
                <input {...register('cta_secondary_text')} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
            <div>
                 <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Secondary CTA Link</label>
                 <input {...register('cta_secondary_link')} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
        </div>

        <Button type="submit" disabled={saving || uploading} size="lg">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
