import React, { useState } from 'react';
import { MOCK_USERS } from '../../utils/mockData';
import { Users, Search, Shield, User, HardHat, Mail, Phone, Calendar } from 'lucide-react';

export default function ManageUsers() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const getRoleIcon = (role) => {
    if (role === 'admin') return <Shield className="w-3.5 h-3.5 text-indigo-600" />;
    if (role === 'worker') return <HardHat className="w-3.5 h-3.5 text-amber-600" />;
    return <User className="w-3.5 h-3.5 text-sky-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-7 h-7 text-indigo-600" />
          <span>User Directory & Stakeholders</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review registered citizens, municipal field personnel, and system administrators.
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {['ALL', 'citizen', 'worker', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                roleFilter === role
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Address / Ward</th>
                <th className="py-3.5 px-4">Complaints Filed</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{user.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{user.id}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-slate-700">{user.email}</p>
                    <p className="text-[10px] text-slate-400">{user.phone}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold capitalize bg-slate-100 text-slate-800">
                      {getRoleIcon(user.role)}
                      <span>{user.role}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {user.address}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {user.complaintsFiled}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

