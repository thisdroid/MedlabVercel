import React, { useState, useEffect } from 'react';

const Lab = () => {
  const [form, setForm] = useState({
    name: '',
    slogan: '',
    address: '',
    phone: '',
    email: ''
  });
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/labs');
      if (res.ok) {
        const data = await res.json();
        setLabs(data);
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('http://localhost:5000/api/labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess('Lab added successfully!');
        setForm({ name: '', slogan: '', address: '', phone: '', email: '' });
        fetchLabs();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add lab');
      }
    } catch (e) {
      setError('Failed to add lab');
    }
  };

  return (
    <div className="p-8 ml-64">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Lab Management</h1>
      <p className="text-gray-600 mb-6">Add and manage laboratory/company details</p>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 max-w-xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Lab Info</h2>
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lab Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
            <input type="text" name="slogan" value={form.slogan} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Lab</button>
        </form>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Existing Labs</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : labs.length === 0 ? (
          <p className="text-gray-500">No labs added yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {labs.map(lab => (
              <li key={lab.id} className="py-3">
                <div className="font-bold text-gray-800">{lab.name}</div>
                <div className="text-sm text-gray-600">{lab.slogan}</div>
                <div className="text-sm text-gray-600">{lab.address}</div>
                <div className="text-sm text-gray-600">{lab.phone} | {lab.email}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Lab; 