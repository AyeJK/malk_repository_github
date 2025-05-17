'use client';

import React, { useState } from 'react';

export default function EmailTestForm() {
  const [to, setTo] = useState('j@jtkaye.com');
  const [subject, setSubject] = useState('Test from Malk');
  const [html, setHtml] = useState('<strong>This is a test email!</strong>');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html }),
      });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponse('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '2rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Send Test Email</h2>
      <div style={{ marginBottom: 12 }}>
        <label>To:<br />
          <input type="email" value={to} onChange={e => setTo(e.target.value)} required style={{ width: '100%' }} />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Subject:<br />
          <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required style={{ width: '100%' }} />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>HTML Content:<br />
          <textarea value={html} onChange={e => setHtml(e.target.value)} required style={{ width: '100%' }} rows={4} />
        </label>
      </div>
      <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
        {loading ? 'Sending...' : 'Send Email'}
      </button>
      {response && (
        <pre style={{ marginTop: 16, background: '#f6f6f6', padding: 12, borderRadius: 4 }}>{response}</pre>
      )}
    </form>
  );
} 