import React, { useState, useEffect } from 'react';

const Patients = () => {
    const [activeTab, setActiveTab] = useState('list');
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        gender: '',
        contactNumber: '',
        email: '',
        patientCode: '',
        address: ''
    });

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch patients from the backend
    useEffect(() => {
        // Initial fetch
        fetchPatients();

        // Set up polling every 30 seconds
        const intervalId = setInterval(fetchPatients, 30000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/patients');
            if (!response.ok) {
                throw new Error('Failed to fetch patients');
            }
            const data = await response.json();
            setPatients(data);
            setError(null);
        } catch (err) {
            setError('Error loading patients. Please try again later.');
            console.error('Error fetching patients:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/patients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add patient');
            }

            // Refresh the patient list
            await fetchPatients();
            handleClearForm();
        } catch (err) {
            setError(err.message);
            console.error('Error adding patient:', err);
        }
    };

    const handleClearForm = () => {
        setFormData({
            fullName: '',
            age: '',
            gender: '',
            contactNumber: '',
            email: '',
            patientCode: '',
            address: ''
        });
        setError(null);
    };

    return (
        <div className="p-8 ml-64">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Patient Management</h1>
            <p className="text-gray-600 mb-6">Manage patient records and information</p>
            {/* Toggle Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    className={`px-4 py-2 rounded font-semibold border ${activeTab === 'add' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}
                    onClick={() => setActiveTab('add')}
                >
                    Add/Edit Patient
                </button>
                <button
                    className={`px-4 py-2 rounded font-semibold border ${activeTab === 'list' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}
                    onClick={() => setActiveTab('list')}
                >
                    Patient List
                </button>
            </div>
            {/* Add/Edit Patient Form */}
            {activeTab === 'add' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Patient</h2>
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter patient's full name" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                                <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter age" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                                <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter contact number" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter email address" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Code *</label>
                                <input type="text" name="patientCode" value={formData.patientCode} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Auto-generated or enter code" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">REF. BY</label>
                                <input type="text" name="refBy" value={formData.refBy} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Dr. Name / Self / Clinic Name" />
                                <span className="text-xs text-gray-400">Leave empty for "Self" referral</span>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                                <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter complete address" required></textarea>
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Save Patient</button>
                            <button type="button" onClick={handleClearForm} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">Clear Form</button>
                        </div>
                    </form>
                </div>
            )}
            {/* Patient List */}
            {activeTab === 'list' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-bold mb-1">Patient Records</h2>
                    <p className="text-gray-600 mb-4">View and manage all patient records</p>
                    {loading ? (
                        <p className="text-gray-500 text-center py-4">Loading patients...</p>
                    ) : error ? (
                        <p className="text-red-500 text-center py-4">{error}</p>
                    ) : patients.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No patients added yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REF. BY</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {patients.map((patient) => (
                                        <tr key={patient.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.patientCode}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.fullName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.age}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${patient.gender === 'female' ? 'bg-pink-100 text-pink-700' : patient.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>{patient.gender}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.contactNumber}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.refBy || <span className="text-gray-400">Self</span>}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {/* Actions: edit/delete buttons here if needed */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Patients; 