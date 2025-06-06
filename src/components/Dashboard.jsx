import React, { useState, useEffect } from 'react';

const quickActions = [
  {
    title: 'Add Patient',
    description: 'Register new patient',
    icon: <span className="material-icons text-blue-600">person_add</span>,
    link: '/patients'
  },
  {
    title: 'Add Test',
    description: 'Add test results',
    icon: <span className="material-icons text-green-600">science</span>,
    link: '/tests'
  },
  {
    title: 'Generate Report',
    description: 'Create patient report',
    icon: <span className="material-icons text-indigo-600">description</span>,
    link: '/reports'
  },
  {
    title: 'View Analytics',
    description: 'Patient statistics',
    icon: <span className="material-icons text-purple-600">analytics</span>,
    link: '/analytics'
  }
];

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalTests: 0,
        reportsGenerated: 0,
        testsToday: 0
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            // Fetch total patients
            const patientsResponse = await fetch('http://localhost:5000/api/patients');
            if (!patientsResponse.ok) {
                throw new Error('Failed to fetch patients data');
            }
            const patientsData = await patientsResponse.json();

            // Fetch total tests
            const testsResponse = await fetch('http://localhost:5000/api/tests');
            if (!testsResponse.ok) {
                throw new Error('Failed to fetch tests data');
            }
            const testsData = await testsResponse.json();

            // Calculate stats
            const totalPatients = patientsData.length;
            const totalTests = testsData.length;
            // Reports generated = unique patient IDs in tests
            const reportsGenerated = new Set(testsData.map(t => t.patientId)).size;
            // Tests today 
            const today = new Date().toISOString().slice(0, 10);
            const testsToday = testsData.filter(test => {
                const testDate = new Date(test.createdAt).toISOString().slice(0, 10);
                return testDate === today;
            }).length;

            setStats({
                totalPatients,
                totalTests,
                reportsGenerated,
                testsToday
            });
            setError(null);
        } catch (err) {
            setError('Error loading dashboard data. Please try again later.');
            console.error('Error fetching dashboard stats:', err);
        }
    };

    const statsCards = [
        {
            title: 'Total Patients',
            value: stats.totalPatients,
            icon: 'people',
            description: 'Registered patients'
        },
        {
            title: 'Total Tests',
            value: stats.totalTests,
            icon: 'science',
            description: 'Tests conducted'
        },
        {
            title: 'Reports Generated',
            value: stats.reportsGenerated,
            icon: 'description',
            description: 'Reports generated'
        },
        {
            title: 'Tests Today',
            value: stats.testsToday,
            icon: 'event_available',
            description: 'Tests done today'
        }
    ];

    return (
        <div className="p-8 ml-64">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
                <p className="text-gray-600 mt-2">Welcome to MedLab Pro Dashboard</p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                            </div>
                            <span className="material-icons text-3xl text-gray-600">{stat.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <p className="text-gray-600 mb-4">Common tasks and shortcuts</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickActions.map((action, index) => (
                        <a
                            key={index}
                            href={action.link}
                            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer block"
                        >
                            <div className="text-2xl mb-3">{action.icon}</div>
                            <h3 className="font-semibold text-gray-800">{action.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">{action.description}</p>
                        </a>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                            <span className="material-icons text-2xl text-blue-500 mr-3">person_add</span>
                            <div>
                                <p className="text-sm font-medium text-gray-900">New Patient Registration</p>
                                <p className="text-sm text-gray-500">John Doe registered as a new patient</p>
                            </div>
                        </div>
                        <span className="text-sm text-gray-500">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                            <span className="material-icons text-2xl text-green-500 mr-3">science</span>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Test Completed</p>
                                <p className="text-sm text-gray-500">Blood test results are ready</p>
                            </div>
                        </div>
                        <span className="text-sm text-gray-500">4 hours ago</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
