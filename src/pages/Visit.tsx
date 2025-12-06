import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame } from 'lucide-react';
import Layout from '../components/Layout';

interface Tribute {
  id: number;
  text: string;
  author: string;
  timestamp: string;
}

export default function Visit() {
  const navigate = useNavigate();
  const [candles, setCandles] = useState(3);
  const [tributeText, setTributeText] = useState('');
  const [tributes, setTributes] = useState<Tribute[]>([
    {
      id: 1,
      text: 'Your kindness touched so many lives.',
      author: 'A visitor',
      timestamp: '1 hour ago',
    },
  ]);

  const lightCandle = () => {
    setCandles(candles + 1);
  };

  const handlePostTribute = () => {
    if (!tributeText.trim()) return;

    const newTribute: Tribute = {
      id: tributes.length + 1,
      text: tributeText,
      author: 'Anonymous',
      timestamp: 'Just now',
    };

    setTributes([newTribute, ...tributes]);
    setTributeText('');
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col bg-stone-900">
        <header className="p-6 border-b border-stone-700">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-stone-300 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <p className="text-sm text-stone-400">Visiting:</p>
          <h1 className="text-xl font-bold text-white">Lim Ah Kow</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-stone-800 rounded-2xl p-6 border border-stone-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-stone-700 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-stone-400 font-medium text-center px-2">
                  photo
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white mb-1">Lim Ah Kow</h2>
                <p className="text-sm text-stone-400">1930 – 2023</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-stone-300 leading-relaxed">
              <p>
                A beloved father, grandfather, and pillar of the community. Lim Ah Kow dedicated his
                life to serving others through his kopitiam in Chinatown, which became a gathering
                place for neighbors and friends for over 40 years.
              </p>
              <p>
                Known for his warm smile, generous spirit, and the best kaya toast in Singapore, he
                touched countless lives with his kindness and wisdom. He leaves behind a legacy of
                love, hard work, and community that will never be forgotten.
              </p>
            </div>
          </div>

          <button
            onClick={lightCandle}
            className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Flame className="w-5 h-5" />
            Light a candle
          </button>

          {candles > 0 && (
            <div className="bg-stone-800 rounded-xl p-4 border border-stone-700">
              <p className="text-sm text-stone-400 mb-3 text-center">
                {candles} {candles === 1 ? 'candle' : 'candles'} lit
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                {Array.from({ length: Math.min(candles, 20) }).map((_, i) => (
                  <span key={i} className="text-2xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                    🕯️
                  </span>
                ))}
                {candles > 20 && (
                  <span className="text-sm text-stone-400 ml-2">+{candles - 20} more</span>
                )}
              </div>
            </div>
          )}

          <div className="bg-stone-800 rounded-2xl p-6 border border-stone-700 space-y-4">
            <h3 className="font-semibold text-white">Leave a tribute</h3>

            <textarea
              value={tributeText}
              onChange={(e) => setTributeText(e.target.value)}
              placeholder="Share a memory or message..."
              className="w-full px-4 py-3 bg-stone-900 border border-stone-700 text-white placeholder-stone-500 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
              rows={3}
            />

            <button
              onClick={handlePostTribute}
              disabled={!tributeText.trim()}
              className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-700 disabled:cursor-not-allowed text-stone-900 font-semibold rounded-xl transition-colors"
            >
              Post tribute
            </button>
          </div>

          {tributes.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Recent tributes</h3>
              {tributes.map((tribute) => (
                <div key={tribute.id} className="bg-stone-800 rounded-xl p-4 border border-stone-700">
                  <p className="text-sm text-stone-300 leading-relaxed mb-2">{tribute.text}</p>
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>{tribute.author}</span>
                    <span>{tribute.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => navigate('/capsule')}
            className="w-full py-4 px-6 border-2 border-stone-600 hover:border-stone-500 text-stone-300 hover:text-white font-semibold rounded-xl transition-colors"
          >
            View full Life Capsule
          </button>
        </div>
      </div>
    </Layout>
  );
}
