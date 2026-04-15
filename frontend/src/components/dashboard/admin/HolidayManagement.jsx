import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Edit2, X, AlertCircle, CalendarDays } from 'lucide-react';
import api from '../../../api/axios';
import toast from 'react-hot-toast';

const HolidayManagement = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showModal, setShowModal] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fetchedRef = React.useRef(false);

    const [formData, setFormData] = useState({
        holiday_date: '',
        holiday_name: '',
        is_paid: true
    });

    useEffect(() => {
        // Prevent duplicate calls in React StrictMode
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchHolidays();

        return () => {
            fetchedRef.current = false;
        };
    }, [selectedYear]);

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/holidays?year=${selectedYear}`);
            setHolidays(res.data);
        } catch (error) {
            console.error('Error fetching holidays:', error);
            toast.error('Failed to load holidays');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingHoliday(null);
        setFormData({
            holiday_date: '',
            holiday_name: '',
            is_paid: true
        });
        setShowModal(true);
    };

    const handleEdit = (holiday) => {
        setEditingHoliday(holiday);
        setFormData({
            holiday_date: holiday.holiday_date.split('T')[0],
            holiday_name: holiday.holiday_name,
            is_paid: holiday.is_paid
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            if (editingHoliday) {
                await api.put(`/holidays/${editingHoliday.id}`, formData);
                toast.success('Holiday updated successfully');
            } else {
                await api.post('/holidays', formData);
                toast.success('Holiday added successfully');
            }
            setShowModal(false);
            fetchHolidays();

            // Trigger calendar refresh by dispatching a custom event
            window.dispatchEvent(new CustomEvent('holidayUpdated'));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save holiday');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this holiday?')) return;

        try {
            await api.delete(`/holidays/${id}`);
            toast.success('Holiday deleted successfully');
            fetchHolidays();

            // Trigger calendar refresh
            window.dispatchEvent(new CustomEvent('holidayUpdated'));
        } catch (error) {
            toast.error('Failed to delete holiday');
        }
    };



    const handleSyncFromCalendar = async () => {
        if (isSubmitting) return;

        if (!window.confirm(`Sync holidays from School Calendar for ${selectedYear}?\n\nThis will import all events marked as "Holiday" from the calendar.`)) return;

        setIsSubmitting(true);
        try {
            const res = await api.post('/holidays/sync-from-calendar', { year: selectedYear });
            toast.success(`✅ ${res.data.details}`);
            fetchHolidays(); // Refresh the list
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to sync from calendar');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Group holidays by month
    const holidaysByMonth = holidays.reduce((acc, holiday) => {
        const date = new Date(holiday.holiday_date);
        const month = date.getMonth() + 1;
        if (!acc[month]) acc[month] = [];
        acc[month].push(holiday);
        return acc;
    }, {});

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <CalendarDays size={28} />
                            Holiday Management
                        </h1>
                        <p className="text-purple-100 mt-1">Manage school holidays and events</p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-bold border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                        >
                            {years.map(year => (
                                <option key={year} value={year} className="text-gray-800">{year}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleSyncFromCalendar}
                            disabled={isSubmitting}
                            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-white/30 transition-all border border-white/30 disabled:opacity-50"
                        >
                            <Calendar size={18} />
                            Sync from Calendar
                        </button>

                        <button
                            onClick={handleAdd}
                            className="bg-white text-purple-600 px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-purple-50 transition-all shadow-md hover:scale-105 active:scale-95"
                        >
                            <Plus size={20} />
                            Add Holiday
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                <div className="text-sm text-blue-800">
                    <p className="font-bold mb-1">How it works:</p>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Add all school holidays for the year (festivals, events, etc.)</li>
                        <li>Holidays automatically appear as RED dates in the School Calendar</li>
                        <li>Attendance reports automatically show "H" for holiday dates</li>
                        <li>No additional steps needed - everything syncs automatically!</li>
                    </ol>
                </div>
            </div>

            {/* Holidays by Month */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {months.map((monthName, index) => {
                    const monthNum = index + 1;
                    const monthHolidays = holidaysByMonth[monthNum] || [];

                    return (
                        <div key={monthNum} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-white">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-lg">{monthName}</h3>
                                    <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-bold">
                                        {monthHolidays.length} holidays
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 space-y-2 min-h-[120px]">
                                {monthHolidays.length > 0 ? (
                                    monthHolidays.map(holiday => (
                                        <div key={holiday.id} className="flex justify-between items-start p-2 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-300 transition-colors group">
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800 text-sm">{holiday.holiday_name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(holiday.holiday_date).toLocaleDateString('en-GB')}
                                                    {!holiday.is_paid && <span className="ml-2 text-red-500 font-bold">(Unpaid)</span>}
                                                </p>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(holiday)}
                                                    className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(holiday.id)}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-400 text-sm py-8 italic">No holidays added</p>
                                )}
                            </div>


                        </div>
                    );
                })}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-2xl flex justify-between items-center">
                            <h2 className="text-xl font-bold">{editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Holiday Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Republic Day, Diwali"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    value={formData.holiday_name}
                                    onChange={e => setFormData({ ...formData, holiday_name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Date *</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    value={formData.holiday_date}
                                    onChange={e => setFormData({ ...formData, holiday_date: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_paid"
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                    checked={formData.is_paid}
                                    onChange={e => setFormData({ ...formData, is_paid: e.target.checked })}
                                />
                                <label htmlFor="is_paid" className="text-sm font-medium text-gray-700">
                                    This is a paid holiday
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Saving...' : (editingHoliday ? 'Update' : 'Add Holiday')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HolidayManagement;
