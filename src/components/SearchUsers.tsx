import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SearchUser {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
}

export function SearchUsers() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const searchTerm = query.trim().toLowerCase();
        const { data, error } = await supabase
          .from('users')
          .select('id, display_name, username, avatar_url')
          .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
          .limit(8);

        if (error) throw error;

        if (data) {
          setResults(data.map((u: any) => ({
            id: u.id,
            displayName: u.display_name,
            username: u.username,
            avatarUrl: u.avatar_url
          })));
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  function handleSelectUser(username: string) {
    setQuery('');
    setResults([]);
    setShowResults(false);
    navigate(`/usuario/${username}`);
  }

  function clearSearch() {
    setQuery('');
    setResults([]);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="w-full pl-9 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {showResults && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-4 px-3 text-center text-slate-400 text-sm">
              {query.length < 2 ? 'Escribe al menos 2 caracteres' : 'No se encontraron usuarios'}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.username)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-700/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-emerald-400 flex items-center justify-center text-white text-sm font-semibold overflow-hidden flex-shrink-0">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                      user.displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
                    <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
