import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Trees, 
  FileText, 
  Utensils, 
  Hotel, 
  Loader2, 
  ExternalLink,
  ChevronRight,
  Plane,
  Compass
} from 'lucide-react';
import Markdown from 'react-markdown';
import { format } from 'date-fns';
import { runAgent, type AgentResult } from './lib/gemini';
import { cn } from './lib/utils';

interface AgentState {
  nature: AgentResult;
  permits: AgentResult;
  food: AgentResult;
  hotels: AgentResult;
}

const INITIAL_AGENT_STATE: AgentState = {
  nature: { agentName: 'Nature & Activities', content: '', status: 'idle' },
  permits: { agentName: 'Permits & Access', content: '', status: 'idle' },
  food: { agentName: 'Food & Dining', content: '', status: 'idle' },
  hotels: { agentName: 'Hotels & Lodging', content: '', status: 'idle' },
};

export default function App() {
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [agents, setAgents] = useState<AgentState>(INITIAL_AGENT_STATE);
  const [isPlanning, setIsPlanning] = useState(false);

  const handlePlanTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !startDate || !endDate) return;

    setIsPlanning(true);
    setAgents({
      nature: { ...INITIAL_AGENT_STATE.nature, status: 'loading' },
      permits: { ...INITIAL_AGENT_STATE.permits, status: 'loading' },
      food: { ...INITIAL_AGENT_STATE.food, status: 'loading' },
      hotels: { ...INITIAL_AGENT_STATE.hotels, status: 'loading' },
    });

    const dateRange = `${format(new Date(startDate), 'MMM d')} to ${format(new Date(endDate), 'MMM d, yyyy')}`;

    // Define prompts
    const prompts = {
      nature: `Review interesting things to do, outside hiking trails, nature, scenic vistas in ${location}. Focus on the best outdoor experiences.`,
      permits: `Check to confirm if any special permits may be required for national parks or nature areas in ${location}. Provide details on costs, times of entry, and access requirements.`,
      food: `Look for interesting food options in ${location} for breakfast (7am-11am), lunch (11am-3pm), and dinner (4pm-9pm). Recommend local favorites.`,
      hotels: `Review which hotels from Hilton, IHG, Marriott, and Hyatt are available in ${location} for the dates ${dateRange}. Create a report of estimated costs and availability.`,
    };

    // Run agents in parallel
    const results = await Promise.all([
      runAgent('Nature & Activities', prompts.nature),
      runAgent('Permits & Access', prompts.permits),
      runAgent('Food & Dining', prompts.food),
      runAgent('Hotels & Lodging', prompts.hotels),
    ]);

    setAgents({
      nature: results[0],
      permits: results[1],
      food: results[2],
      hotels: results[3],
    });
    setIsPlanning(false);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] font-sans selection:bg-orange-100">
      {/* Hero Section */}
      <header className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-[#1c1917]">
        <img 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070" 
          alt="Mountain landscape" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Compass className="w-6 h-6 text-orange-400" />
              <span className="text-orange-400 font-medium tracking-[0.2em] uppercase text-xs">Orchestrated Intelligence</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white mb-6">
              Randy's Travel <span className="italic font-serif">Orchestrator</span>
            </h1>
          </motion.div>

          {/* Search Bar */}
          <motion.form 
            onSubmit={handlePlanTrip}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl flex flex-col md:flex-row gap-2"
          >
            <div className="flex-1 flex items-center px-4 gap-3 bg-white/5 rounded-xl border border-white/10">
              <MapPin className="w-5 h-5 text-white/60" />
              <input 
                type="text" 
                placeholder="Where to explore?" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-white/40 py-4"
                required
              />
            </div>
            <div className="flex items-center px-4 gap-3 bg-white/5 rounded-xl border border-white/10">
              <Calendar className="w-5 h-5 text-white/60" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-white placeholder:text-white/40 py-4 [color-scheme:dark]"
                required
              />
              <span className="text-white/40">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-white placeholder:text-white/40 py-4 [color-scheme:dark]"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={isPlanning}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white px-8 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              {isPlanning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Orchestrating...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Plan Trip
                </>
              )}
            </button>
          </motion.form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <AnimatePresence mode="wait">
          {!isPlanning && Object.values(agents).every(a => a.status === 'idle') ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plane className="w-10 h-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-light text-[#44403c]">Enter a destination to begin orchestration</h2>
              <p className="text-[#78716c] mt-2">Four specialized agents will coordinate to build your perfect itinerary.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <AgentCard agent={agents.nature} icon={<Trees className="w-5 h-5" />} color="bg-emerald-50 text-emerald-700" />
              <AgentCard agent={agents.permits} icon={<FileText className="w-5 h-5" />} color="bg-blue-50 text-blue-700" />
              <AgentCard agent={agents.food} icon={<Utensils className="w-5 h-5" />} color="bg-orange-50 text-orange-700" />
              <AgentCard agent={agents.hotels} icon={<Hotel className="w-5 h-5" />} color="bg-purple-50 text-purple-700" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-[#e7e5e4] py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-orange-500" />
            <span className="font-serif italic text-lg">Randy's Travel Orchestrator</span>
          </div>
          <p className="text-sm text-[#78716c]">Powered by Gemini 3 Flash & Google Search Grounding</p>
        </div>
      </footer>
    </div>
  );
}

function AgentCard({ agent, icon, color }: { agent: AgentResult; icon: React.ReactNode; color: string }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-[#e7e5e4] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-6 border-b border-[#f5f5f4] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", color)}>
            {icon}
          </div>
          <h3 className="font-medium text-lg">{agent.agentName}</h3>
        </div>
        <div className="flex items-center gap-2">
          {agent.status === 'loading' && (
            <div className="flex items-center gap-2 text-xs text-[#78716c] font-medium uppercase tracking-wider">
              <Loader2 className="w-3 h-3 animate-spin" />
              Analyzing
            </div>
          )}
          {agent.status === 'success' && (
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          )}
        </div>
      </div>

      <div className="p-8">
        {agent.status === 'loading' ? (
          <div className="space-y-4">
            <div className="h-4 bg-[#f5f5f4] rounded-full w-3/4 animate-pulse" />
            <div className="h-4 bg-[#f5f5f4] rounded-full w-full animate-pulse" />
            <div className="h-4 bg-[#f5f5f4] rounded-full w-5/6 animate-pulse" />
            <div className="h-4 bg-[#f5f5f4] rounded-full w-2/3 animate-pulse" />
          </div>
        ) : agent.status === 'error' ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm">
            {agent.content}
          </div>
        ) : agent.content ? (
          <div className="prose prose-stone prose-sm max-w-none prose-headings:font-medium prose-headings:text-[#1c1917] prose-p:text-[#44403c] prose-li:text-[#44403c]">
            <Markdown>{agent.content}</Markdown>
          </div>
        ) : (
          <div className="text-[#a8a29e] italic text-sm">Waiting for orchestration...</div>
        )}

        {agent.sources && agent.sources.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#f5f5f4]">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#a8a29e] mb-3">Sources & Grounding</h4>
            <div className="flex flex-wrap gap-2">
              {agent.sources.map((source, i) => (
                <a 
                  key={i}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f5f4] hover:bg-[#e7e5e4] text-[#44403c] text-xs rounded-full transition-colors group"
                >
                  <span className="truncate max-w-[150px]">{source.title}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
