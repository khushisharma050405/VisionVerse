import { useState, useEffect } from 'react'
import { Home, History as H, Info, Settings as S, Aperture, LogOut } from 'lucide-react'
import useLocalStorage from './hooks/useLocalStorage'
import { thumb } from './components/ui'
import Auth from './pages/Auth'
import Generate from './pages/Generate'
import History from './pages/History'
import About from './pages/About'
import Settings, { DEFAULT_SETTINGS } from './pages/Settings'

const NAV = [
  ['generate', 'Generate caption', Home],
  ['history', 'History', H],
  ['about', 'About', Info],
  ['settings', 'Settings', S],
]

export default function App() {
  const [auth, setAuth] = useLocalStorage('visionverse.auth', null)
  const [page, setPage] = useState('generate')
  const [history, setHistory] = useLocalStorage('visionverse.history', [])
  const [settings, setSettings] = useLocalStorage('visionverse.settings', DEFAULT_SETTINGS)
  const [session, setSession] = useState({ image: null, result: null })

  useEffect(() => {
    if (window.location.search.includes('logout') || window.location.search.includes('login')) {
      setAuth(null)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // If not authenticated, render Login/Sign-Up page
  if (!auth) {
    return (
      <Auth
        onLogin={userData => {
          setAuth(userData)
          setPage('generate')
        }}
      />
    )
  }

  const cfg = {
    ...DEFAULT_SETTINGS,
    ...settings,
    defaults: { ...DEFAULT_SETTINGS.defaults, ...settings.defaults },
  }

  const save = async (image, result) => {
    const t = await thumb(image.dataUrl)
    setHistory(h => [
      {
        id: crypto.randomUUID?.() || String(Date.now()),
        name: image.name,
        sampleId: image.sampleId,
        thumb: t,
        result,
      },
      ...h,
    ].slice(0, 50))
  }

  const open = h => {
    setSession({
      image: { dataUrl: h.thumb, name: h.name, sampleId: h.sampleId },
      result: h.result,
    })
    setPage('generate')
  }

  const handleLogout = () => {
    setAuth(null)
  }

  const nav = (cls, item) => {
    const [id, label, Icon] = item
    return (
      <button
        key={id}
        onClick={() => setPage(id)}
        aria-current={page === id ? 'page' : undefined}
        className={`${cls} transition-colors cursor-pointer ${
          page === id
            ? 'bg-forest-600/60 text-white font-medium'
            : 'text-cream-100/70 hover:bg-forest-700/60 hover:text-cream-100'
        }`}
      >
        <Icon size={18} />
        <span>{label}</span>
      </button>
    )
  }

  return (
    <div className="min-h-screen md:flex bg-cream-50 text-ink">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 bg-forest-900 text-cream-100 flex-col p-5 sticky top-0 h-screen select-none border-r border-forest-800">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-forest-800/80 flex items-center justify-center text-cream-100 shadow-sm border border-forest-700/50">
            <Aperture size={22} />
          </div>
          <div>
            <p className="font-serif text-xl leading-none tracking-wide">VisionVerse</p>
            <p className="text-[11px] text-cream-100/60 mt-1">Image caption generator</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1.5">
          {NAV.map(n => nav('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left', n))}
        </nav>

        {/* User Card & Logout */}
        <div className="mt-auto pt-4 border-t border-forest-800/70">
          <div className="flex items-center gap-3 px-2 py-1 mb-2">
            <div className="w-8 h-8 rounded-full bg-forest-700 border border-forest-600/60 flex items-center justify-center text-xs font-semibold text-cream-100 shrink-0">
              {auth.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-cream-100 truncate">{auth.name || 'User'}</p>
              <p className="text-[10px] text-cream-100/50 truncate">{auth.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out of VisionVerse"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-cream-100/70 hover:bg-forest-800 hover:text-cream-100 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>

          <p className="mt-4 font-serif italic text-xs text-cream-100/40 text-center">
            See the world through AI’s eyes.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between bg-forest-900 text-cream-100 px-4 py-3 sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-2">
            <Aperture size={20} />
            <span className="font-serif text-lg">VisionVerse</span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="flex items-center gap-1.5 text-xs text-cream-100/70 hover:text-white p-1.5 rounded-lg hover:bg-forest-800 cursor-pointer"
          >
            <LogOut size={15} />
            <span className="text-[11px]">Logout</span>
          </button>
        </header>

        <main className="px-5 md:px-10 py-8 pb-28 md:pb-12 max-w-7xl">
          {page === 'generate' && (
            <Generate session={session} setSession={setSession} settings={cfg} onSave={save} />
          )}
          {page === 'history' && (
            <History
              history={history}
              onOpen={open}
              onDelete={id => setHistory(h => h.filter(x => x.id !== id))}
              onClear={() => setHistory([])}
            />
          )}
          {page === 'about' && <About />}
          {page === 'settings' && (
            <Settings
              settings={cfg}
              setSettings={setSettings}
              historyCount={history.length}
              onClear={() => setHistory([])}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-forest-900 grid grid-cols-4 p-1.5 border-t border-forest-800 z-20">
        {NAV.map(([id, l, I]) =>
          nav('flex flex-col items-center gap-1 py-1.5 rounded-lg text-[10px]', [id, l.split(' ')[0], I])
        )}
      </nav>
    </div>
  )
}
