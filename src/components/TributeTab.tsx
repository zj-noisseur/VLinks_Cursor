import { useState } from 'react';
import { Heart, X } from 'lucide-react';

interface Tribute {
  id: number;
  text: string;
  author: string;
  timestamp: string;
}

const initialTributes: Tribute[] = [
  {
    id: 1,
    text: 'Hey we miss you. Hope you are doing fine.',
    author: 'Anonymous',
    timestamp: '2 days ago',
  },
  {
    id: 2,
    text: 'Thank you for teaching us to be kind.',
    author: 'Sarah L.',
    timestamp: '1 week ago',
  },
  {
    id: 3,
    text: 'Your coffee shop was more than just a place to eat. It was home.',
    author: 'David T.',
    timestamp: '2 weeks ago',
  },
];

export default function TributeTab() {
  const [tributes, setTributes] = useState<Tribute[]>(initialTributes);
  const [showForm, setShowForm] = useState(false);
  const [newTribute, setNewTribute] = useState('');
  const [authorName, setAuthorName] = useState('');

  const handleSubmitTribute = () => {
    if (!newTribute.trim()) return;

    const tribute: Tribute = {
      id: tributes.length + 1,
      text: newTribute,
      author: authorName || 'Anonymous',
      timestamp: 'Just now',
    };

    setTributes([tribute, ...tributes]);
    setNewTribute('');
    setAuthorName('');
    setShowForm(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-900">Tribute Wall</h2>
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          Write tribute
        </button>
      </div>

      <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <Heart className="w-12 h-12 text-amber-600 fill-amber-600" />
        </div>
        <h3 className="text-xl font-bold text-stone-900 mb-2">Tribute Wall</h3>
        <p className="text-sm text-stone-700">
          A place for loved ones and visitors to share memories and messages
        </p>
        <div className="mt-6 text-3xl font-bold text-amber-800">{tributes.length}</div>
        <p className="text-xs text-stone-600 mt-1">tributes shared</p>
      </div>

      <div className="space-y-4">
        {tributes.map((tribute) => (
          <div key={tribute.id} className="bg-stone-50 rounded-xl p-5 border border-stone-200">
            <p className="text-sm text-stone-900 leading-relaxed mb-3">{tribute.text}</p>
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-medium">{tribute.author}</span>
              <span>{tribute.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-[430px] mx-auto p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-stone-900">Write a tribute</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Your name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Optional (Anonymous if left blank)"
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Your tribute
              </label>
              <textarea
                value={newTribute}
                onChange={(e) => setNewTribute(e.target.value)}
                placeholder="Share a memory or message..."
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none resize-none"
                rows={4}
              />
            </div>

            <button
              onClick={handleSubmitTribute}
              disabled={!newTribute.trim()}
              className="w-full py-4 px-6 bg-amber-400 hover:bg-amber-500 disabled:bg-stone-300 disabled:cursor-not-allowed text-stone-900 font-semibold rounded-xl transition-colors"
            >
              Post tribute
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
