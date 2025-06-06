import React, { useState, useEffect } from 'react';

const ageGroups = [
  { label: '0-17 years', min: 0, max: 17 },
  { label: '18-35 years', min: 18, max: 35 },
  { label: '36-50 years', min: 36, max: 50 },
  { label: '51-65 years', min: 51, max: 65 },
  { label: '66+ years', min: 66, max: 200 },
];

const Analytics = () => {
  const [summary, setSummary] = useState({
    totalPatients: 0,
    totalTests: 0,
    abnormalResults: 0,
    reportsGenerated: 0,
  });
  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Demographics');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let patientsData = [];
      let testsData = [];
      try {
        const res = await fetch('http://localhost:5000/api/patients');
        if (res.ok) patientsData = await res.json();
      } catch (e) {}
      try {
        const res = await fetch('http://localhost:5000/api/tests');
        if (res.ok) testsData = await res.json();
      } catch (e) {}
      // Calculate abnormal results (example: status === 'High' or 'Low')
      const abnormalResults = testsData.filter(t => t.status === 'High' || t.status === 'Low').length;
      setSummary({
        totalPatients: patientsData.length,
        totalTests: testsData.length || 0,
        abnormalResults,
        reportsGenerated: 0, 
      });
      setPatients(patientsData);
      setTests(testsData);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Gender Distribution
  const genderCounts = {
    Male: 0,
    Female: 0,
    Other: 0,
  };
  patients.forEach(p => {
    if (p.gender === 'Male') genderCounts.Male++;
    else if (p.gender === 'Female') genderCounts.Female++;
    else genderCounts.Other++;
  });
  const totalGender = genderCounts.Male + genderCounts.Female + genderCounts.Other;

  // Age Distribution
  const ageCounts = ageGroups.map(g => 0);
  patients.forEach(p => {
    const age = parseInt(p.age, 10);
    const idx = ageGroups.findIndex(g => age >= g.min && age <= g.max);
    if (idx !== -1) ageCounts[idx]++;
  });
  const totalAges = ageCounts.reduce((a, b) => a + b, 0);

  const summaryCards = [
    {
      title: 'Total Patients',
      value: summary.totalPatients,
      subtitle: `+${summary.totalPatients} this month`,
      icon: <span className="material-icons text-blue-500">groups</span>,
    },
    {
      title: 'Tests Conducted',
      value: summary.totalTests,
      subtitle: `${summary.totalTests} today, ${summary.totalTests} this week`,
      icon: <span className="material-icons text-green-500">science</span>,
    },
    {
      title: 'Abnormal Results',
      value: summary.abnormalResults,
      subtitle: `${summary.totalTests ? Math.round((summary.abnormalResults/summary.totalTests)*100) : 0}% of total tests`,
      icon: <span className="material-icons text-red-500">error_outline</span>,
    },
    {
      title: 'Reports Generated',
      value: summary.reportsGenerated,
      subtitle: '0 pending reports',
      icon: <span className="material-icons text-purple-500">description</span>,
    },
  ];

  const tabs = ['Demographics', 'Test Analytics', 'Trends', 'Recent Activity'];

  return (
    <div className="p-8 ml-64">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics & Patient Statistics</h1>
      <p className="text-gray-600 mb-6">Comprehensive insights into laboratory operations and patient data</p>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">{card.title}</span>
              {card.icon}
            </div>
            <div className="text-2xl font-bold text-gray-800">{loading ? '...' : card.value}</div>
            <div className="text-xs text-gray-500 mt-2">{card.subtitle}</div>
          </div>
        ))}
      </div>
      {/* Tabs */}
      <div className="flex bg-gray-100 rounded mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`flex-1 px-4 py-2 font-semibold rounded transition-colors ${activeTab === tab ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      {activeTab === 'Demographics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gender Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-1 flex items-center"><span className="material-icons mr-2 text-blue-500">male</span> Gender Distribution</h2>
            <p className="text-gray-600 mb-4 text-sm">Patient demographics by gender</p>
            {['Male', 'Female', 'Other'].map((gender, idx) => {
              const color = gender === 'Male' ? 'bg-blue-500' : gender === 'Female' ? 'bg-pink-500' : 'bg-gray-500';
              const count = genderCounts[gender];
              const percent = totalGender ? Math.round((count / totalGender) * 100) : 0;
              return (
                <div key={gender} className="mb-2 flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${color}`}></span>{gender}
                  <div className="flex-1 mx-2 bg-gray-100 rounded h-2">
                    <div className={`${color} h-2 rounded`} style={{ width: `${percent}%` }}></div>
                  </div>
                  <span className="w-8 text-right">{count}</span>
                  <span className="ml-2 text-xs text-gray-500">{percent}%</span>
                </div>
              );
            })}
          </div>
          {/* Age Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-1 flex items-center"><span className="material-icons mr-2 text-green-500">bar_chart</span> Age Distribution</h2>
            <p className="text-gray-600 mb-4 text-sm">Patient demographics by age groups</p>
            {ageGroups.map((group, idx) => {
              const count = ageCounts[idx];
              const percent = totalAges ? Math.round((count / totalAges) * 100) : 0;
              return (
                <div key={group.label} className="mb-2 flex items-center">
                  <span className="w-32 text-sm text-gray-700">{group.label}</span>
                  <div className="flex-1 mx-2 bg-gray-100 rounded h-2">
                    <div className="bg-blue-500 h-2 rounded" style={{ width: `${percent}%` }}></div>
                  </div>
                  <span className="w-8 text-right">{count}</span>
                  <span className="ml-2 text-xs text-gray-500">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {activeTab !== 'Demographics' && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-gray-500 text-center">
          <span className="material-icons text-4xl mb-2 text-gray-300">insights</span>
          <div className="text-lg font-semibold mb-2">{activeTab} coming soon</div>
          <div className="text-sm">This section will provide more detailed analytics and insights.</div>
        </div>
      )}
    </div>
  );
};

export default Analytics; 