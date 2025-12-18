import React, { useState, useEffect } from "react";
import { ArrowLeft, Coins, Check, Plus, X } from "lucide-react";
import { supabase } from "../supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

// Helper component for a simple spinner
const Spinner = () => (
  <div className="flex items-center justify-center h-full">
    <svg
      className="animate-spin h-8 w-8 text-blue-500"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-25"
      />
      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        className="opacity-75"
      />
    </svg>
    <p className="mt-4 ml-3 text-lg text-slate-400">Loading the RPG world...</p>
  </div>
);

export function Arcade({ onBack, session }) {
  const [activeTab, setActiveTab] = useState("tasks");
  const [tasks, setTasks] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [balances, setBalances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddRewardModalOpen, setIsAddRewardModalOpen] = useState(false);
  
  const [newTask, setNewTask] = useState({ title: "", gold_reward: 10, assigned_to: session.user.id });
  const [newReward, setNewReward] = useState({ name: "", description: "", cost: 25 });

  const user = session.user;
  const partner = balances.find((b) => b.user_id !== user.id);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    const { data: tasksData, error: tasksError } = await supabase.from("rpg_tasks").select("*").order("created_at", { ascending: false });
    const { data: rewardsData, error: rewardsError } = await supabase.from("rpg_rewards").select("*").order("cost", { ascending: true });
    const { data: balancesData, error: balancesError } = await supabase.from("rpg_balances").select("*");

    if (tasksError) console.error("Tasks Fetch Error:", tasksError);
    if (rewardsError) console.error("Rewards Fetch Error:", rewardsError);
    if (balancesError) console.error("Balances Fetch Error:", balancesError);

    setTasks(tasksData || []);
    setRewards(rewardsData || []);
    setBalances(balancesData || []);
    setIsLoading(false);
  }

  async function handleAddTask(e) {
    e.preventDefault();
    if (!newTask.title || !newTask.gold_reward) return alert("Please fill out all fields.");

    const { error } = await supabase.from("rpg_tasks").insert([{ ...newTask, is_completed: false }]);
    if (error) {
      alert("Could not add task.");
    } else {
      setNewTask({ title: "", gold_reward: 10, assigned_to: user.id });
      setIsAddTaskModalOpen(false);
      fetchData();
    }
  }

  async function handleAddReward(e) {
    e.preventDefault();
    if (!newReward.name || !newReward.cost) return alert("Please fill out all fields.");

    const { error } = await supabase.from("rpg_rewards").insert([{ ...newReward, is_redeemed: false }]);
    if (error) {
      alert("Could not add reward.");
    } else {
      setNewReward({ name: "", description: "", cost: 25 });
      setIsAddRewardModalOpen(false);
      fetchData();
    }
  }

  async function completeTask(task) {
    if (task.is_completed) return;
    const userBalance = balances.find((b) => b.user_id === user.id);
    if (!userBalance) return;
    const newBalance = userBalance.gold_balance + task.gold_reward;
    await supabase.from("rpg_balances").update({ gold_balance: newBalance }).eq("user_id", user.id);
    await supabase.from("rpg_tasks").update({ is_completed: true }).eq("id", task.id);
    fetchData();
  }

  async function redeemReward(reward) {
    const userBalance = balances.find((b) => b.user_id === user.id);
    if (!userBalance || reward.cost > userBalance.gold_balance) return alert("Not enough gold!");
    const newBalance = userBalance.gold_balance - reward.cost;
    await supabase.from("rpg_balances").update({ gold_balance: newBalance }).eq("user_id", user.id);
    await supabase.from("rpg_rewards").update({ is_redeemed: true, redeemed_by: user.id }).eq("id", reward.id);
    fetchData();
  }

  const renderTaskCard = (task) => (
    <div key={task.id} className={`p-4 rounded-lg shadow-md flex justify-between items-center transition-colors ${task.is_completed ? "bg-slate-700 text-slate-400 opacity-60" : "bg-slate-800 hover:bg-slate-700"}`}>
      <div>
        <h3 className={`font-semibold text-white/90 ${task.is_completed ? "line-through" : ""}`}>{task.title}</h3>
        <p className="text-xs text-slate-400">Assigned to: {task.assigned_to === user.id ? "You" : "Partner"}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-bold flex items-center gap-1 ${task.is_completed ? "text-green-400" : "text-yellow-400"}`}>+{task.gold_reward} <Coins size={16} /></span>
        {!task.is_completed && task.assigned_to === user.id && (
          <button onClick={() => completeTask(task)} className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"><Check size={18} /></button>
        )}
      </div>
    </div>
  );

  const renderRewardCard = (reward) => (
    <div key={reward.id} className={`p-4 rounded-lg shadow-md flex justify-between items-center transition-colors ${reward.is_redeemed ? "bg-slate-800 opacity-50" : "bg-slate-800 hover:bg-slate-700"}`}>
      <div>
        <h3 className="font-semibold text-white/90">{reward.name}</h3>
        <p className="text-xs text-slate-400">{reward.description}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-bold flex items-center gap-1 ${reward.is_redeemed ? "text-slate-500" : "text-red-400"}`}>{reward.cost} <Coins size={16} /></span>
        {!reward.is_redeemed && (
          <button onClick={() => redeemReward(reward)} className="bg-red-500 text-white px-3 py-1 text-sm rounded-full hover:bg-red-600 transition-colors" disabled={(balances.find((b) => b.user_id === user.id)?.gold_balance || 0) < reward.cost}>Redeem</button>
        )}
      </div>
    </div>
  );

  const myBalance = balances.find((b) => b.user_id === user.id);
  const partnerBalance = balances.find((b) => b.user_id !== user.id);

  return (
    <>
      <div className="min-h-screen w-full bg-slate-900 text-white p-6 relative">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
            <button onClick={onBack} className="bg-slate-800/90 hover:bg-slate-700 p-2 rounded-full shadow-md text-white/80"><ArrowLeft size={24} /></button>
            <h1 className="text-3xl font-bold text-white/90">Relationship RPG 👾</h1>
            </div>
            <div className="flex space-x-4 bg-slate-800 p-3 rounded-full shadow-md text-white/80">
            <div className="text-sm font-semibold flex items-center gap-1">You: {myBalance ? myBalance.gold_balance : 0} <Coins size={16} className="text-yellow-400" /></div>
            <div className="text-sm font-semibold flex items-center gap-1">Partner: {partnerBalance ? partnerBalance.gold_balance : 0} <Coins size={16} className="text-yellow-400" /></div>
            </div>
        </div>

        {isLoading ? <Spinner /> : (
          <>
            <div className="flex border-b border-slate-700 mb-6">
                <button onClick={() => setActiveTab("tasks")} className={`px-4 py-2 text-lg font-semibold transition-colors ${ activeTab === "tasks" ? "border-b-4 border-blue-500 text-blue-400" : "text-slate-400 hover:text-slate-300" }`}>Tasks</button>
                <button onClick={() => setActiveTab("games")} className={`px-4 py-2 text-lg font-semibold transition-colors ${ activeTab === "games" ? "border-b-4 border-blue-500 text-blue-400" : "text-slate-400 hover:text-slate-300" }`}>Mini Games</button>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {activeTab === 'tasks' && (
                <>
                  {tasks.filter(t => t.assigned_to === user.id).map(renderTaskCard)}
                  <button onClick={() => setIsAddTaskModalOpen(true)} className="w-full p-4 border-2 border-dashed border-slate-700 rounded-lg text-center mt-6 text-slate-400 hover:bg-slate-800 hover:border-solid hover:text-white transition-all"><Plus size={20} className="inline-block mr-2" /> Add New Task</button>
                </>
              )}
              {activeTab === 'games' && (
                <div className="p-8 bg-slate-800 rounded-xl border border-slate-700 text-center text-slate-400 text-lg">
                  Mini Games: Coming in the future...
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {isAddTaskModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsAddTaskModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: -20 }} className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 border border-slate-700" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add a New Task</h2>
                <button onClick={() => setIsAddTaskModalOpen(false)} className="p-1 rounded-full hover:bg-slate-700"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Task Title</label>
                  <input type="text" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 focus:outline-none focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Gold Reward</label>
                  <input type="number" value={newTask.gold_reward} onChange={(e) => setNewTask({ ...newTask, gold_reward: parseInt(e.target.value) })} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 focus:outline-none focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Assign To</label>
                  <select value={newTask.assigned_to} onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 focus:outline-none focus:border-blue-500">
                    <option value={user.id}>Me</option>
                    {partner && <option value={partner.user_id}>Partner</option>}
                  </select>
                </div>
                <div className="flex justify-end pt-4">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">Add Task</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isAddRewardModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsAddRewardModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: -20 }} className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 border border-slate-700" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add New Shop Reward</h2>
                <button onClick={() => setIsAddRewardModalOpen(false)} className="p-1 rounded-full hover:bg-slate-700"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddReward} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Reward Name</label>
                  <input type="text" value={newReward.name} onChange={(e) => setNewReward({ ...newReward, name: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 focus:outline-none focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                  <input type="text" value={newReward.description} onChange={(e) => setNewReward({ ...newReward, description: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Gold Cost</label>
                  <input type="number" value={newReward.cost} onChange={(e) => setNewReward({ ...newReward, cost: parseInt(e.target.value) })} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 focus:outline-none focus:border-blue-500" required />
                </div>
                <div className="flex justify-end pt-4">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">Add Reward</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
