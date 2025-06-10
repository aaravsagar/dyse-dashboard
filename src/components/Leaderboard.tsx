import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  collection,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ArrowUpRight, ArrowDownRight, Settings, BarChart2 } from 'lucide-react';

interface UserData {
  id: string;
  total: number;
  username: string;
}

const Leaderboard: React.FC = () => {
  const { guildId } = useParams<{ guildId: string }>();
  const [users, setUsers] = useState<UserData[]>([]);
  const [previousUsers, setPreviousUsers] = useState<UserData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!guildId) return;

      try {
        const usersRef = collection(db, 'servers', guildId, 'users');
        const snapshot = await getDocs(usersRef);

        const userData: UserData[] = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const balance = typeof data.balance === 'number' ? data.balance : 0;
            const bank = typeof data.bank === 'number' ? data.bank : 0;
            const total = balance + bank;

            let username = docSnap.id;

            try {
              const userDoc = await getDoc(doc(db, 'users', docSnap.id));
              const userInfo = userDoc.data();
              if (userInfo?.username) {
                username = userInfo.username;
              }
            } catch (err) {
              console.warn(`Failed to fetch username for ${docSnap.id}`);
            }

            return {
              id: docSnap.id,
              total,
              username
            };
          })
        );

        const sorted = userData.sort((a, b) => b.total - a.total);
        setPreviousUsers(users);
        setUsers(sorted);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, [guildId]);

  const getRankChange = (userId: string, currentIndex: number) => {
    const previousIndex = previousUsers.findIndex((u) => u.id === userId);
    if (previousIndex === -1) return null;

    if (previousIndex > currentIndex) return 'up';
    if (previousIndex < currentIndex) return 'down';
    return null;
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-red-900 via-black to-red-900">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-black/30 border-r border-red-500/20 p-6 space-y-4">
        <h2 className="text-white text-lg font-semibold mb-4">Navigation</h2>
        <Link
          to={`/guild/${guildId}`}
          className="flex items-center space-x-3 text-red-200 hover:text-white hover:bg-red-500/20 px-4 py-2 rounded-lg transition"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
        <Link
          to={`/dashboard/${guildId}/leaderboard`}
          className="flex items-center space-x-3 text-red-200 hover:text-white hover:bg-red-500/20 px-4 py-2 rounded-lg transition"
        >
          <BarChart2 className="w-5 h-5" />
          <span>Leaderboard</span>
        </Link>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-black/50 backdrop-blur-lg border-b border-red-500/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <h1 className="text-3xl font-bold text-white">🏆 Leaderboard</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {users.length === 0 ? (
            <p className="text-white">No users found.</p>
          ) : (
            <div className="space-y-4">
              {users.map((user, index) => {
                const change = getRankChange(user.id, index);
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg shadow border border-red-500/20"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-xl font-mono w-6 text-gray-300">{index + 1}</span>
                      <span className="text-lg font-semibold">{user.username}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-green-400">{user.total.toLocaleString()}</span>
                      {change === 'up' && (
                        <span className="text-green-500">
                          <ArrowUpRight size={18} />
                          <span className="text-sm">+{index - previousUsers.findIndex((u) => u.id === user.id)}</span>
                        </span>
                      )}
                      {change === 'down' && (
                        <span className="text-red-500">
                          <ArrowDownRight size={18} />
                          <span className="text-sm">-{previousUsers.findIndex((u) => u.id === user.id) - index}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Leaderboard;
