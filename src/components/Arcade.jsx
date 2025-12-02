import React, { useState, useEffect } from "react";
import { ArrowLeft, Coins, Check, ShoppingBag, Plus } from "lucide-react";
import { supabase } from "../supabaseClient";

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
    <p className="mt-4 ml-3 text-lg">Loading the RPG world...</p>
  </div>
);

export function Arcade({ onBack, session }) {
  const [activeTab, setActiveTab] = useState("tasks");
  const [tasks, setTasks] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [balances, setBalances] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Manages render state
  const user = session.user;

  // --- Data Fetching ---
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);

    const { data: tasksData, error: tasksError } = await supabase
      .from("rpg_tasks")
      .select("*")
      .order("created_at", { ascending: false });
    const { data: rewardsData, error: rewardsError } = await supabase
      .from("rpg_rewards")
      .select("*");
    const { data: balancesData, error: balancesError } = await supabase
      .from("rpg_balances")
      .select("*");

    if (tasksError) console.error("Tasks Fetch Error:", tasksError);
    if (rewardsError) console.error("Rewards Fetch Error:", rewardsError);
    if (balancesError) console.error("Balances Fetch Error:", balancesError);

    setTasks(tasksData || []);
    setRewards(rewardsData || []);
    setBalances(balancesData || []);

    setIsLoading(false);
  }

  // --- Logic ---
  async function completeTask(task) {
    if (task.is_completed) return;

    const userBalance = balances.find((b) => b.user_id === user.id);
    if (!userBalance) return;

    const newBalance = userBalance.gold_balance + task.gold_reward;

    await supabase
      .from("rpg_balances")
      .update({ gold_balance: newBalance })
      .eq("user_id", user.id);

    await supabase
      .from("rpg_tasks")
      .update({ is_completed: true })
      .eq("id", task.id);

    fetchData();
  }

  async function redeemReward(reward) {
    const userBalance = balances.find((b) => b.user_id === user.id);
    if (!userBalance || reward.cost > userBalance.gold_balance) {
      alert("Not enough gold!");
      return;
    }

    const newBalance = userBalance.gold_balance - reward.cost;
    await supabase
      .from("rpg_balances")
      .update({ gold_balance: newBalance })
      .eq("user_id", user.id);

    await supabase
      .from("rpg_rewards")
      .update({ is_redeemed: true, redeemed_by: user.id })
      .eq("id", reward.id);

    fetchData();
  }

  // --- Render Helpers ---
  const renderTaskCard = (task) => (
    <div
      key={task.id}
      className={`p-4 rounded-lg shadow-md flex justify-between items-center transition-colors ${
        task.is_completed
          ? "bg-green-100 text-green-700 opacity-60"
          : "bg-white hover:shadow-lg"
      }`}
    >
      <div>
        <h3
          className={`font-semibold ${task.is_completed ? "line-through" : ""}`}
        >
          {task.title}
        </h3>
        <p className="text-xs text-slate-500">
          Assigned to: {task.assigned_to === user.id ? "You" : "Partner"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-bold flex items-center gap-1 ${
            task.is_completed ? "text-green-700" : "text-yellow-600"
          }`}
        >
          +{task.gold_reward} <Coins size={16} />
        </span>
        {!task.is_completed && task.assigned_to === user.id && (
          <button
            onClick={() => completeTask(task)}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
          >
            <Check size={18} />
          </button>
        )}
      </div>
    </div>
  );

  const renderRewardCard = (reward) => (
    <div
      key={reward.id}
      className={`p-4 rounded-lg shadow-md flex justify-between items-center transition-colors ${
        reward.is_redeemed
          ? "bg-slate-200 opacity-50"
          : "bg-white hover:shadow-lg"
      }`}
    >
      <div>
        <h3 className="font-semibold">{reward.name}</h3>
        <p className="text-xs text-slate-500">{reward.description}</p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-bold flex items-center gap-1 ${
            reward.is_redeemed ? "text-slate-500" : "text-red-600"
          }`}
        >
          {reward.cost} <Coins size={16} />
        </span>
        {!reward.is_redeemed && (
          <button
            onClick={() => redeemReward(reward)}
            className="bg-red-500 text-white px-3 py-1 text-sm rounded-full hover:bg-red-600 transition-colors"
            disabled={
              balances.find((b) => b.user_id === user.id)?.gold_balance <
              reward.cost
            }
          >
            Redeem
          </button>
        )}
      </div>
    </div>
  );

  const myBalance = balances.find((b) => b.user_id === user.id);
  const partnerBalance = balances.find((b) => b.user_id !== user.id);

  return (
    <div className="min-h-screen w-full bg-gray-100 p-6 relative">
      {/* Header & Back Button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="bg-white/90 hover:bg-white p-2 rounded-full shadow-md text-slate-800"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-slate-800">
            Relationship RPG 👾
          </h1>
        </div>

        {/* Balances Display */}
        <div className="flex space-x-4 bg-white p-3 rounded-full shadow-md">
          <div className="text-sm font-semibold flex items-center gap-1 text-slate-600">
            You: {myBalance ? myBalance.gold_balance : 0}{" "}
            <Coins size={16} className="text-yellow-600" />
          </div>
          <div className="text-sm font-semibold flex items-center gap-1 text-slate-600">
            Partner: {partnerBalance ? partnerBalance.gold_balance : 0}{" "}
            <Coins size={16} className="text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Conditional Rendering based on Loading State */}
      {isLoading ? (
        <div className="h-[calc(100vh-100px)] flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-4 py-2 text-lg font-semibold transition-colors ${
                activeTab === "tasks"
                  ? "border-b-4 border-blue-500 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              My Tasks
            </button>
            <button
              onClick={() => setActiveTab("shop")}
              className={`px-4 py-2 text-lg font-semibold transition-colors ${
                activeTab === "shop"
                  ? "border-b-4 border-blue-500 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Item Shop
            </button>
          </div>

          {/* Content */}
          <div className="max-w-3xl mx-auto space-y-4">
            {activeTab === "tasks" && tasks.length > 0 ? (
              tasks
                .filter((t) => t.assigned_to === user.id)
                .map(renderTaskCard)
            ) : activeTab === "tasks" ? (
              <p className="text-center text-gray-500 py-10">
                No tasks currently assigned!
              </p>
            ) : null}

            {activeTab === "shop" && rewards.length > 0 ? (
              rewards.map(renderRewardCard)
            ) : activeTab === "shop" ? (
              <p className="text-center text-gray-500 py-10">
                No items available in the shop.
              </p>
            ) : null}

            {activeTab === "tasks" && (
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center mt-6 text-gray-500">
                <Plus size={20} className="inline-block mr-2" />
                Add new task (Future Feature)
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
