import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { useAuth } from '../AuthContext';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || password.length < 6) {
      setError('Please enter a valid email and password (6+ chars).');
      return;
    }
    signIn(email);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fe]">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <div className="bg-blue-100 rounded-full p-4 mb-4">
          <img src={logo} alt="MedLab Pro Logo" className="w-16 h-16 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold mb-1">MedLab Pro</h1>
        <p className="text-gray-500 mb-6">Laboratory Management System</p>
        <form className="w-full" onSubmit={handleSubmit}>
          <label className="block text-gray-700 mb-1">Email</label>
          <input type="email" className="w-full mb-4 pzx-3 py-2 rounded bg-blue-50 border border-blue-100 focus:outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
          <label className="block text-gray-700 mb-1">Password</label>
          <input type="password" className="w-full mb-4 px-3 py-2 rounded bg-blue-50 border border-blue-100 focus:outline-none" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">Sign In</button>
        </form>
        <div className="text-gray-400 text-sm mt-4 text-center">Demo credentials: any email + password (6+ chars)</div>
      </div>
    </div>
  );
};

export default SignIn; 