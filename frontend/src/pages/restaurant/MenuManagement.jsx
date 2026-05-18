import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiToggleLeft,
  FiToggleRight, FiSearch, FiSave, FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { menuAPI } from '../../services/api';
import { FoodTypeBadge, LoadingSpinner, Modal, EmptyState } from '../../components/common/UI';

const FOOD_TYPES = [
  { value: 'veg', label: '🌿 Veg' },
  { value: 'non_veg', label: '🍗 Non-Veg' },
  { value: 'vegan', label: '🌱 Vegan' },
  { value: 'egg', label: '🥚 Egg' },
];

const BLANK_ITEM = {
  name: '', description: '', price: '', food_type: 'veg',
  category: '', calories: '', prep_time: '',
  is_bestseller: false, is_available: true, is_customizable: false,
};

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(BLANK_ITEM);
  const [saving, setSaving] = useState(false);

  const [deleteModal, setDeleteModal] = useState(null); // item to delete

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await menuAPI.getMyItems();
      setItems(res.data.results || res.data);
    } catch { toast.error('Failed to load menu'); }
    finally { setLoading(false); }
  };

  const openAddForm = () => {
    setEditingItem(null);
    setForm(BLANK_ITEM);
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      food_type: item.food_type,
      category: item.category || '',
      calories: item.calories || '',
      prep_time: item.prep_time || '',
      is_bestseller: item.is_bestseller,
      is_available: item.is_available,
      is_customizable: item.is_customizable,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error('Name and price are required');
      return;
    }
    setSaving(true);
    try {
      if (editingItem) {
        const res = await menuAPI.updateItem(editingItem.id, form);
        setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...res.data } : i));
        toast.success('Item updated!');
      } else {
        const res = await menuAPI.createItem(form);
        setItems(prev => [res.data, ...prev]);
        toast.success('Item added to menu!');
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await menuAPI.toggleAvailability(item.id);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
      toast.success(`${item.name} is now ${!item.is_available ? 'available' : 'unavailable'}`);
    } catch { toast.error('Failed to update availability'); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await menuAPI.deleteItem(deleteModal.id);
      setItems(prev => prev.filter(i => i.id !== deleteModal.id));
      toast.success('Item deleted');
      setDeleteModal(null);
    } catch { toast.error('Failed to delete item'); }
  };

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType ? item.food_type === filterType : true;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container-page py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link to="/restaurant-dashboard" className="text-gray-400 hover:text-gray-600">
                <FiArrowLeft size={20} />
              </Link>
              <h1 className="font-display font-bold text-xl text-gray-900">Menu Management</h1>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {items.length} items
              </span>
            </div>
            <button onClick={openAddForm} className="btn-primary flex items-center gap-2 py-2 px-4">
              <FiPlus size={18} /> Add Item
            </button>
          </div>

          {/* Search + Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-9 py-2 text-sm"
                placeholder="Search menu items…"
              />
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="input-field py-2 text-sm w-36"
            >
              <option value="">All Types</option>
              {FOOD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="container-page py-6">
        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title={search ? 'No items found' : 'Menu is empty'}
            subtitle={search ? 'Try a different search term.' : 'Start building your menu by adding food items.'}
            action={!search && (
              <button onClick={openAddForm} className="btn-primary flex items-center gap-2 mx-auto">
                <FiPlus size={18} /> Add First Item
              </button>
            )}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className={`card transition-all ${!item.is_available ? 'opacity-60' : ''}`}
                >
                  {/* Item Image placeholder */}
                  <div className="w-full h-36 rounded-xl bg-gradient-to-br from-orange-50 to-primary-50 flex items-center justify-center text-4xl mb-3 overflow-hidden">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      : '🍽️'}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 leading-tight">{item.name}</h3>
                      <FoodTypeBadge type={item.food_type} />
                    </div>

                    {item.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-bold text-primary-500">₹{parseFloat(item.price).toFixed(0)}</span>
                      {item.is_bestseller && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                          ⭐ Bestseller
                        </span>
                      )}
                      {item.calories && (
                        <span className="text-xs text-gray-400">{item.calories} cal</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                        item.is_available ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {item.is_available
                        ? <><FiToggleRight size={18} /> Available</>
                        : <><FiToggleLeft size={18} /> Unavailable</>}
                    </button>

                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditForm(item)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteModal(item)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add / Edit Item Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingItem ? 'Edit Menu Item' : 'Add New Item'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
            <input className="input-field" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Paneer Butter Masala" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field resize-none" rows={2} value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe the dish…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input type="number" min="0" step="0.50" className="input-field" value={form.price} onChange={e => update('price', e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
              <select className="input-field" value={form.food_type} onChange={e => update('food_type', e.target.value)}>
                {FOOD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
              <input type="number" className="input-field" value={form.calories} onChange={e => update('calories', e.target.value)} placeholder="kcal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
              <input type="number" className="input-field" value={form.prep_time} onChange={e => update('prep_time', e.target.value)} placeholder="15" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" checked={form.is_bestseller} onChange={e => update('is_bestseller', e.target.checked)} className="rounded" />
              ⭐ Mark as Bestseller
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" checked={form.is_available} onChange={e => update('is_available', e.target.checked)} className="rounded" />
              ✅ Available to order
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <FiSave size={16} />}
              {editingItem ? 'Update Item' : 'Add Item'}
            </button>
            <button onClick={() => setFormOpen(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Item">
        <div className="text-center">
          <div className="text-5xl mb-3">🗑️</div>
          <p className="text-gray-700 mb-1">Are you sure you want to delete</p>
          <p className="font-bold text-gray-900 mb-5">"{deleteModal?.name}"?</p>
          <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={handleDelete} className="btn-danger flex-1">Yes, Delete</button>
            <button onClick={() => setDeleteModal(null)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
