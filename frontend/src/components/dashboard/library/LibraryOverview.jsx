import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { Book, BookOpen, Clock, AlertCircle } from 'lucide-react';

const LibraryOverview = () => {
    const [stats, setStats] = useState({
        totalBooks: 0,
        issuedBooks: 0,
        overdueBooks: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [booksRes, transRes] = await Promise.all([
                api.get('/library/books'),
                api.get('/library/transactions')
            ]);

            const books = booksRes.data;
            const transactions = transRes.data;

            const totalBooks = books.length;
            const issuedBooks = books.filter(b => b.status === 'Issued').length;

            // Calculate overdue
            const now = new Date();
            const overdue = transactions.filter(t =>
                t.status === 'Issued' && new Date(t.due_date) < now
            ).length;

            setStats({ totalBooks, issuedBooks, overdueBooks: overdue });
        } catch (error) {
            console.error('Failed to load library stats');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, bg }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
                <Icon size={28} />
            </div>
            <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
                <h4 className="text-3xl font-extrabold text-slate-800">{loading ? '...' : value}</h4>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Books"
                    value={stats.totalBooks}
                    icon={Book}
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                />
                <StatCard
                    title="Issued Books"
                    value={stats.issuedBooks}
                    icon={BookOpen}
                    color="text-amber-600"
                    bg="bg-amber-50"
                />
                <StatCard
                    title="Overdue"
                    value={stats.overdueBooks}
                    icon={AlertCircle}
                    color="text-red-600"
                    bg="bg-red-50"
                />
            </div>

            {/* Placeholder for future charts or detailed lists */}
            <div className={`p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center text-slate-400 bg-slate-50/50`}>
                <Clock className="mx-auto mb-2 opacity-20" size={48} />
                <p className="font-medium">More analytics coming soon...</p>
            </div>
        </div>
    );
};

export default LibraryOverview;
