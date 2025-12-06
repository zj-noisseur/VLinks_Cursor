import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import Layout from '../components/Layout';

interface Contribution {
  id: number;
  type: 'photo' | 'story';
  title: string;
  description: string;
  contributor: string;
  contributorRelation: string;
  image?: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

const initialContributions: Contribution[] = [
  {
    id: 1,
    type: 'photo',
    title: 'Chinese New Year 2015',
    description: 'Family gathering at the kopitiam during CNY celebrations',
    contributor: 'Aaron Lim',
    contributorRelation: 'Grandson',
    image: 'https://images.pexels.com/photos/1406761/pexels-photo-1406761.jpeg?auto=compress&cs=tinysrgb&w=400',
    timestamp: '2 hours ago',
    status: 'pending',
  },
  {
    id: 2,
    type: 'story',
    title: 'The Best Kaya Toast Recipe',
    description:
      'He taught me how to make the perfect kaya toast when I was 10. Every morning, he would wake up at 5am to prepare...',
    contributor: 'Sarah Chen',
    contributorRelation: 'Granddaughter',
    timestamp: '5 hours ago',
    status: 'pending',
  },
  {
    id: 3,
    type: 'photo',
    title: 'Fishing trip 1998',
    description: 'One of his favorite hobbies was fishing on weekends',
    contributor: 'David Tan',
    contributorRelation: 'Friend',
    image: 'https://images.pexels.com/photos/1123982/pexels-photo-1123982.jpeg?auto=compress&cs=tinysrgb&w=400',
    timestamp: '1 day ago',
    status: 'pending',
  },
];

export default function Admin() {
  const navigate = useNavigate();
  const [contributions, setContributions] = useState<Contribution[]>(initialContributions);

  const handleApprove = (id: number) => {
    setContributions(
      contributions.map((c) => (c.id === id ? { ...c, status: 'approved' as const } : c))
    );
  };

  const handleReject = (id: number) => {
    setContributions(
      contributions.map((c) => (c.id === id ? { ...c, status: 'rejected' as const } : c))
    );
  };

  const pendingContributions = contributions.filter((c) => c.status === 'pending');
  const reviewedContributions = contributions.filter((c) => c.status !== 'pending');

  return (
    <Layout>
      <div className="min-h-screen flex flex-col">
        <header className="p-6 border-b border-stone-200">
          <button
            onClick={() => navigate('/capsule')}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to capsule</span>
          </button>
          <h1 className="text-2xl font-bold text-stone-900">Admin Panel</h1>
          <p className="text-sm text-stone-600 mt-1">Review and approve contributions</p>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-stone-900">Pending Contributions</h3>
                <p className="text-sm text-stone-600 mt-1">
                  Review submissions from family and visitors
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center">
                <span className="font-bold text-stone-900">{pendingContributions.length}</span>
              </div>
            </div>
          </div>

          {pendingContributions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-stone-400" />
              </div>
              <p className="text-sm text-stone-600">All caught up! No pending contributions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="font-semibold text-stone-900">Pending Review</h2>
              {pendingContributions.map((contribution) => (
                <div
                  key={contribution.id}
                  className="bg-white border-2 border-stone-300 rounded-xl p-5 space-y-4"
                >
                  <div className="flex gap-4">
                    {contribution.image && (
                      <img
                        src={contribution.image}
                        alt={contribution.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-stone-900">{contribution.title}</h3>
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full flex-shrink-0">
                          {contribution.type}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 mb-3 line-clamp-2">
                        {contribution.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span>
                          From: <span className="font-medium">{contribution.contributor}</span> (
                          {contribution.contributorRelation})
                        </span>
                        <span>{contribution.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(contribution.id)}
                      className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(contribution.id)}
                      className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {reviewedContributions.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-stone-900">Recently Reviewed</h2>
              {reviewedContributions.map((contribution) => (
                <div
                  key={contribution.id}
                  className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-3"
                >
                  <div className="flex gap-4">
                    {contribution.image && (
                      <img
                        src={contribution.image}
                        alt={contribution.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-stone-900">{contribution.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                            contribution.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {contribution.status}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">
                        From: {contribution.contributor} ({contribution.contributorRelation})
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
