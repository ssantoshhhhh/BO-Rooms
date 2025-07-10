import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoginError('');
    try {
      const res = await axios.post('http://localhost:8000/api/auth/login', data);
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-10 rounded-xl shadow-lg w-full max-w-sm border border-red-100"
      >
        <h2 className="text-3xl font-extrabold text-red-600 mb-8 text-center">Admin Login</h2>
        {loginError && <div className="mb-4 text-red-500 text-sm text-center">{loginError}</div>}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Email</label>
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            className="w-full border border-red-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition"
          />
          {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
        </div>
        <div className="mb-8">
          <label className="block text-gray-700 mb-2 font-medium">Password</label>
          <input
            type="password"
            {...register('password', { required: 'Password is required' })}
            className="w-full border border-red-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition"
          />
          {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
        </div>
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition shadow"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin; 