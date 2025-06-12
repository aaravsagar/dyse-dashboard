import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  collection,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Layout from './Layout';

interface UserData {
  id: string;
  total: number;
  username: string;
}

const Leaderboard: React.FC = () => {
  const { guildId } = useParams<{ guildId: string }>();
  const [users, setUsers] = useState<UserData[]>([]);
  const [previousUsers, setPreviousUsers] = useState<UserData[]>([]);

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
    <Layout guildId={guildId} title="🏆 Leaderboard" subtitle="Top users by total currency">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {users.length === 0 ? (
          <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-12 text-center">
            <p className="text-white text-lg">No users found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user, index) => {
              const change = getRankChange(user.id, index);
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-6 bg-gray-900 border border-red-500/30 rounded-lg shadow hover:border-red-500/50 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-xl font-mono w-8 text-red-300 font-bold">#{index + 1}</span>
                    <span className="text-lg font-semibold text-white">{user.username}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-green-400 text-lg">{user.total.toLocaleString()}</span>
                    {change === 'up' && (
                      <div className="flex items-center text-green-500">
                        <ArrowUpRight size={18} />
                        <span className="text-sm">+{index - previousUsers.findIndex((u) => u.id === user.id)}</span>
                      </div>
                    )}
                    {change === 'down' && (
                      <div className="flex items-center text-red-500">
                        <ArrowDownRight size={18} />
                        <span className="text-sm">-{previousUsers.findIndex((u) => u.id === user.id) - index}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Leaderboard;