import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, Repeat } from "lucide-react";
import { Clock as CustomClock } from "./Clock"; // Renamed to avoid conflict

const API_KEY = "62b3f77484ba1441a81722ff";

export function Utilities({ onBack }) {
  const [rates, setRates] = useState(null);
  const [brlAmount, setBrlAmount] = useState(1);
  const [chfAmount, setChfAmount] = useState(0);

  useEffect(() => {
    async function fetchRates() {
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/BRL`
        );
        const data = await response.json();
        if (data.result === "success") {
          setRates(data.conversion_rates);
          setChfAmount(Number(1 * data.conversion_rates.CHF).toFixed(2));
        } else {
          console.error("Failed to fetch exchange rates:", data["error-type"]);
        }
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
      }
    }
    fetchRates();
  }, []);

  const handleBrlChange = (e) => {
    const amount = e.target.value;
    setBrlAmount(amount);
    if (rates) {
      setChfAmount(Number(amount * rates.CHF).toFixed(2));
    }
  };

  const handleChfChange = (e) => {
    const amount = e.target.value;
    setChfAmount(amount);
    if (rates) {
      setBrlAmount(Number(amount / rates.CHF).toFixed(2));
    }
  };


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

      <h1 className="text-4xl font-bold mt-20 mb-12 text-center">
        Utilities & Tools
      </h1>

      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Dual Clocks */}
        <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg border border-white/10">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
            <Clock /> Our Times
          </h2>
          <div className="space-y-6">
            {/* Switzerland Clock */}
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-300">
                🇨🇭 Switzerland
              </p>
              <p className="text-5xl font-mono font-bold text-white">
                <CustomClock timezone={"Europe/Zurich"} />
              </p>
            </div>
            {/* Brazil Clock */}
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-300">
                🇧🇷 Brazil (Brasília)
              </p>
              <p className="text-5xl font-mono font-bold text-white">
                <CustomClock timezone={"America/Sao_Paulo"} />
              </p>
            </div>
          </div>
        </div>

        {/* Currency Converter */}
        <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg border border-white/10">
          <h2 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">
            <Repeat /> Currency Converter
          </h2>
          {rates ? (
            <div className="space-y-4">
              {/* BRL Input */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">
                  BRL (R$)
                </label>
                <input
                  type="number"
                  value={brlAmount}
                  onChange={handleBrlChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-2xl font-mono focus:outline-none focus:border-green-500"
                />
              </div>
              {/* CHF Input */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">
                  CHF (Fr.)
                </label>
                <input
                  type="number"
                  value={chfAmount}
                  onChange={handleChfChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-2xl font-mono focus:outline-none focus:border-green-500"
                />
              </div>
              <p className="text-xs text-slate-500 text-center pt-2">
                Rate: 1 BRL = {rates.CHF.toFixed(4)} CHF
              </p>
            </div>
          ) : (
            <div className="text-center text-slate-400 mt-16">
              <p>Loading exchange rates...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
