import React, { useState, useMemo } from "react";
import { ClipboardList, X, Send } from "lucide-react";
import { supabase } from "../supabaseClient";
import { deepDiveQuestions } from "../data/deepDiveQuestions";

// Function to get the day of the year (1-366)
const getDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

export function DeepDiveClipboard({ isOpen, onToggle }) {
  const [answer, setAnswer] = useState("");
  const [author, setAuthor] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Determine the question of the day
  const dailyQuestion = useMemo(() => {
    const dayIndex = getDayOfYear() - 1;
    const questionIndex = dayIndex % deepDiveQuestions.length;
    return deepDiveQuestions[questionIndex];
  }, []);

  // We are keeping the submission logic, but it's now simplified
  // as the question text is determined locally.
  async function handleSubmit(e) {
    e.preventDefault();
    if (!answer || !author || !dailyQuestion) return;

    // We can save the question text directly with the answer
    const { error } = await supabase.from("daily_answers").insert([
      {
        question_text: dailyQuestion,
        answer_text: answer,
        author_name: author,
      },
    ]);

    if (!error) {
      setHasSubmitted(true);
      setAnswer("");
    } else {
      console.error("Error submitting answer:", error);
      alert("Could not submit your answer. Please try again.");
    }
  }

  const handleOpen = () => {
    setHasSubmitted(false); // Reset submission status when opening
    onToggle(true);
  };

  return (
    <>
      {/* 1. THE TRIGGER */}
      <div
        onClick={handleOpen}
        className="absolute top-8 right-32 cursor-pointer z-40 transform hover:scale-110 transition-transform duration-300 group"
      >
        <div className="bg-amber-800 w-24 h-32 rounded-lg shadow-xl relative flex flex-col items-center pt-2 border-t-8 border-gray-400">
          <div className="absolute -top-4 w-12 h-4 bg-gray-300 rounded-full shadow-sm"></div>
          <div className="bg-white w-20 h-24 mt-1 shadow-inner p-2 text-[4px] text-gray-400 overflow-hidden leading-tight">
            lorem ipsum dolor sit amet...
            <br />
            <br />
            <span className="text-red-400 font-bold text-[6px]">DEEP DIVE</span>
          </div>
          <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 bg-black text-white text-xs px-2 py-1 rounded transition-opacity whitespace-nowrap">
            Daily Question
          </div>
        </div>
      </div>

      {/* 2. THE MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-100 p-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-slate-700 flex items-center gap-2">
                <ClipboardList className="text-blue-500" /> Daily Deep Dive
              </h2>
              <button
                onClick={() => onToggle(false)}
                className="text-slate-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {hasSubmitted ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">💌</div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Answer Sent!
                  </h3>
                  <p className="text-slate-500 mt-2">
                    Check back later to see what your partner wrote.
                  </p>
                  <button
                    onClick={() => onToggle(false)}
                    className="mt-6 bg-slate-800 text-white px-6 py-2 rounded-full text-sm"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-center">
                    <label className="text-sm font-bold text-blue-500 uppercase tracking-wider">
                      Today&apos;s Question
                    </label>
                    <p className="text-2xl font-semibold text-slate-800 mt-2 leading-snug">
                      {dailyQuestion || "Loading..."}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Your name..."
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Your Answer
                    </label>
                    <textarea
                      className="w-full border rounded-md p-3 text-sm h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      placeholder="Type your answer here..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send size={18} /> Submit Answer
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}