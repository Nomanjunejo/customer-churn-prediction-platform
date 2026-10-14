
import { useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

const initialForm = {
  gender: "Female",
  SeniorCitizen: 0,
  Partner: "Yes",
  Dependents: "No",
  tenure: 12,
  PhoneService: "Yes",
  MultipleLines: "No",
  InternetService: "Fiber optic",
  OnlineSecurity: "No",
  OnlineBackup: "Yes",
  DeviceProtection: "No",
  TechSupport: "No",
  StreamingTV: "Yes",
  StreamingMovies: "Yes",
  Contract: "Month-to-month",
  PaperlessBilling: "Yes",
  PaymentMethod: "Electronic check",
  MonthlyCharges: 79.85,
  TotalCharges: 958.2,
};

const groups = [
  {
    title: "Personal details",
    icon: "👤",
    fields: [
      ["gender", "Gender", ["Female", "Male"]],
      ["SeniorCitizen", "Senior citizen", [0, 1]],
      ["Partner", "Has partner?", ["Yes", "No"]],
      ["Dependents", "Has dependents?", ["Yes", "No"]],
    ],
  },
  {
    title: "Services",
    icon: "📡",
    fields: [
      ["PhoneService", "Phone service", ["Yes", "No"]],
      ["MultipleLines", "Multiple lines", ["No", "Yes", "No phone service"]],
      ["InternetService", "Internet service", ["DSL", "Fiber optic", "No"]],
      ["OnlineSecurity", "Online security", ["Yes", "No", "No internet service"]],
      ["OnlineBackup", "Online backup", ["Yes", "No", "No internet service"]],
      ["DeviceProtection", "Device protection", ["Yes", "No", "No internet service"]],
      ["TechSupport", "Tech support", ["Yes", "No", "No internet service"]],
      ["StreamingTV", "Streaming TV", ["Yes", "No", "No internet service"]],
      ["StreamingMovies", "Streaming movies", ["Yes", "No", "No internet service"]],
    ],
  },
  {
    title: "Billing & contract",
    icon: "💳",
    fields: [
      ["Contract", "Contract type", ["Month-to-month", "One year", "Two year"]],
      ["PaperlessBilling", "Paperless billing", ["Yes", "No"]],
      ["PaymentMethod", "Payment method", [
        "Electronic check",
        "Mailed check",
        "Bank transfer (automatic)",
        "Credit card (automatic)",
      ]],
    ],
  },
];

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100";

function Card({ children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState("Overview");

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const response = await axios.get(`${API}/predictions`);
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "History load nahi hui. Backend endpoint check karo."
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = {
        ...form,
        SeniorCitizen: Number(form.SeniorCitizen),
        tenure: Number(form.tenure),
        MonthlyCharges: Number(form.MonthlyCharges),
        TotalCharges: Number(form.TotalCharges),
      };

      const response = await axios.post(`${API}/predict`, payload);
      setResult(response.data);
      await loadHistory();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Prediction failed. Backend, API fields aur CORS check karo."
      );
    } finally {
      setLoading(false);
    }
  }

  const probability = result
    ? Math.max(0, Math.min(100, Number(result.churn_percentage ??
        Number(result.churn_probability ?? 0) * 100)))
    : 0;

  const churnCount = history.filter((item) =>
    String(item.churn_prediction).toLowerCase() === "yes" ||
    String(item.churn_prediction) === "1"
  ).length;

  const averageRisk = history.length
    ? history.reduce((sum, item) => {
        const value = Number(item.churn_percentage ??
          Number(item.churn_probability ?? 0) * 100);
        return sum + value;
      }, 0) / history.length
    : 0;

  const navItems = [
    ["Overview", "▦"],
    ["Predict Customer", "✳"],
    ["History", "◷"],
  ];

  return (
    <div className="min-h-screen bg-[#f5f6ff] text-slate-800">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col bg-[#171632] px-5 py-7 text-white lg:flex">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl shadow-lg shadow-violet-900/40">
              ✦
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                Churn<span className="text-fuchsia-400">Guard</span>
              </h1>
              <p className="mt-1 text-[10px] uppercase tracking-[2px] text-slate-400">
                Intelligence platform
              </p>
            </div>
          </div>

          <p className="mb-3 mt-12 px-3 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">
            Workspace
          </p>

          <nav className="space-y-2">
            {navItems.map(([label, icon]) => (
              <button
                key={label}
                onClick={() => {
                  setActive(label);
                  document.getElementById(
                    label === "Predict Customer"
                      ? "predict"
                      : label === "History"
                      ? "history"
                      : "overview"
                  )?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  active === label
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-950/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-lg">{icon}</span>
                {label}
                {label === "History" && (
                  <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs">
                    {history.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 p-4">
            <div className="text-2xl">🧠</div>
            <p className="mt-3 text-sm font-bold">ML-powered insights</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Turn customer data into smarter retention decisions.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Dashboard ready
            </div>
          </div>
        </aside>

        {/* Main area */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-4 sm:px-7 lg:px-9">
              <div>
                <div className="text-xs font-medium text-slate-400">
                  Workspace / Analytics
                </div>
                <h2 className="mt-1 text-lg font-extrabold tracking-tight sm:text-xl">
                  Customer Intelligence
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:flex">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  ML Dashboard
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 font-bold text-white shadow-md">
                  CG
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-[1500px] space-y-7 px-4 py-7 sm:px-7 sm:py-9 lg:px-9">
            {/* Hero */}
            <section id="overview" className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5544dc] via-[#6948e8] to-[#a33ee5] p-6 text-white shadow-xl shadow-violet-200 sm:p-9">
              <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
              <div className="pointer-events-none absolute right-36 top-20 h-32 w-32 rounded-full bg-fuchsia-300/10 blur-2xl" />
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium">
                  <span>✦</span> CUSTOMER ANALYTICS
                </span>
                <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                  Understand churn.
                  <br />
                  <span className="text-violet-200">Protect your growth.</span>
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-6 text-violet-100 sm:text-base">
                  Predict customer churn risk with your machine learning model
                  and turn insights into smarter retention strategies.
                </p>
                <button
                  onClick={() => {
                    setActive("Predict Customer");
                    document.getElementById("predict")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-50"
                >
                  + Predict a customer
                </button>
              </div>
              <div className="relative z-10 mt-7 flex flex-wrap gap-5 text-xs text-violet-100 sm:absolute sm:bottom-8 sm:right-8 sm:mt-0 sm:flex-col sm:gap-2 sm:text-right">
                <span>✦ Machine Learning</span>
                <span>◈ Customer Retention</span>
                <span>▥ Predictive Analytics</span>
              </div>
            </section>

            {/* KPI cards */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Kpi title="Total Predictions" value={history.length} icon="◉" color="violet" note="Saved model predictions" />
              <Kpi title="Churn Predictions" value={churnCount} icon="↗" color="rose" note="Predicted churn cases" />
              <Kpi title="Average Churn Risk" value={`${averageRisk.toFixed(1)}%`} icon="◌" color="amber" note="Across loaded history" />
              <Kpi title="Retention Opportunities" value={Math.max(0, history.length - churnCount)} icon="✧" color="emerald" note="Predicted non-churn cases" />
            </section>

            {/* Prediction section */}
            <section id="predict" className="grid items-start gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-violet-600">
                      <span>✳</span> PREDICTION ENGINE
                    </div>
                    <h3 className="mt-2 text-xl font-extrabold">Customer profile</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Enter customer details for an ML-based prediction.
                    </p>
                  </div>
                  <span className="rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700">
                    20 fields
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="mt-7 space-y-7">
                  {groups.map((group) => (
                    <div key={group.title}>
                      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-lg">
                          {group.icon}
                        </span>
                        <h4 className="font-bold">{group.title}</h4>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {group.fields.map(([name, label, options]) => (
                          <label key={name} className="block text-sm font-semibold text-slate-700">
                            {label}
                            <select
                              className={inputClass}
                              value={form[name]}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  [name]: e.target.value,
                                }))
                              }
                            >
                              {options.map((option) => (
                                <option key={option} value={option}>
                                  {option === 0 ? "No" : option === 1 ? "Yes" : option}
                                </option>
                              ))}
                            </select>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div>
                    <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-lg">💰</span>
                      <h4 className="font-bold">Customer tenure & charges</h4>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        ["tenure", "Tenure (months)", 0, 10000],
                        ["MonthlyCharges", "Monthly charges ($)", 0, 1000000],
                        ["TotalCharges", "Total charges ($)", 0, 100000000],
                      ].map(([name, label, min, max]) => (
                        <label key={name} className="block text-sm font-semibold text-slate-700">
                          {label}
                          <input
                            className={inputClass}
                            type="number"
                            min={min}
                            max={max}
                            step={name === "tenure" ? "1" : "0.01"}
                            required
                            value={form[name]}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                [name]: e.target.value,
                              }))
                            }
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-4 font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span>{loading ? "⏳" : "✦"}</span>
                    {loading ? "Analyzing customer..." : "Predict Churn Risk"}
                    {!loading && <span className="ml-auto">→</span>}
                  </button>
                </form>
              </Card>

              {/* Results */}
              <div className="space-y-6">
                <Card className="overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold tracking-wider text-violet-600">MODEL OUTPUT</div>
                      <h3 className="mt-2 text-xl font-extrabold">Prediction result</h3>
                    </div>
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-xl">🎯</span>
                  </div>

                  {result ? (
                    <div className="mt-6">
                      <div className={`rounded-2xl p-5 ${probability >= 70 ? "bg-rose-50" : probability >= 40 ? "bg-amber-50" : "bg-emerald-50"}`}>
                        <p className="text-sm font-semibold text-slate-600">Churn probability</p>
                        <div className="mt-2 flex items-end justify-between gap-2">
                          <span className="text-5xl font-black tracking-tight text-slate-900">
                            {probability.toFixed(1)}%
                          </span>
                          <span className="mb-1 text-2xl">
                            {probability >= 70 ? "🔴" : probability >= 40 ? "🟠" : "🟢"}
                          </span>
                        </div>
                        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/80">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${probability >= 70 ? "bg-rose-500" : probability >= 40 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${probability}%` }}
                          />
                        </div>
                        <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-500">
                          <span>LOW RISK</span><span>MEDIUM</span><span>HIGH RISK</span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-100 p-4">
                          <p className="text-xs text-slate-500">Prediction</p>
                          <p className="mt-2 text-lg font-extrabold">
                            {String(result.churn_prediction)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-100 p-4">
                          <p className="text-xs text-slate-500">Risk level</p>
                          <p className="mt-2 text-lg font-extrabold">
                            {result.risk_level ?? "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-600">
                        <p>Customer ID: <strong>{result.customer_id ?? "—"}</strong></p>
                        <p>Prediction ID: <strong>{result.prediction_id ?? "—"}</strong></p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-100 bg-violet-50/40 px-5 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-3xl text-white shadow-lg shadow-violet-200">✦</div>
                      <p className="mt-5 font-bold">Ready to analyze</p>
                      <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                        Submit a customer profile to see the model's churn probability and risk level.
                      </p>
                    </div>
                  )}
                </Card>

                <Card>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold">Risk guide</h3>
                      <p className="mt-1 text-xs text-slate-500">Illustrative probability bands</p>
                    </div>
                    <span className="text-xl">📈</span>
                  </div>
                  <div className="mt-5 space-y-4">
                    <RiskGuide color="bg-emerald-500" label="Low risk" range="0–39%" desc="Lower predicted churn probability" />
                    <RiskGuide color="bg-amber-500" label="Medium risk" range="40–69%" desc="Review customer engagement" />
                    <RiskGuide color="bg-rose-500" label="High risk" range="70–100%" desc="Consider retention outreach" />
                  </div>
                  <p className="mt-5 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                    These bands are dashboard guidelines. Your backend's risk-level logic may use different thresholds.
                  </p>
                </Card>
              </div>
            </section>

            {/* History */}
            <section id="history">
              <Card>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="text-xs font-bold tracking-wider text-violet-600">RECENT ACTIVITY</div>
                    <h3 className="mt-2 text-xl font-extrabold">Prediction history</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Previously saved customer predictions from your backend.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={loadHistory}
                    disabled={historyLoading}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold transition hover:bg-violet-50 hover:text-violet-700 disabled:opacity-60"
                  >
                    {historyLoading ? "Loading..." : "↻ Refresh history"}
                  </button>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead>
                      <tr className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                        <th className="px-4 py-4 font-bold">Customer</th>
                        <th className="px-4 py-4 font-bold">Contract</th>
                        <th className="px-4 py-4 font-bold">Tenure</th>
                        <th className="px-4 py-4 font-bold">Probability</th>
                        <th className="px-4 py-4 font-bold">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 10).map((item, index) => {
                        const p = Math.max(0, Math.min(100, Number(
                          item.churn_percentage ??
                          Number(item.churn_probability ?? 0) * 100
                        )));
                        const high = p >= 70;
                        const medium = p >= 40 && p < 70;
                        return (
                          <tr key={item.prediction_id ?? index} className="border-b border-slate-100 transition hover:bg-violet-50/40">
                            <td className="px-4 py-4 font-bold">
                              #{item.customer_id ?? "—"}
                            </td>
                            <td className="px-4 py-4 text-slate-600">{item.contract ?? "—"}</td>
                            <td className="px-4 py-4 text-slate-600">{item.tenure ?? "—"} mo</td>
                            <td className="px-4 py-4 font-bold">{p.toFixed(1)}%</td>
                            <td className="px-4 py-4">
                              <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${high ? "bg-rose-100 text-rose-700" : medium ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                                {item.risk_level ?? (high ? "High" : medium ? "Medium" : "Low")}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {history.length === 0 && (
                    <div className="py-12 text-center">
                      <div className="text-3xl">📋</div>
                      <p className="mt-3 font-bold">No history loaded yet</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Make a prediction or refresh history to load saved records.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </section>

            {error && (
              <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-bold">Something went wrong</p>
                  <p className="mt-1">{error}</p>
                </div>
                <button onClick={() => setError("")} className="ml-auto font-bold">✕</button>
              </div>
            )}

            <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row">
              <p>© ChurnGuard · Customer Intelligence Platform</p>
              <p>Powered by Machine Learning · Predictions are estimates</p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value, icon, color, note }) {
  const themes = {
    violet: "bg-violet-100 text-violet-700",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
    emerald: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${themes[color]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{note}</p>
    </div>
  );
}

function RiskGuide({ color, label, range, desc }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`h-10 w-1.5 shrink-0 rounded-full ${color}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{desc}</p>
      </div>
      <span className="shrink-0 text-xs font-bold text-slate-500">{range}</span>
    </div>
  );
}

export default App;
