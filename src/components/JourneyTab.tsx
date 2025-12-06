import { MapPin } from 'lucide-react';

const highlights = [
  {
    id: 1,
    title: 'Family trip to Penang',
    year: '2001',
    location: 'Penang, Malaysia',
    description:
      'A memorable family vacation where we explored the streets of Georgetown and enjoyed the local food together.',
    image: 'https://images.pexels.com/photos/2414442/pexels-photo-2414442.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 2,
    title: 'Opening the coffee shop',
    year: '1965',
    location: 'Chinatown, Singapore',
    description:
      'Started his own kopitiam that became a neighborhood gathering place for over 40 years.',
    image: 'https://images.pexels.com/photos/2074130/pexels-photo-2074130.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 3,
    title: 'Wedding day',
    year: '1955',
    location: 'Singapore',
    description:
      'Married his childhood sweetheart in a small ceremony surrounded by close family and friends.',
    image: 'https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export default function JourneyTab() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold text-stone-900">Journey</h2>

      <div className="space-y-4">
        {highlights.map((highlight) => (
          <div
            key={highlight.id}
            className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer"
          >
            <img
              src={highlight.image}
              alt={highlight.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-400 font-medium">{highlight.location}</span>
                <span className="text-sm text-stone-300">• {highlight.year}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{highlight.title}</h3>
              <p className="text-sm text-stone-200 leading-relaxed">{highlight.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full py-4 px-6 border-2 border-stone-300 hover:border-stone-400 text-stone-700 font-semibold rounded-xl transition-colors">
        Load more memories
      </button>
    </div>
  );
}
