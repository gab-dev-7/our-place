import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { ArrowLeft, Plane, Heart, DollarSign, Plus, Trash2 } from "lucide-react";

// --- Sub-Components (Moved outside the main component) ---

const DynamicView = ({ imageUrl }) => (
  <div
    className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
    style={{
      backgroundImage: `url(${imageUrl || "/ourRoom2.png"})`,
    }}
  >
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
  </div>
);

const TravelPlanner = ({
  travelGoals,
  newTravelGoal,
  setNewTravelGoal,
  handleAddNewTravelGoal,
  handleUpdateSaving,
  handleDeleteTravelGoal,
  handleUpdateStatus,
}) => (
  <div className="p-8 bg-slate-800/70 rounded-xl border border-slate-700">
    <h2 className="text-3xl font-bold mb-4 text-blue-300">Travel Bucket List ✈️</h2>
    <form onSubmit={handleAddNewTravelGoal} className="mb-8 p-4 bg-slate-900/50 rounded-lg flex items-end gap-4">
      <input type="text" value={newTravelGoal.location_name} onChange={(e) => setNewTravelGoal({...newTravelGoal, location_name: e.target.value})} className="w-full p-2 bg-slate-800 rounded-md" placeholder="e.g., Tokyo, Japan"/>
      <input type="date" value={newTravelGoal.target_date} onChange={(e) => setNewTravelGoal({...newTravelGoal, target_date: e.target.value})} className="w-full p-2 bg-slate-800 rounded-md"/>
      <input type="number" value={newTravelGoal.savings_goal_amount} onChange={(e) => setNewTravelGoal({...newTravelGoal, savings_goal_amount: e.target.value})} className="w-full p-2 bg-slate-800 rounded-md" placeholder="Savings Goal"/>
      <button type="submit" className="bg-blue-600 p-2 rounded-md h-10"><Plus size={24}/></button>
    </form>
    <div className="space-y-4">
      {travelGoals.map(goal => (
        <div key={goal.id} className="p-4 bg-slate-900/50 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold">{goal.location_name}</h3>
              <p className="text-sm text-slate-400">Target: {goal.target_date || "Anytime"}</p>
              <div className="flex gap-2 mt-2">
                {['Dreaming', 'Planning', 'Booked'].map(status => <button key={status} onClick={() => handleUpdateStatus(goal.id, status)} className={`px-2 py-1 text-xs rounded-full ${goal.status === status ? 'bg-green-500' : 'bg-slate-700'}`}>{status}</button>)}
              </div>
            </div>
            <button onClick={() => handleDeleteTravelGoal(goal.id)} className="text-slate-500 hover:text-red-500"><Trash2 size={18}/></button>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="flex items-center"><DollarSign size={14} className="mr-1"/> Savings</span>
              <span>${goal.current_saved_amount || 0} / ${goal.savings_goal_amount}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-4"><div className="bg-blue-500 h-4 rounded-full" style={{width: `${(goal.current_saved_amount / goal.savings_goal_amount) * 100}%`}}></div></div>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateSaving(goal.id, e.target.elements.amount.value); e.target.elements.amount.value = ''; }} className="flex gap-2 mt-2">
              <input type="number" name="amount" className="w-32 p-1 bg-slate-800 rounded-md" placeholder="Add funds..."/>
              <button type="submit" className="bg-green-600 p-1 rounded-md"><Plus size={18}/></button>
            </form>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const LifePlanner = ({
  lifeGoals,
  newLifeGoal,
  setNewLifeGoal,
  handleAddNewLifeGoal,
  handleUpdateProgress,
  handleToggleComplete,
  handleDeleteLifeGoal,
  session,
}) => (
  <div className="p-8 bg-slate-800/70 rounded-xl border border-slate-700">
    <h2 className="text-3xl font-bold mb-4 text-purple-300">Shared Life Goals ❤️</h2>
    <form onSubmit={handleAddNewLifeGoal} className="mb-8 p-4 bg-slate-900/50 rounded-lg flex items-end gap-4">
        <input type="text" value={newLifeGoal.goal_name} onChange={(e) => setNewLifeGoal({...newLifeGoal, goal_name: e.target.value})} className="w-full p-2 bg-slate-800 rounded-md" placeholder="e.g., Buy a house"/>
        <select value={newLifeGoal.owner_id} onChange={(e) => setNewLifeGoal({...newLifeGoal, owner_id: e.target.value})} className="p-2 bg-slate-800 rounded-md">
            <option value="Shared">Shared</option>
            <option value={session.user.id}>Mine</option>
            <option value="partner_id">Partner&apos;s</option>
        </select>
        <input type="date" value={newLifeGoal.target_date} onChange={(e) => setNewLifeGoal({...newLifeGoal, target_date: e.target.value})} className="p-2 bg-slate-800 rounded-md"/>
        <button type="submit" className="bg-purple-600 p-2 rounded-md h-10"><Plus size={24}/></button>
    </form>
    <div className="space-y-4">
        {lifeGoals.map(goal => (
            <div key={goal.id} className={`p-4 bg-slate-900/50 rounded-lg ${goal.is_complete ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold">{goal.goal_name}</h3>
                        <p className="text-sm text-slate-400">Owner: {goal.owner_id === 'Shared' ? 'Shared' : (goal.owner_id === session.user.id ? 'You' : 'Partner')}</p>
                    </div>
                    <button onClick={() => handleDeleteLifeGoal(goal.id)} className="text-slate-500 hover:text-red-500"><Trash2 size={18}/></button>
                </div>
                <div className="mt-4">
                    <div className="flex justify-between items-center text-sm mb-1">
                        <span>Progress</span>
                        <span>{goal.progress_percent}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-4 relative">
                        <div className="bg-purple-500 h-4 rounded-full" style={{width: `${goal.progress_percent}%`}}></div>
                        <input type="range" min="0" max="100" value={goal.progress_percent} onChange={(e) => handleUpdateProgress(goal.id, e.target.value)} className="absolute w-full h-full inset-0 opacity-0 cursor-pointer"/>
                    </div>
                    <button onClick={() => handleToggleComplete(goal.id, goal.is_complete)} className={`mt-2 px-2 py-1 text-xs rounded-full ${goal.is_complete ? 'bg-green-500' : 'bg-slate-700'}`}>
                        {goal.is_complete ? 'Completed' : 'Mark as Complete'}
                    </button>
                </div>
            </div>
        ))}
    </div>
  </div>
);

// --- Main Component ---

export function FutureDreams({ onBack, session }) {
  const [activeTab, setActiveTab] = useState("travel");
  const [travelGoals, setTravelGoals] = useState([]);
  const [lifeGoals, setLifeGoals] = useState([]);
  const [newTravelGoal, setNewTravelGoal] = useState({ location_name: "", target_date: "", savings_goal_amount: "" });
  const [newLifeGoal, setNewLifeGoal] = useState({ goal_name: "", owner_id: "Shared", target_date: "" });
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(null);

  useEffect(() => {
    const fetchAndSetData = async () => {
      const { data: travelData, error: travelError } = await supabase.from("travel_goals").select("*").order("target_date", { ascending: true });
      if (travelError) console.error("Error fetching travel goals:", travelError);
      else {
        setTravelGoals(travelData);
        const topGoal = travelData.find(g => g.status !== 'Booked' && g.target_date);
        if (topGoal) {
          setBackgroundImageUrl(`https://source.unsplash.com/1600x900/?${encodeURIComponent(topGoal.location_name)}`);
        }
      }

      const { data: lifeData, error: lifeError } = await supabase.from("life_goals").select("*").order("created_at", { ascending: false });
      if (lifeError) console.error("Error fetching life goals:", lifeError);
      else setLifeGoals(lifeData);
    };

    fetchAndSetData();

    const travelChannel = supabase.channel("travel_goals_changes").on("postgres_changes", { event: "*", schema: "public", table: "travel_goals" }, () => fetchAndSetData()).subscribe();
    const lifeChannel = supabase.channel("life_goals_changes").on("postgres_changes", { event: "*", schema: "public", table: "life_goals" }, () => fetchAndSetData()).subscribe();

    return () => {
      supabase.removeChannel(travelChannel);
      supabase.removeChannel(lifeChannel);
    };
  }, []);
  
  // --- Handlers ---

  const handleAddNewTravelGoal = async (e) => {
    e.preventDefault();
    if (!newTravelGoal.location_name || !newTravelGoal.savings_goal_amount) return alert("Please fill out all fields.");
    await supabase.from("travel_goals").insert([newTravelGoal]);
    setNewTravelGoal({ location_name: "", target_date: "", savings_goal_amount: "" });
  };
  const handleUpdateSaving = async (id, amount) => {
    const goal = travelGoals.find(g => g.id === id);
    if (goal && amount) await supabase.from("travel_goals").update({ current_saved_amount: parseFloat(goal.current_saved_amount) + parseFloat(amount) }).eq("id", id);
  };
  const handleDeleteTravelGoal = async (id) => {
    if (window.confirm("Are you sure?")) await supabase.from("travel_goals").delete().eq("id", id);
  };
  const handleUpdateStatus = async (id, status) => {
    await supabase.from("travel_goals").update({ status }).eq("id", id);
  };

  const handleAddNewLifeGoal = async (e) => {
    e.preventDefault();
    if (!newLifeGoal.goal_name) return alert("Please enter a goal name.");
    await supabase.from("life_goals").insert([newLifeGoal]);
    setNewLifeGoal({ goal_name: "", owner_id: "Shared", target_date: "" });
  };
  const handleUpdateProgress = async (id, progress) => {
    await supabase.from("life_goals").update({ progress_percent: progress }).eq("id", id);
  };
  const handleToggleComplete = async (id, is_complete) => {
    await supabase.from("life_goals").update({ is_complete: !is_complete, progress_percent: !is_complete ? 100 : 0 }).eq("id", id);
  };
  const handleDeleteLifeGoal = async (id) => {
    if (window.confirm("Are you sure?")) await supabase.from("life_goals").delete().eq("id", id);
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white p-6 flex flex-col relative overflow-hidden">
      <DynamicView imageUrl={backgroundImageUrl} />

      <div className="relative z-10 flex items-center justify-between">
        <button
          onClick={onBack}
          className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg text-slate-800 flex items-center gap-2"
        >
          <ArrowLeft size={24} /> Back to Room
        </button>
        <h1 className="text-4xl font-bold text-center drop-shadow-lg">
          Our Window to the Future
        </h1>
        <div className="w-24"></div>
      </div>

      <div className="relative z-10 mt-8 flex-grow flex flex-col items-center">
        <div className="flex bg-slate-800/50 p-1 rounded-full border border-slate-700 mb-8">
          <button
            onClick={() => setActiveTab("travel")}
            className={`px-6 py-2 text-lg font-semibold transition-colors rounded-full flex items-center gap-2 ${
              activeTab === "travel"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-300 hover:bg-slate-700/50"
            }`}
          >
            <Plane size={20} /> Travel Planner
          </button>
          <button
            onClick={() => setActiveTab("life")}
            className={`px-6 py-2 text-lg font-semibold transition-colors rounded-full flex items-center gap-2 ${
              activeTab === "life"
                ? "bg-purple-600 text-white shadow-md"
                : "text-slate-300 hover:bg-slate-700/50"
            }`}
          >
            <Heart size={20} /> Life Goals
          </button>
        </div>

        <div className="w-full max-w-5xl">
          {activeTab === "travel" && (
            <TravelPlanner
              travelGoals={travelGoals}
              newTravelGoal={newTravelGoal}
              setNewTravelGoal={setNewTravelGoal}
              handleAddNewTravelGoal={handleAddNewTravelGoal}
              handleUpdateSaving={handleUpdateSaving}
              handleDeleteTravelGoal={handleDeleteTravelGoal}
              handleUpdateStatus={handleUpdateStatus}
            />
          )}
          {activeTab === "life" && (
            <LifePlanner
              lifeGoals={lifeGoals}
              newLifeGoal={newLifeGoal}
              setNewLifeGoal={setNewLifeGoal}
              handleAddNewLifeGoal={handleAddNewLifeGoal}
              handleUpdateProgress={handleUpdateProgress}
              handleToggleComplete={handleToggleComplete}
              handleDeleteLifeGoal={handleDeleteLifeGoal}
              session={session}
            />
          )}
        </div>
      </div>
    </div>
  );
}