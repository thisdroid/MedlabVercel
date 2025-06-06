import React, { useState, useEffect } from 'react';
import testsData from '../data/testsData';

const Tests = () => {
    const [formData, setFormData] = useState({
        patientId: '',
        testCategory: '',
        testName: '',
        testValue: '',
        normalRange: '',
        unit: '',
        additionalNote: ''
    });

    const [patients, setPatients] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('history');

    // Get unique categories from testsData
    const categories = Array.from(new Set(testsData.map(test => test.category)));
    // Filter tests for selected category
    const filteredTests = formData.testCategory
        ? testsData.filter(test => test.category === formData.testCategory)
        : [];

    // Fetch patients and tests on component mount
    useEffect(() => {
        fetchPatients();
        fetchTests();

        // Set up polling for tests every 30 seconds
        const intervalId = setInterval(fetchTests, 30000);
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
        } catch (err) {
            console.error('Error fetching patients:', err);
        }
    };

    const fetchTests = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/tests');
            if (!response.ok) {
                throw new Error('Failed to fetch tests');
            }
            const data = await response.json();
            setTests(data);
            setError(null);
        } catch (err) {
            setError('Error loading tests. Please try again later.');
            console.error('Error fetching tests:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // If category changes, reset testName, unit, and normalRange
        if (name === 'testCategory') {
            setFormData(prevState => ({
                ...prevState,
                testCategory: value,
                testName: '',
                unit: '',
                normalRange: ''
            }));
        } else if (name === 'testName') {
            // When testName changes, auto-fill unit and normalRange
            const selectedTest = testsData.find(
                test => test.category === formData.testCategory && test.name === value
            );
            setFormData(prevState => ({
                ...prevState,
                testName: value,
                unit: selectedTest ? selectedTest.unit : '',
                normalRange: selectedTest ? selectedTest.referenceRange : ''
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/tests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add test result');
            }

            // Refresh the test list
            await fetchTests();
            handleClearForm();
        } catch (err) {
            setError(err.message);
            console.error('Error adding test:', err);
        }
    };

    const handleClearForm = () => {
        setFormData({
            patientId: '',
            testCategory: '',
            testName: '',
            testValue: '',
            normalRange: '',
            unit: '',
            additionalNote: ''
        });
        setError(null);
    };

    const handleDeleteTest = async (testId) => {
        try {
            await fetch(`http://localhost:5000/api/tests/${testId}`, { method: 'DELETE' });
            fetchTests(); // Refresh the list
        } catch (e) {
            alert('Failed to delete test.');
        }
    };

    return (
        <div className="p-8 ml-64">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Tests</h1>
                <p className="text-gray-600 mt-2">Manage test results</p>
            </div>

            <div className="flex gap-2 mb-6">
                <button
                    className={`px-4 py-2 rounded font-semibold border ${activeTab === 'add' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}
                    onClick={() => setActiveTab('add')}
                >
                    Add/Edit Test
                </button>
                <button
                    className={`px-4 py-2 rounded font-semibold border ${activeTab === 'history' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}
                    onClick={() => setActiveTab('history')}
                >
                    Test History
                </button>
            </div>

            {activeTab === 'add' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Test Result</h2>
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                                <select
                                    name="patientId"
                                    value={formData.patientId}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Patient</option>
                                    {patients.map(patient => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.fullName} ({patient.patientCode})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Test Category</label>
                                <select
                                    name="testCategory"
                                    value={formData.testCategory}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
                                <select
                                    name="testName"
                                    value={formData.testName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={!formData.testCategory}
                                >
                                    <option value="">{formData.testCategory ? 'Select Test' : 'Select Category First'}</option>
                                    {filteredTests.map(test => (
                                        <option key={test.name} value={test.name}>{test.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Test Value</label>
                                <input
                                    type="text"
                                    name="testValue"
                                    value={formData.testValue}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 14"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Normal Range</label>
                                <input
                                    type="text"
                                    name="normalRange"
                                    value={formData.normalRange}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 10-20"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                <input
                                    type="text"
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleInputChange}
                                    placeholder="e.g., mg/dL"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    readOnly
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Note</label>
                            <textarea
                                name="additionalNote"
                                value={formData.additionalNote}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Save Test Result
                            </button>
                            <button
                                type="button"
                                onClick={handleClearForm}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Clear Form
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-bold mb-1">Test History</h2>
                    <p className="text-gray-600 mb-4">View and manage all test results</p>
                    <div className="space-y-6">
                        {tests.length === 0 ? (
                            <div className="text-gray-500 text-center py-4">No test results found.</div>
                        ) : (
                            tests.map((test) => (
                                <div key={test.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-base text-gray-800">{test.patientName}</span>
                                            <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded">{test.testCategory}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">{new Date(test.createdAt).toLocaleString()}</span>
                                            <button
                                                className="text-red-500 hover:text-red-700"
                                                title="Delete"
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to delete test results for ${test.patientName}?`)) {
                                                        handleDeleteTest(test.id);
                                                    }
                                                }}
                                            >
                                                <span className="material-icons text-base">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    <table className="w-full text-sm mb-2">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-600">
                                                <th className="py-2 px-3 text-left font-semibold">Test Name</th>
                                                <th className="py-2 px-3 text-left font-semibold">Value</th>
                                                <th className="py-2 px-3 text-left font-semibold">Normal Range</th>
                                                <th className="py-2 px-3 text-left font-semibold">Unit</th>
                                                <th className="py-2 px-3 text-left font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-t border-gray-200">
                                                <td className="py-2 px-3 font-medium text-gray-800 align-middle">{test.testName}</td>
                                                <td className="py-2 px-3 align-middle">{test.testValue}</td>
                                                <td className="py-2 px-3 align-middle">{test.normalRange}</td>
                                                <td className="py-2 px-3 align-middle">{test.unit}</td>
                                                <td className="py-2 px-3 align-middle">
                                                    <span className="inline-block min-w-[60px] text-center px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">Review</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    {test.additionalNote && (
                                        <div className="bg-gray-100 rounded p-2 text-sm text-gray-700 mt-2"><span className="font-semibold">Notes:</span> {test.additionalNote}</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tests; 