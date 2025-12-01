import React, { useState, useEffect } from "react";
import { ClipboardList, X, Send } from "lucide-react";
import { supabase } from "../supabaseClient";

export function DeepDiveClipboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [author, setAuthor] = useState(""); // Simple name field for now
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Load a question when the component mounts
  useEffect(() => {
    async function loadQuestion() {
      // Just grabbing the first question for the demo
      const { data } = await supabase
        .from("daily_questions")
        .select("*")
        .limit(1)
        .single();
      if (data) setQuestion(data);
    }
    loadQuestion();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!answer || !author || !question) return;

    const { error } = await supabase
      .from("daily_answers")
      .insert([
        { question_id: question.id, answer_text: answer, author_name: author },
      ]);

    if (!error) {
      setHasSubmitted(true);
      setAnswer(""); // Clear form
    }
  }

  return (
    <>
      {/* 1. THE TRIGGER (Hanging on the Fridge) */}
      <div
        onClick={() => setIsOpen(true)}
        className="absolute top-8 right-32 cursor-pointer z-40 transform hover:scale-110 transition-transform duration-300 group"
      >
        <div className="bg-amber-800 w-24 h-32 rounded-lg shadow-xl relative flex flex-col items-center pt-2 border-t-8 border-gray-400">
          {/* The Clip part */}
          <div className="absolute -top-4 w-12 h-4 bg-gray-300 rounded-full shadow-sm"></div>
          {/* The Paper */}
          <div className="bg-white w-20 h-24 mt-1 shadow-inner p-2 text-[4px] text-gray-400 overflow-hidden leading-tight">
            lorem ipsum dolor sit amet...
            <br />
            <br />
            <span className="text-red-400 font-bold text-[6px]">DEEP DIVE</span>
          </div>
          {/* Hover Tooltip */}
          <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 bg-black text-white text-xs px-2 py-1 rounded transition-opacity whitespace-nowrap">
            Daily Question
          </div>
        </div>
      </div>

      {/* 2. THE MODAL (The Actual Interaction) */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="bg-slate-100 p-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-slate-700 flex items-center gap-2">
                <ClipboardList className="text-blue-500" /> Daily Deep Dive
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {hasSubmitted ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">💌</div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Answer Sent!
                  </h3>
                  <p className="text-slate-500 mt-2">
                    Check back later to see what she wrote.
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="mt-6 bg-slate-800 text-white px-6 py-2 rounded-full text-sm"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <label className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                      Today's Question
                    </label>
                    <p className="text-lg font-medium text-slate-800 mt-1">
                      {question ? question.question_text : "Loading..."}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Gabriel"
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
