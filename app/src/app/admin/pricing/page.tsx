'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useController } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Trash2, Plus, Edit } from 'lucide-react';

type PricingForm = {
    plans: {
        id: string;
        slug: string;
        name: string;
        price: string;
        period: string;
        description: string;
        benefits_description?: string; // New field
        features: string[];
        isPopular: boolean;
        featured: boolean; // Control homepage visibility
        cta: string;
    }[]
};

export default function PricingEditor() {
    const { register, control, handleSubmit, reset, watch } = useForm<PricingForm>({
        defaultValues: { plans: [] }
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "plans"
    });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    // Helper to handle features (simple string array for now, using comma join/split for editing)
    // Actually, let's try to implement a simple array editor for features as requested "remote support lista pode add varios mas só seta exibido no card 4 o restante..."
    // The requirement implies managing the list order is meaningful.
    
    useEffect(() => {
        fetch('/api/content/pricing_plans')
            .then(res => res.json())
            .then(data => {
                reset({ plans: data });
                setLoading(false);
            });
    }, [reset]);

    const onSubmit = async (data: PricingForm) => {
        setSaving(true);
        // Clean up data? 
        await fetch('/api/content/pricing_plans', {
            method: 'POST',
            body: JSON.stringify(data.plans),
        });
        setSaving(false);
        alert('Pricing plans updated!');
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Manage Pricing Plans</h2>
                <Button onClick={() => {
                    append({ id: crypto.randomUUID(), slug: '', name: 'New Plan', price: '$0', period: '/month', description: '', benefits_description: '', features: [], isPopular: false, featured: false, cta: 'Get Started' });
                    setExpandedIndex(fields.length);
                }}>
                    <Plus size={18} /> Add New Plan
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {fields.map((field, index) => (
                        <div key={field.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}>
                                <h3 style={{ fontWeight: 'bold' }}>{index + 1}. {field.name || 'Untitled Plan'}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button type="button" variant="ghost" size="sm"><Edit size={16} /></Button>
                                    <Button type="button" variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); remove(index); }}><Trash2 size={16} /></Button>
                                </div>
                            </div>

                            {expandedIndex === index && (
                                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Name</label>
                                            <input {...register(`plans.${index}.name` as const, { required: true })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                                        </div>
                                         <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Slug</label>
                                            <input {...register(`plans.${index}.slug` as const, { required: true })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                                        </div>
                                     </div>

                                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Price</label>
                                            <input {...register(`plans.${index}.price` as const, { required: true })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                                        </div>
                                         <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Period</label>
                                            <input {...register(`plans.${index}.period` as const, { required: true })} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                                        </div>
                                     </div>

                                     <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Description</label>
                                        <textarea {...register(`plans.${index}.description` as const)} rows={2} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                                    </div>
                                    
                                     <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Benefits Description (Why choose this plan?)</label>
                                        <textarea {...register(`plans.${index}.benefits_description` as const)} rows={2} placeholder="Why choose this plan?" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                                    </div>

                                    <div>
                                         <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Features (One per line)</label>
                                         <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>Top 4 will be shown on the card.</p>
                                         {/* Simple textarea for feature list management for now to avoid complex sub-field-arrays */}
                                         <FeatureListEditor 
                                            // Pass control/register logic? Or just use a text area that effectively splits by newline on submit?
                                            // Simpler: Use a controlled textarea that splits/joins
                                            control={control}
                                            index={index}
                                         />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>CTA Text</label>
                                            <input {...register(`plans.${index}.cta` as const)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                                        </div>
                                        <div>
                                             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', marginTop: '1.5rem' }}>
                                                <input type="checkbox" {...register(`plans.${index}.isPopular` as const)} />
                                                Highight as Popular?
                                            </label>
                                        </div>
                                        <div>
                                             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', marginTop: '1.5rem' }}>
                                                <input type="checkbox" {...register(`plans.${index}.featured` as const)} />
                                                Show on Homepage ({watch('plans', []).filter((p: any) => p.featured).length} of 3)
                                            </label>
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

// Helper component to edit string array as newline separated text
function FeatureListEditor({ control, index }: { control: any, index: number }) {
    const { field } = useController({
        control,
        name: `plans.${index}.features`,
    });

    return (
        <div>
            <textarea 
                value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                onChange={(e) => {
                    const lines = e.target.value.split('\n'); // Allow empty lines? Maybe filter.
                    // Filter empty lines?? No, maybe user wants gap? But usually for feature list, no.
                    // Let's filter trim.
                    // field.onChange(lines); 
                    // Better validation:
                    field.onChange(e.target.value.split('\n'));
                }}
                rows={5}
                placeholder="Enter features, one per line"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'monospace' }}
            />
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                Separate each feature with a new line.
            </p>
        </div>
    )
}
