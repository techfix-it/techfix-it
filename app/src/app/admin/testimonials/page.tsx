'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Trash2, Plus, Edit } from 'lucide-react';

type TestimonialsForm = {
    testimonials: {
        id: string;
        author_name: string;
        author_role: string;
        content: string;
        rating: number;
        avatar_url: string;
    }[]
};

export default function TestimonialsEditor() {
    const { register, control, handleSubmit, reset } = useForm<TestimonialsForm>({
        defaultValues: { testimonials: [] }
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "testimonials"
    });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/content/testimonials')
            .then(res => res.json())
            .then(data => {
                reset({ testimonials: data });
                setLoading(false);
            });
    }, [reset]);

    const onSubmit = async (data: TestimonialsForm) => {
        setSaving(true);
        await fetch('/api/content/testimonials', {
            method: 'POST',
            body: JSON.stringify(data.testimonials),
        });
        setSaving(false);
        alert('Testimonials updated!');
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Manage Testimonials</h2>
                <Button onClick={() => {
                    append({ id: crypto.randomUUID(), author_name: 'New Author', author_role: '', content: '', rating: 5, avatar_url: '' });
                    setExpandedIndex(fields.length);
                }}>
                    <Plus size={18} /> Add New Testimonial
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {fields.map((field, index) => (
                        <div key={field.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}>
                                <h3 style={{ fontWeight: 'bold' }}>{index + 1}. {field.author_name || 'Untitled'}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button type="button" variant="ghost" size="sm"><Edit size={16} /></Button>
                                    <Button type="button" variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); remove(index); }}><Trash2 size={16} /></Button>
                                </div>
                            </div>

                            {expandedIndex === index && (
                                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Author Name</label>
                                            <input {...register(`testimonials.${index}.author_name` as const, { required: true })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                                        </div>
                                         <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Role/Company</label>
                                            <input {...register(`testimonials.${index}.author_role` as const)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                                        </div>
                                     </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Quote/Content</label>
                                        <textarea {...register(`testimonials.${index}.content` as const, { required: true })} rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                         <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Rating (1-5)</label>
                                            <input type="number" min="1" max="5" {...register(`testimonials.${index}.rating` as const, { valueAsNumber: true })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Avatar URL (Optional)</label>
                                            <input {...register(`testimonials.${index}.avatar_url` as const)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                                        </div>
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
