import React, { useEffect, useState } from 'react';
import { fetchUsers } from '../api'; // ✅ adjust path if needed

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getUsers = async () => {
      try {
        const res = await fetchUsers();
        setUsers(res.data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('⚠️ Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  if (loading) return <p className="text-gray-600 text-center mt-4">⏳ Loading users...</p>;
  if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;

  return (
    <section className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-x-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">👥 Registered Users</h2>

      {users.length === 0 ? (
        <p className="text-gray-500 text-center">No users found.</p>
      ) : (
        <table className="min-w-full border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="py-2 px-4 text-left">#</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Phone</th>
              <th className="py-2 px-4 text-left">Education</th>
              <th className="py-2 px-4 text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr
                key={user.id || idx}
                className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="py-2 px-4">{idx + 1}</td>
                <td className="py-2 px-4">{user.name || '—'}</td>
                <td className="py-2 px-4">{user.email || '—'}</td>
                <td className="py-2 px-4">{user.phone || '—'}</td>
                <td className="py-2 px-4">{user.education || '—'}</td>
                <td className="py-2 px-4">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default UsersList;
