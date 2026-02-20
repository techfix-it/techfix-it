'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Mail, Phone, MapPin } from 'lucide-react';

interface ContactData {
  address: string;
  emails: { value: string }[];
  phones: { value: string }[];
}

export default function ContactEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, control, handleSubmit, setValue, reset } = useForm<ContactData>({
    defaultValues: {
      address: '',
      emails: [{ value: '' }],
      phones: [{ value: '' }],
    }
  });

  const { fields: emailFields, append: appendEmail, remove: removeEmail } = useFieldArray({
    control,
    name: "emails"
  });

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control,
    name: "phones"
  });

  useEffect(() => {
    async function loadData() {
      try {
        // Try to load contact page data
        const contactRes = await fetch('/api/content/contact_page');
        const contactData = await contactRes.json();

        if (contactData && contactData.address) {
          // If we have data, use it
          reset({
            address: contactData.address,
            emails: contactData.emails?.map((e: string) => ({ value: e })) || [{ value: '' }],
            phones: contactData.phones?.map((p: string) => ({ value: p })) || [{ value: '' }],
          });
        } else {
          // Otherwise, pre-load from footer
          const footerRes = await fetch('/api/content/footer_content');
          const footerData = await footerRes.json();
          
          reset({
            address: footerData.address || '',
            emails: footerData.email ? [{ value: footerData.email }] : [{ value: '' }],
            phones: footerData.phone ? [{ value: footerData.phone }] : [{ value: '' }],
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [reset]);

  const onSubmit = async (data: ContactData) => {
    setSaving(true);
    try {
      // Format data for saving (arrays of strings instead of objects)
      const payload = {
        address: data.address,
        emails: data.emails.map(e => e.value).filter(e => e !== ''),
        phones: data.phones.map(p => p.value).filter(p => p !== ''),
      };

      const res = await fetch('/api/content/contact_page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Contact page updated successfully!');
      } else {
        alert('Failed to update contact page.');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Mail size={24} /> Edit Contact Page
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Address */}
        <section>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            <MapPin size={18} /> Address
          </label>
          <textarea 
            {...register('address')} 
            rows={3} 
            placeholder="Official company address"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }} 
          />
        </section>

        {/* Emails */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <Mail size={18} /> Email Addresses
            </label>
            <Button type="button" variant="outline" size="sm" onClick={() => appendEmail({ value: '' })} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <Plus size={16} /> Add Email
            </Button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {emailFields.map((field, index) => (
              <div key={field.id} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  {...register(`emails.${index}.value` as const)} 
                  placeholder="e.g. info@techfixit.ie"
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} 
                />
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => removeEmail(index)}
                  disabled={emailFields.length === 1}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Phones */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <Phone size={18} /> Phone Numbers (Ireland)
            </label>
            <Button type="button" variant="outline" size="sm" onClick={() => appendPhone({ value: '+353 ' })} style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <Plus size={16} /> Add Phone
            </Button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {phoneFields.map((field, index) => (
              <div key={field.id} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  {...register(`phones.${index}.value` as const)} 
                  placeholder="+353 1 234 5678"
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }} 
                />
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => removePhone(index)}
                  disabled={phoneFields.length === 1}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
             Tips: For Ireland use +353 format. e.g. +353 1 234 5678
          </p>
        </section>

        <Button type="submit" disabled={saving} style={{ height: '3rem', fontSize: '1.1rem' }}>
          {saving ? 'Saving...' : 'Save Contact Information'}
        </Button>
      </form>
    </div>
  );
}
