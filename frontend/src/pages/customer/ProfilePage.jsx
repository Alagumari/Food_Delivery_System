import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { MdLocationOn, MdAdd } from 'react-icons/md';
import toast from 'react-hot-toast';
import { selectUser, updateUserData } from '../../store/slices/authSlice';
import { authAPI } from '../../services/api';
import { Modal } from '../../components/common/UI';

export default function ProfilePage() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.full_name?.split(' ')[0] || '',
    last_name: user?.full_name?.split(' ').slice(1).join(' ') || '',
    phone: user?.phone || '',
  });

  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [addrModal, setAddrModal] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'home', full_address: '', city: '', state: '', pincode: '', landmark: '', is_default: false });

  useEffect(() => { loadAddresses(); }, []);

  const loadAddresses = async () => {
    try {
      const res = await authAPI.getAddresses();
      setAddresses(res.data.results || res.data);
    } catch { toast.error('Failed to load addresses'); }
    finally { setAddrLoading(false); }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      dispatch(updateUserData({ full_name: `${form.first_name} ${form.last_name}`, phone: form.phone }));
      toast.success('Profile updated!');
      setEditMode(false);
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleAddAddress = async () => {
    try {
      await authAPI.addAddress(newAddr);
      toast.success('Address added!');
      setAddrModal(false);
      setNewAddr({ label: 'home', full_address: '', city: '', state: '', pincode: '', landmark: '', is_default: false });
      loadAddresses();
    } catch { toast.error('Failed to add address'); }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await authAPI.deleteAddress(id);
      setAddresses(a => a.filter(x => x.id !== id));
      toast.success('Address removed');
    } catch { toast.error('Failed to delete address'); }
  };

  const handleSetDefault = async (id) => {
    try {
      await authAPI.setDefaultAddress(id);
      loadAddresses();
      toast.success('Default address updated');
    } catch { toast.error('Failed to update default'); }
  };

  const roleLabel = {
    customer: '👤 Customer',
    restaurant_owner: '🍕 Restaurant Owner',
    delivery_partner: '🚴 Delivery Partner',
    admin: '🛡️ Admin',
  };

  return (
    <div className="container-page py-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        {/* Profile Card */}
        <div className="card">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-orange">
                {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user?.full_name || 'User'}</h2>
                <span className="inline-block text-xs bg-primary-100 text-primary-700 font-medium px-2 py-0.5 rounded-full mt-1">
                  {roleLabel[user?.role] || user?.role}
                </span>
              </div>
            </div>
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600 font-medium">
                <FiEdit2 size={15} /> Edit
              </button>
            ) : (
              <button onClick={() => setEditMode(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {editMode ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                    <input className="input-field" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                    <input className="input-field" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input className="input-field pl-9" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 9876543210" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSaveProfile} disabled={saving} className="btn-primary flex items-center gap-2">
                    <FiSave size={16} />
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button onClick={() => setEditMode(false)} className="btn-secondary">Cancel</button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <InfoRow icon={<FiUser size={16} />} label="Full Name" value={user?.full_name || '—'} />
                <InfoRow icon={<FiMail size={16} />} label="Email" value={user?.email} />
                <InfoRow icon={<FiPhone size={16} />} label="Phone" value={user?.phone || 'Not added'} />
              </div>
            )}
          </div>
        </div>

        {/* Addresses (customers only) */}
        {user?.role === 'customer' && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MdLocationOn className="text-primary-500" size={20} />
                Saved Addresses
              </h3>
              <button onClick={() => setAddrModal(true)} className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 font-medium">
                <MdAdd size={18} /> Add New
              </button>
            </div>

            {addrLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MdLocationOn size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No saved addresses yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <div key={addr.id} className={`relative p-4 rounded-xl border-2 transition-all ${addr.is_default ? 'border-primary-200 bg-primary-50' : 'border-gray-100 bg-gray-50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-800 capitalize">{addr.label}</span>
                          {addr.is_default && <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">Default</span>}
                        </div>
                        <p className="text-sm text-gray-600">{addr.full_address}</p>
                        <p className="text-sm text-gray-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                        {addr.landmark && <p className="text-xs text-gray-400 mt-0.5">Near: {addr.landmark}</p>}
                      </div>
                      <div className="flex flex-col gap-1 ml-3">
                        {!addr.is_default && (
                          <button onClick={() => handleSetDefault(addr.id)} className="text-xs text-primary-500 hover:underline whitespace-nowrap">Set Default</button>
                        )}
                        <button onClick={() => handleDeleteAddress(addr.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Add Address Modal */}
      <Modal isOpen={addrModal} onClose={() => setAddrModal(false)} title="Add New Address">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
            <select className="input-field" value={newAddr.label} onChange={e => setNewAddr(a => ({ ...a, label: e.target.value }))}>
              <option value="home">🏠 Home</option>
              <option value="work">💼 Work</option>
              <option value="other">📍 Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
            <textarea className="input-field resize-none" rows={2} placeholder="House No., Street, Area…"
              value={newAddr.full_address} onChange={e => setNewAddr(a => ({ ...a, full_address: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input className="input-field" placeholder="Mumbai" value={newAddr.city} onChange={e => setNewAddr(a => ({ ...a, city: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input className="input-field" placeholder="Maharashtra" value={newAddr.state} onChange={e => setNewAddr(a => ({ ...a, state: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
              <input className="input-field" placeholder="400001" value={newAddr.pincode} onChange={e => setNewAddr(a => ({ ...a, pincode: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
              <input className="input-field" placeholder="Near…" value={newAddr.landmark} onChange={e => setNewAddr(a => ({ ...a, landmark: e.target.value }))} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={newAddr.is_default} onChange={e => setNewAddr(a => ({ ...a, is_default: e.target.checked }))} className="rounded" />
            Set as default address
          </label>
          <div className="flex gap-3 pt-2">
            <button onClick={handleAddAddress} className="btn-primary flex-1">Save Address</button>
            <button onClick={() => setAddrModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-400 flex-shrink-0">{icon}</span>
      <span className="text-gray-500 w-24 flex-shrink-0">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}
