'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';

export default function FooterEditor() {
  const { register, handleSubmit, setValue } = useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/content/footer_content')
      .then(res => res.json())
      .then(data => {
        Object.keys(data).forEach(key => setValue(key, data[key]));
        setLoading(false);
      });
  }, [setValue]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    await fetch('/api/content/footer_content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setSaving(false);
    alert('Footer updated!');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Edit Footer Content</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
           <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Company Description</label>
           <textarea {...register('company_description')} rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Address</label>
                <input {...register('address')} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
            <div>
                 <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Phone</label>
                 <input {...register('phone')} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
        </div>

         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
                <input {...register('email')} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
            <div>
                 <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Copyright Text</label>
                 <input {...register('copyright_text')} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
