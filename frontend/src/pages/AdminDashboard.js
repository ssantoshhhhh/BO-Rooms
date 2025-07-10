import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const imagesInputRef = useRef();
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    } else {
      fetchRooms(token);
    }
    // eslint-disable-next-line
  }, [navigate]);

  const fetchRooms = async (token) => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
    } catch (err) {
      setRooms([]);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const openAddModal = () => {
    setEditRoom(null);
    reset();
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setEditRoom(room);
    // Set form values
    Object.entries(room).forEach(([key, value]) => {
      if (key !== 'images') setValue(key, value);
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images') {
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            formData.append('images', value[i]);
          }
        } else if (value && value.length) {
          for (let i = 0; i < value.length; i++) {
            formData.append('images', value[i]);
          }
        }
      } else {
        formData.append(key, value);
      }
    });
    try {
      if (editRoom) {
        await axios.put(`http://localhost:8000/api/rooms/${editRoom._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axios.post('http://localhost:8000/api/rooms', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      setShowModal(false);
      reset();
      setEditRoom(null);
      fetchRooms(token);
    } catch (err) {
      alert('Failed to save room');
    }
    setSubmitLoading(false);
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`http://localhost:8000/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRooms(token);
    } catch (err) {
      alert('Failed to delete room');
    }
  };

  const handleToggleStatus = async (room) => {
    const token = localStorage.getItem('adminToken');
    const newStatus = room.status === 'rented' ? 'available' : 'rented';
    try {
      await axios.put(`http://localhost:8000/api/rooms/${room._id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRooms(token);
    } catch (err) {
      alert('Failed to update room status');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setValue('images', files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const categories = [
    'Studio Apartment',
    '1 BHK',
    '2 BHK',
    '3 BHK',
    'Duplex Apartment',
    'Triplex Apartment',
    'Penthouse',
    'Loft Apartment',
    'Serviced Apartment',
    'Garden Apartment',
    'Condominium (Condo)',
    'Co-living Space'
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-red-600">Admin Dashboard</h2>
        <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
      </div>
      <button
        className="mb-4 bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 transition"
        onClick={openAddModal}
      >
        + Add New Room
      </button>
      <div className="bg-white p-4 rounded shadow">
        {loading ? (
          <div>Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div>No rooms found.</div>
        ) : (
          <ul>
            {rooms.map((room) => (
              <li key={room._id} className="border-b py-2 flex justify-between items-center">
                <span>{room.title} - {room.area} - ₹{room.rent} {room.status === 'rented' && <span className="ml-2 px-2 py-1 bg-red-400 text-white text-xs rounded">Rented</span>}</span>
                <div className="flex gap-2">
                  <button
                    className={`px-2 py-1 rounded text-xs font-semibold ${room.status === 'rented' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}
                    onClick={() => handleToggleStatus(room)}
                  >
                    {room.status === 'rented' ? 'Mark as Free' : 'Mark as Rented'}
                  </button>
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                    onClick={() => openEditModal(room)}
                  >Edit</button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                    onClick={() => handleDelete(room._id)}
                  >Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Modal for adding/editing room */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative mx-2 sm:mx-auto" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
              onClick={() => { setShowModal(false); setEditRoom(null); }}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-red-600">{editRoom ? 'Edit Room' : 'Add New Room'}</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-2">
                <label className="block text-gray-700 mb-1">Title</label>
                <input {...register('title', { required: true })} className="w-full border rounded px-2 py-1" />
                {errors.title && <span className="text-xs text-red-500">Title is required</span>}
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 mb-1">Description</label>
                <textarea {...register('description')} className="w-full border rounded px-2 py-1" />
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 mb-1">Category</label>
                <select {...register('category', { required: true })} className="w-full border rounded px-2 py-1">
                  <option value="">Select</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <span className="text-xs text-red-500">Category is required</span>}
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 mb-1">Area</label>
                <input {...register('area', { required: true })} className="w-full border rounded px-2 py-1" />
                {errors.area && <span className="text-xs text-red-500">Area is required</span>}
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 mb-1">Flat Type</label>
                <input {...register('flatType')} className="w-full border rounded px-2 py-1" placeholder="e.g. 2BHK, 3BHK" />
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 mb-1">Rent</label>
                <input type="number" {...register('rent', { required: true })} className="w-full border rounded px-2 py-1" />
                {errors.rent && <span className="text-xs text-red-500">Rent is required</span>}
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 mb-1">Owner Name</label>
                <input {...register('ownerName', { required: true })} className="w-full border rounded px-2 py-1" />
                {errors.ownerName && <span className="text-xs text-red-500">Owner name is required</span>}
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 mb-1">Owner Phone</label>
                <input {...register('ownerPhone', { required: true })} className="w-full border rounded px-2 py-1" />
                {errors.ownerPhone && <span className="text-xs text-red-500">Owner phone is required</span>}
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 mb-1">Owner WhatsApp</label>
                <input {...register('ownerWhatsapp')} className="w-full border rounded px-2 py-1" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={imagesInputRef}
                  onChange={e => {
                    const files = Array.from(e.target.files);
                    setValue('images', files, { shouldValidate: true, shouldDirty: true });
                    setImagePreviews(files.map(file => URL.createObjectURL(file)));
                  }}
                  className="w-full border rounded px-2 py-1"
                />
                <div className="flex gap-2 mt-2 flex-wrap">
                  {imagePreviews.map((src, idx) => (
                    <img key={idx} src={src} alt="Preview" className="w-16 h-16 object-cover rounded border" />
                  ))}
                </div>
                {errors.images && <span className="text-xs text-red-500">At least one image is required</span>}
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 transition mt-4"
                disabled={submitLoading}
              >
                {submitLoading ? 'Saving...' : (editRoom ? 'Update Room' : 'Add Room')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 