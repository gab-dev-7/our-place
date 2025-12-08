import React, { useEffect, useState } from "react";
import { ArrowLeft, Heart, Calendar, BarChart, Plane, Trophy } from "lucide-react";
import { relationshipStartDate, historicalMilestones } from "../data/milestones";
import { supabase } from "../supabaseClient";

// Function to calculate the difference between two dates
const calculateTenure = (startDate) => {
  const start = new Date(startDate);
  const now = new Date();

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
};

export function Milestones({ onBack, session }) {
  const [tenure, setTenure] = useState({ years: 0, months: 0, days: 0 });
  const [stats, setStats] = useState({ tripCount: 0, highScore: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tenure calculation
    setTenure(calculateTenure(relationshipStartDate));
    const interval = setInterval(() => {
      setTenure(calculateTenure(relationshipStartDate));
    }, 1000 * 60 * 60 * 24); // Update once a day

    // Fetch shared stats
    const fetchStats = async () => {
      setLoading(true);
      // Fetch trip count
      const { count: tripCount } = await supabase
        .from("travel_goals")
        .select("*", { count: "exact", head: true });

      // Fetch high score
      const { data: balances, error } = await supabase
        .from("rpg_balances")
        .select("balance")
        .order("balance", { ascending: false })
        .limit(1);

      const highScore = balances && balances.length > 0 ? balances[0].balance : 0;

      setStats({ tripCount: tripCount || 0, highScore });
      setLoading(false);
    };

    if (session) {
      fetchStats();
    }

    return () => clearInterval(interval);
  }, [session]);

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white p-6 flex flex-col items-center">
      {/* Header & Back Button */}
      <div className="absolute top-5 left-5 z-50">
        <button
          onClick={onBack}
          className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg text-slate-800 flex items-center gap-2"
        >
          <ArrowLeft size={24} /> Back to Room
        </button>
      </div>

      <h1 className="text-4xl font-bold mt-20 mb-12 text-center">Milestones Ledger 📜</h1>

      <div className="w-full max-w-2xl mx-auto">
        {/* Relationship Tenure */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 text-center shadow-lg border border-white/10">
          <h2 className="text-2xl font-bold text-pink-400 mb-4 flex items-center justify-center gap-2">
            <Heart /> Relationship Tenure
          </h2>
          <div className="text-4xl md:text-5xl font-extrabold text-white">
            <span>{tenure.years > 0 && `${tenure.years}y `}</span>
            <span>{tenure.months > 0 && `${tenure.months}m `}</span>
            <span>{tenure.days}d</span>
          </div>
          <p className="text-slate-400 mt-2">...and counting!</p>
        </div>

        {/* Shared Stats */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 shadow-lg border border-white/10">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
            <BarChart /> Shared Stats
          </h2>
          {loading ? (
            <div className="text-center text-slate-400">Loading stats...</div>
          ) : (
            <div className="flex justify-around text-center">
              <div>
                <Plane className="mx-auto mb-2 text-cyan-400" size={32} />
                <p className="text-3xl font-bold">{stats.tripCount}</p>
                <p className="text-slate-400">Trips Planned</p>
              </div>
              <div>
                <Trophy className="mx-auto mb-2 text-amber-400" size={32} />
                <p className="text-3xl font-bold">{stats.highScore}</p>
                <p className="text-slate-400">Arcade High Score</p>
              </div>
            </div>
          )}
        </div>

        {/* Historical Milestones */}
        <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg border border-white/10">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
            <Calendar /> Our History
          </h2>
          <div className="space-y-4">
            {historicalMilestones.map((milestone, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/50"
              >
                <div className="font-mono text-sm bg-slate-900 px-3 py-1 rounded">
                  {new Date(milestone.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <p className="text-white flex-1">{milestone.event}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
