'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useController } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Trash2, Plus, Edit } from 'lucide-react';

// Reusing types from Services logic roughly, but adjusted for form
type ServiceForm = {
    services: {
        id: string;
        slug: string;
        title: string;
        shortDescription: string;
        fullDescription: string;
        icon: string;
        isExclusive: boolean;
        features: string[];
        imageUrl?: string;
    }[]
};

export default function ServicesEditor() {
    // We fetch the entire list and edit it. In a real app we might edit one by one.
    // For this simple JSON DB, we'll load the whole array, and save the whole array.
    const { register, control, handleSubmit, reset, setValue, watch } = useForm<ServiceForm>({
        defaultValues: { services: [] }
    });
    const { fields, append, remove, swap } = useFieldArray({
        control,
        name: "services"
    });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null); // ID of service being uploaded to
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/content/services')
            .then(res => res.json())
            .then(data => {
                reset({ services: data });
                setLoading(false);
            });
    }, [reset]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setUploading(fields[index].id);
        
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            
            if (!res.ok) throw new Error('Upload failed');
            
            const data = await res.json();
            setValue(`services.${index}.imageUrl`, data.url);
            
            // Hack to force re-render/update of field array if needed, but setValue should work?
            // React Hook Form field array can be tricky with nested updates. 
            // We might need to update the specific field object if using 'fields' for rendering.
            // But watch() or getValues() would show it.
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(null);
        }
    };

    const onSubmit = async (data: ServiceForm) => {
        setSaving(true);
        
        await fetch('/api/content/services', {
            method: 'POST',
            body: JSON.stringify(data.services),
        });
        setSaving(false);
        alert('Services updated!');
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Manage Services</h2>
                <Button onClick={() => {
                    append({ id: crypto.randomUUID(), slug: '', title: 'New Service', shortDescription: '', fullDescription: '', icon: 'Layers', isExclusive: false, features: [] });
                    setExpandedIndex(fields.length);
                }}>
                    <Plus size={18} /> Add New Service
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {fields.map((field, index) => (
                        <div key={field.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}>
                                <h3 style={{ fontWeight: 'bold' }}>{index + 1}. {field.title || 'Untitled Service'}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button type="button" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); index > 0 && swap(index, index - 1); }} disabled={index === 0}>↑</Button>
                                    <Button type="button" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); index < fields.length - 1 && swap(index, index + 1); }} disabled={index === fields.length - 1}>↓</Button>
                                    <Button type="button" variant="ghost" size="sm"><Edit size={16} /></Button>
                                    <Button type="button" variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); remove(index); }}><Trash2 size={16} /></Button>
                                </div>
                            </div>
                            
                            {expandedIndex === index && (
                                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Title</label>
                                            <input {...register(`services.${index}.title` as const, { required: true })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Slug (URL)</label>
                                            <input {...register(`services.${index}.slug` as const, { required: true })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Short Description</label>
                                        <input {...register(`services.${index}.shortDescription` as const)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Full Description</label>
                                        <textarea {...register(`services.${index}.fullDescription` as const)} rows={4} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Cover Image</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                             <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, index)}
                                                disabled={uploading === field.id}
                                                style={{ fontSize: '0.875rem' }}
                                             />
                                             {uploading === field.id && <span style={{ fontSize: '0.875rem', color: '#666' }}>Uploading...</span>}
                                        </div>
                                        {/* Preview - relying on watch() to get live value */}
                                        <ServiceImagePreview control={control} index={index} />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                                Icon Name (Lucide) 
                                                <a href="https://lucide.dev/icons/categories" target="_blank" rel="noopener noreferrer" style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--color-primary)', textDecoration: 'underline' }}>
                                                    Browse Icons
                                                </a>
                                            </label>
                                            <input {...register(`services.${index}.icon` as const)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                                                <input type="checkbox" {...register(`services.${index}.isExclusive` as const)} />
                                                Is Exclusive Badge?
                                            </label>
                                        </div>
                                    </div>
                                    
                                     <div>
                                         <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Features (Comma separated)</label>
                                         <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>e.g., Feature 1, Feature 2, Feature 3</p>
                                         <FeatureListEditor 
                                            control={control}
                                            index={index}
                                         />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ position: 'sticky', bottom: '2rem', marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                     <Button type="submit" disabled={saving} size="lg" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

// Helper component to edit string array as comma separated text
function FeatureListEditor({ control, index }: { control: any, index: number }) {
    const { field } = useController({
        control,
        name: `services.${index}.features`,
    });
    
    // Local state to allow free typing including trailing commas
    const [text, setText] = useState(Array.isArray(field.value) ? field.value.join(', ') : '');

    // Sync from field to text only when field value changes (e.g. initial load or external update)
    // We use a flag or simple dependency check. 
    // Since we only update field onBlur, this loop is safe-ish, but let's be careful.
    // Actually, simple useEffect on field.value is okay if we accept formatting on blur.
    useEffect(() => {
        setText(Array.isArray(field.value) ? field.value.join(', ') : '');
    }, [field.value]);

    return (
        <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => {
                const features = text.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
                field.onChange(features);
            }}
            rows={3}
            placeholder="Enter features, separated by commas"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
        />
    )
}

function ServiceImagePreview({ control, index }: { control: any, index: number }) {
    const imgUrl = useController({
        control,
        name: `services.${index}.imageUrl`,
    }).field.value;

    if (!imgUrl) return null;

    return (
        <div style={{ marginTop: '0.5rem', maxWidth: '200px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #eee' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgUrl} alt="Service Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
    );
}
