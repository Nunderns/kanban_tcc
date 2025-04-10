"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

const membersMock = [
  {
    id: 1,
    fullName: "Henri Okayama",
    displayName: "henri.okayama",
    email: "henri.okayama@gmail.com",
    accountType: "Admin",
    authentication: "Email",
  },
];

export default function MembersPage() {
  const [search, setSearch] = useState("");

  const filteredMembers = membersMock.filter((member) =>
    member.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen">
    <Sidebar />
    <div className="p-6 w-full overflow-auto bg-white text-gray-900">
      {/* Título e Ação */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Members</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2">
          <Plus size={16} /> Add member
        </button>
      </div>
  
      {/* Campo de busca */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 bg-white text-gray-900 px-3 py-2 rounded-md w-1/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
  
      {/* Tabela de membros */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm text-gray-900 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2 font-semibold">Full name</th>
              <th className="text-left px-4 py-2 font-semibold">Display name</th>
              <th className="text-left px-4 py-2 font-semibold">Email address</th>
              <th className="text-left px-4 py-2 font-semibold">Account type</th>
              <th className="text-left px-4 py-2 font-semibold">Authentication</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr
                key={member.id}
                className="border-t border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-2 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 text-white flex items-center justify-center rounded-full text-xs font-bold">
                    {member.fullName.charAt(0)}
                  </div>
                  {member.fullName}
                </td>
                <td className="px-4 py-2">{member.displayName}</td>
                <td className="px-4 py-2">{member.email}</td>
                <td className="px-4 py-2">{member.accountType}</td>
                <td className="px-4 py-2">{member.authentication}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  
  );
}
