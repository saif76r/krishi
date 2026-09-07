import React, { useState } from 'react';
import { ArrowLeft, Plus, Check, Trash2, Calendar, DollarSign, Package } from 'lucide-react';
import { INITIAL_INPUT_ITEMS } from '../data';
import { InputItem } from '../types';
import { toBengali } from './CreditScoreGauge';

interface Props {
  onBack: () => void;
}

export const InputsScreen: React.FC<Props> = ({ onBack }) => {
  const [items, setItems] = useState<InputItem[]>(INITIAL_INPUT_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ছত্রাকনাশক');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('প্যাকেট');
  const [newItemPrice, setNewItemPrice] = useState(300);

  const categories = ['বীজ', 'সার', 'কীটনাশক', 'ছত্রাকনাশক', 'অন্যান্য'];

  const toggleSelect = (id: string) => {
    setItems(
      items.map((it) => (it.id === id ? { ...it, selected: !it.selected } : it))
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: InputItem = {
      id: Date.now().toString(),
      category: selectedCategory as any,
      name: newItemName,
      quantity: newItemQty,
      unit: newItemUnit,
      price: newItemPrice,
      date: 'আজ, ৪ সেপ্টেম্বর ২০২৬',
      selected: true,
    };

    setItems([newItem, ...items]);
    setNewItemName('');
    setShowAddModal(false);
  };

  const filteredItems = items.filter(
    (item) => selectedCategory === 'সব' || item.category === selectedCategory
  );

  const totalCost = items
    .filter((it) => it.selected)
    .reduce((sum, it) => sum + it.price * it.quantity, 0);

  return (
    <div id="inputs-management-screen" className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          id="btn-inputs-back"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-stone-900">ইনপুট ব্যবস্থাপনা</h1>
        <button
          id="btn-add-input-item"
          onClick={() => setShowAddModal(true)}
          className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors shadow"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Category Pills (Screenshot 010102) */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Total Selected Cost Summary */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
        <div>
          <span className="text-xs text-stone-600 font-medium">নির্বাচিত উপকরণের মোট খরচ</span>
          <div className="text-lg font-black text-emerald-800">
            ৳ {toBengali(totalCost)}
          </div>
        </div>
        <button
          onClick={() => alert('ইনপুট হিসাব সংরক্ষিত হয়েছে।')}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
        >
          সেভ করুন
        </button>
      </div>

      {/* Inputs Item List (Screenshot 010102) */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            id={`input-item-row-${item.id}`}
            onClick={() => toggleSelect(item.id)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-xs ${
              item.selected
                ? 'bg-white border-emerald-500 ring-1 ring-emerald-400'
                : 'bg-stone-50 border-stone-200 opacity-75'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Checkbox box (Screenshot 010102) */}
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  item.selected ? 'bg-emerald-600 text-white' : 'border-2 border-stone-300'
                }`}
              >
                {item.selected && <Check className="w-4 h-4 stroke-[3]" />}
              </div>

              <div>
                <h3 className="text-xs font-bold text-stone-900">{item.name}</h3>
                <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                  <span>
                    পরিমাণ: {toBengali(item.quantity)} {item.unit}
                  </span>
                  <span>•</span>
                  <span>{item.date}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-black text-stone-900 block">
                ৳ {toBengali(item.price)}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                {item.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Input Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-stone-900">নতুন কৃষি উপকরণ যোগ করুন</h3>
            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">উপকরণের নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: ডিএপি সার বা এন্টাকল"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">পরিমাণ</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">একক</label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="প্যাকেট">প্যাকেট</option>
                    <option value="কেজি">কেজি</option>
                    <option value="লিটার">লিটার</option>
                    <option value="বস্তা">বস্তা</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">মূল্য (টাকা)</label>
                <input
                  type="number"
                  min="0"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow"
                >
                  যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
