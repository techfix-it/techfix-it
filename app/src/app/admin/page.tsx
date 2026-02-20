export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--color-primary)' }}>Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Select a section from the sidebar to manage content.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Content Status</h3>
            <p>Database is active and running locally via JSON.</p>
        </div>
      </div>
    </div>
  );
}
