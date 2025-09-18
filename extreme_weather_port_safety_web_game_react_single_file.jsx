import React, { useMemo, useState } from "react";

/**
 * Extreme Weather Events – Port Safety Game
 * Single-file React component
 * -----------------------------------------
 * How it works (mirrors the printed instructions card):
 * 1) Separate cards into coloured suits (we model them as digital decks below).
 * 2) Choose one card from each suit and set aside the RED variable card.
 * 3) Flip over the remaining chosen cards; use the yellow number to pick the scenario item.
 * 4) Discuss/perform the emergency scenario.
 * 5) Reveal the red variation card as a twist and re-assess.
 *
 * Notes
 * - Built with Tailwind classes (no import needed in Canvas preview)
 * - No external libs; copy-paste into any React app (Vite/CRA/Next) and it will run.
 */

// --- Card data --------------------------------------------------------------
// Each deck holds 9 (or fewer) options; ids mirror the printed codes on cards

// Yellow numbers – which item on the chosen orange scenario list to use
const scenarioNumberDeck = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Green – Location (G1–G9)
const locationDeck = [
  { id: "G1", title: "On vessel, in port moored" },
  { id: "G2", title: "On vessel, in port underway" },
  { id: "G3", title: "On quayside" },
  { id: "G4", title: "On port road" },
  { id: "G5", title: "In warehouse" },
  { id: "G6", title: "In workshop" },
  { id: "G7", title: "In container terminal" },
  { id: "G8", title: "In offices" },
  { id: "G9", title: "In bulk storage facility" },
];

// Blue – Wind (B1–B5)
const windDeck = [
  { id: "B1", title: "Calm to gentle breeze", details: "0–12 mph (0–10 kn), Beaufort 0–3" },
  { id: "B2", title: "Moderate to strong breeze", details: "13–30 mph (11–26 kn), Beaufort 4–6" },
  { id: "B3", title: "Gale", details: "31–45 mph (27–39 kn), Beaufort 7–8" },
  { id: "B4", title: "Storm", details: "46–54 mph (40–47 kn), Beaufort 9" },
  { id: "B5", title: "Severe storm", details: "≥55 mph (≥48 kn), Beaufort 10+" },
];

// Navy – Weather (N1–N8)
const weatherDeck = [
  { id: "N1", title: "Severe rain" },
  { id: "N2", title: "Freezing conditions" },
  { id: "N3", title: "Hours of darkness" },
  { id: "N4", title: "Daylight" },
  { id: "N5", title: "Severe fog", details: "(Calm to gentle breeze only)" },
  { id: "N6", title: "Heavy snow" },
  { id: "N7", title: "Heat wave" },
  { id: "N8", title: "Lightning" },
];

// Purple – Severity (P1–P5)
const severityDeck = [
  { id: "P1", level: "a", title: "The issue can be controlled without outside assistance" },
  { id: "P2", level: "b", title: "The issue requires outside assistance to gain control" },
  { id: "P3", level: "c", title: "The issue is affecting the public, safety and/or environment" },
  { id: "P4", level: "d", title: "The issue is critical and will likely lead to significant loss" },
  { id: "P5", level: "e", title: "The issue is uncontrollable – vacate area or med‑evac to protect lives" },
];

// Red – Variable/Twist (R1–R7)
const variableDeck = [
  { id: "R1", title: "There is no telephone available" },
  { id: "R2", title: "Outside assistance does not communicate effectively" },
  { id: "R3", title: "No emergency assistance available in a suitable timeframe" },
  { id: "R4", title: "The severity raises 1 level" },
  { id: "R5", title: "There are operations ongoing in the area" },
  { id: "R6", title: "You are alone" },
  { id: "R7", title: "The initial emergency equipment fails" },
];

// Orange – Scenario category decks (6 different white cards with orange border)
// The yellow number (1–9) will pick which bullet to use from the chosen category.
const orangeDecks = {
  environment: {
    id: "ENV",
    name: "Environment",
    items: [
      "Dangerous goods spill",
      "Fuel spill whilst bunkering",
      "Wreck in port waters / entrance",
      "Lost cargo in water",
      "Oil/fuel spotted in water",
      "Oil/fuel spotted on shore",
      "Witnessed port user throwing waste in water",
      "Cargo or waste shifting (with weather) on quayside",
      "Cargo or waste shifting (with weather) on vessel",
    ],
  },
  fire: {
    id: "FIRE",
    name: "Fire",
    items: [
      "Container fire on shore",
      "Cargo fire on a vessel",
      "Fire on vessel",
      "Vehicle fire",
      "Building fire",
      "Fire close to dangerous goods",
      "Lithium battery fire",
      "Fire alarm raised / activated",
      "Fixed fire‑fighting system activated",
    ],
  },
  security: {
    id: "SEC",
    name: "Security",
    items: [
      "Unauthorised person on site",
      "Illegal immigrants in vehicle",
      "Illegal immigrants in port",
      "Virus on port computer system",
      "Bomb threat",
      "Protestors on site",
      "Port operator suspected under the influence of drugs/alcohol",
      "3rd‑party contractor/haulier suspected under the influence of drugs/alcohol",
      "Abusive person on site",
    ],
  },
  injury: {
    id: "INJ",
    name: "Injury",
    items: [
      "Back or neck strain",
      "Strain or sprain (not back)",
      "Burn (heat/chemical/electrical)",
      "Crush injury",
      "Cut or puncture wound",
      "Foreign object in eye",
      "Fracture or dislocation",
      "Chest pain",
      "Unconsciousness",
    ],
  },
  plant: {
    id: "PEA",
    name: "Plant / equipment accident",
    items: [
      "Collision with person",
      "Collision with another vehicle",
      "Vessel hits quayside",
      "Vessel loaded incorrectly",
      "Problem with linkspan/walkway",
      "Moving vehicle sheds load",
      "Mechanical breakdown leads to incident",
      "3rd‑party haulier involved in collision",
      "Vehicle operator under the influence of drugs/alcohol",
    ],
  },
  personInWater: {
    id: "PIW",
    name: "Person in water",
    // If your printed card differs, edit these freely in the UI (editable mode)
    items: [
      "Casualty conscious – never out of sight",
      "Casualty unconscious – never out of sight",
      "Child casualty",
      "Multiple casualties in water",
      "Casualty in very cold water",
      "Casualty near moving vessel / prop wash",
      "Missing person suspected in water",
      "Mass‑casualty incident",
      "Vehicle and person(s) in water",
    ],
  },
};

// Utility – Fisher‑Yates shuffle clone (non‑mutating)
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

// --- Presentational components --------------------------------------------
function Card({ colour, header, subheader, body, footer, concealed = false }) {
  const frame = {
    orange: "border-orange-400 bg-white",
    red: "border-red-500 bg-white",
    blue: "border-sky-400 bg-white",
    navy: "border-indigo-900 bg-white",
    green: "border-green-500 bg-white",
    purple: "border-fuchsia-500 bg-white",
    yellow: "border-amber-400 bg-white",
    slate: "border-slate-300 bg-white",
  }[colour || "slate"]; 

  return (
    <div className={cx("rounded-2xl border-4 shadow p-4 min-w-[240px] max-w-[340px]", frame)}>
      <div className="text-center">
        <div className="text-xl font-black tracking-wide mb-1">{header}</div>
        {subheader && <div className="text-sm uppercase text-slate-500">{subheader}</div>}
      </div>
      <div className={cx("mt-3 text-sm leading-relaxed", concealed && "blur-sm select-none")}>{body}</div>
      {footer && <div className="mt-3 text-xs text-slate-500 text-center">{footer}</div>}
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold shadow-sm bg-white">
      {children}
    </span>
  );
}

// --- Main component ---------------------------------------------------------
export default function PortSafetyGame() {
  const categories = Object.values(orangeDecks);

  // State
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0].id);
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState(locationDeck[0].id);
  const [selectedWind, setSelectedWind] = useState(windDeck[0].id);
  const [selectedWeather, setSelectedWeather] = useState(weatherDeck[0].id);
  const [selectedSeverity, setSelectedSeverity] = useState(severityDeck[0].id);
  const [twist, setTwist] = useState(pickRandom(variableDeck).id);
  const [twistHidden, setTwistHidden] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const category = useMemo(() => categories.find(c => c.id === selectedCategoryId)!, [selectedCategoryId]);
  const location = useMemo(() => locationDeck.find(c => c.id === selectedLocation)!, [selectedLocation]);
  const wind = useMemo(() => windDeck.find(c => c.id === selectedWind)!, [selectedWind]);
  const weather = useMemo(() => weatherDeck.find(c => c.id === selectedWeather)!, [selectedWeather]);
  const severity = useMemo(() => severityDeck.find(c => c.id === selectedSeverity)!, [selectedSeverity]);
  const twistCard = useMemo(() => variableDeck.find(c => c.id === twist)!, [twist]);

  const scenarioItem = useMemo(() => category.items[selectedNumber - 1] || "—", [category, selectedNumber]);

  function randomiseExtremeWeatherRound() {
    const cat = pickRandom(categories);
    const num = pickRandom(scenarioNumberDeck);
    // Emphasise extreme conditions by biasing toward B3+ and weather N1/N2/N5/N6/N7/N8
    const windy = pickRandom(windDeck.filter(w => ["B3", "B4", "B5"].includes(w.id)));
    const wx = pickRandom(weatherDeck.filter(w => ["N1","N2","N5","N6","N7","N8"].includes(w.id)));
    const loc = pickRandom(locationDeck);
    const sev = pickRandom(severityDeck);
    const varc = pickRandom(variableDeck);

    setSelectedCategoryId(cat.id);
    setSelectedNumber(num);
    setSelectedWind(windy.id);
    setSelectedWeather(wx.id);
    setSelectedLocation(loc.id);
    setSelectedSeverity(sev.id);
    setTwist(varc.id);
    setTwistHidden(true);
  }

  function resetSimple() {
    setSelectedCategoryId(categories[0].id);
    setSelectedNumber(1);
    setSelectedLocation(locationDeck[0].id);
    setSelectedWind(windDeck[0].id);
    setSelectedWeather(weatherDeck[0].id);
    setSelectedSeverity(severityDeck[0].id);
    setTwist(pickRandom(variableDeck).id);
    setTwistHidden(true);
  }

  // Editable list for orange card items (lets you mirror your printed card exactly)
  function updateCategoryItem(index, newText) {
    const map = Object.fromEntries(Object.entries(orangeDecks));
    // shallow clone + replace
    map[categoryKeyById(selectedCategoryId)].items[index] = newText;
  }

  function categoryKeyById(id) {
    return Object.entries(orangeDecks).find(([,v]) => v.id === id)?.[0] || "environment";
  }

  const roundAsMarkdown = useMemo(() => {
    return `# Port EWE Scenario\n\n` +
      `**Category:** ${category.name}\\n` +
      `**Scenario #${selectedNumber}:** ${scenarioItem}\\n` +
      `**Location:** ${location.title}\\n` +
      `**Wind:** ${wind.title}${wind.details ? ` — ${wind.details}`: ""}\\n` +
      `**Weather:** ${weather.title}${weather.details ? ` — ${weather.details}`: ""}\\n` +
      `**Initial Severity:** (${severity.level.toUpperCase()}) ${severity.title}\\n` +
      `**Twist (reveal later):** ${twistCard.title}`;
  }, [category, selectedNumber, scenarioItem, location, wind, weather, severity, twistCard]);

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <div className="min-h-screen w-full flex flex-col gap-6 p-6 bg-slate-50">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Extreme Weather Events – Port Safety Game</h1>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-xl bg-slate-900 text-white shadow" onClick={randomiseExtremeWeatherRound}>
            🎲 New random EWE round
          </button>
          <button className="px-3 py-2 rounded-xl bg-white border shadow" onClick={() => downloadText("port-ewe-scenario.md", roundAsMarkdown)}>
            ⬇️ Export scenario
          </button>
          <button className="px-3 py-2 rounded-xl bg-white border shadow" onClick={resetSimple}>
            Reset
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Column 1 – Deck selectors */}
        <section className="col-span-1 space-y-4">
          <div className="p-4 rounded-2xl border shadow bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Build your round</h2>
              <button className="text-xs underline" onClick={() => setEditMode(!editMode)}>
                {editMode ? "Done editing" : "Edit orange card text"}
              </button>
            </div>
            <div className="mt-3 grid gap-3">
              <label className="grid gap-1">
                <span className="text-xs uppercase text-slate-500">Orange category</span>
                <select className="px-3 py-2 rounded-xl border bg-white" value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)}>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-xs uppercase text-slate-500">Yellow scenario number</span>
                <select className="px-3 py-2 rounded-xl border bg-white" value={selectedNumber} onChange={e => setSelectedNumber(parseInt(e.target.value))}>
                  {scenarioNumberDeck.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-xs uppercase text-slate-500">Green – Location</span>
                  <select className="px-3 py-2 rounded-xl border bg-white" value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)}>
                    {locationDeck.map(l => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-xs uppercase text-slate-500">Purple – Severity</span>
                  <select className="px-3 py-2 rounded-xl border bg-white" value={selectedSeverity} onChange={e => setSelectedSeverity(e.target.value)}>
                    {severityDeck.map(s => (
                      <option key={s.id} value={s.id}>{s.level.toUpperCase()} – {s.title}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-xs uppercase text-slate-500">Blue – Wind</span>
                  <select className="px-3 py-2 rounded-xl border bg-white" value={selectedWind} onChange={e => setSelectedWind(e.target.value)}>
                    {windDeck.map(w => (
                      <option key={w.id} value={w.id}>{w.title}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-xs uppercase text-slate-500">Navy – Weather</span>
                  <select className="px-3 py-2 rounded-xl border bg-white" value={selectedWeather} onChange={e => setSelectedWeather(e.target.value)}>
                    {weatherDeck.map(w => (
                      <option key={w.id} value={w.id}>{w.title}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-xs uppercase text-slate-500">Red – Twist (keep hidden)</span>
                <select className="px-3 py-2 rounded-xl border bg-white" value={twist} onChange={e => setTwist(e.target.value)}>
                  {variableDeck.map(v => (
                    <option key={v.id} value={v.id}>{v.title}</option>
                  ))}
                </select>
              </label>

            </div>
          </div>

          {/* Editable orange items */}
          {editMode && (
            <div className="p-4 rounded-2xl border shadow bg-white">
              <h3 className="font-semibold">Edit orange card items for: {category.name}</h3>
              <p className="text-sm text-slate-600">Mirror your printed card exactly (9 lines recommended). Changes are local only.</p>
              <div className="mt-3 grid gap-2">
                {category.items.map((t, i) => (
                  <div className="flex items-start gap-2" key={i}>
                    <span className="w-6 text-slate-500">{i+1}.</span>
                    <input
                      className="flex-1 px-3 py-2 rounded-xl border"
                      value={t}
                      onChange={e => {
                        // Update in place on a shallow copy to keep React happy
                        const key = categoryKeyById(selectedCategoryId);
                        const copy = { ...orangeDecks[key], items: [...orangeDecks[key].items] };
                        copy.items[i] = e.target.value;
                        orangeDecks[key] = copy;
                        // force rerender by toggling selection
                        setSelectedNumber(n => n);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Column 2 – Drawn cards */}
        <section className="col-span-1 xl:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Card
              colour="orange"
              header={category.name}
              subheader={`Scenario #${selectedNumber}`}
              body={<ol className="list-decimal ml-5 space-y-1">{category.items.map((t, i) => (
                <li key={i} className={cx("", (i+1)===selectedNumber && "font-semibold bg-orange-50 rounded px-1")}>{t}</li>
              ))}</ol>}
              footer={<div className="flex items-center justify-center gap-2"><Pill>Orange</Pill><Pill>Use yellow number</Pill></div>}
            />

            <Card
              colour="green"
              header="Location"
              subheader={location.id}
              body={<div>{location.title}</div>}
              footer={<Pill>Green</Pill>}
            />

            <Card
              colour="purple"
              header={`Severity (${severity.level.toUpperCase()})`}
              subheader={severity.id}
              body={<div>{severity.title}</div>}
              footer={<Pill>Purple</Pill>}
            />

            <Card
              colour="blue"
              header="Wind"
              subheader={wind.id}
              body={<div className="space-y-1"><div className="font-semibold">{wind.title}</div>{wind.details && <div className="text-sm text-slate-600">{wind.details}</div>}</div>}
              footer={<Pill>Blue</Pill>}
            />

            <Card
              colour="navy"
              header="Weather"
              subheader={weather.id}
              body={<div className="space-y-1"><div className="font-semibold">{weather.title}</div>{weather.details && <div className="text-sm text-slate-600">{weather.details}</div>}</div>}
              footer={<Pill>Navy</Pill>}
            />

            <Card
              colour="red"
              header="Twist (reveal later)"
              subheader={twistCard.id}
              body={<div className="space-y-1"><div className="font-semibold">{twistCard.title}</div></div>}
              footer={<div className="flex items-center justify-center gap-2"><Pill>Red</Pill><button onClick={() => setTwistHidden(v => !v)} className="px-2 py-1 rounded-lg border">{twistHidden ? "Reveal" : "Hide"}</button></div>}
              concealed={twistHidden}
            />
          </div>

          {/* Learning & facilitation helpers */}
          <div className="p-4 rounded-2xl border shadow bg-white">
            <h3 className="font-bold mb-2">Facilitator prompts</h3>
            <ol className="list-decimal ml-6 space-y-2 text-sm">
              <li><span className="font-semibold">Size‑up:</span> What hazards are present due to <em>{weather.title.toLowerCase()}</em> and <em>{wind.title.toLowerCase()}</em> at {location.title.toLowerCase()}?</li>
              <li><span className="font-semibold">Immediate actions:</span> Stop/Isolate/Warn — what do you do in the first 60 seconds?</li>
              <li><span className="font-semibold">Communications:</span> Who do you notify? What if the <em>red card</em> twist applies?</li>
              <li><span className="font-semibold">Controls:</span> What controls from your SMS/ERP apply? What additional controls are needed for this weather?</li>
              <li><span className="font-semibold">Escalation:</span> If severity rises to the next level, what triggers evacuation or med‑evac?</li>
              <li><span className="font-semibold">After‑action:</span> Reporting, recovery, and lessons learned.</li>
            </ol>
          </div>

          <div className="p-4 rounded-2xl border shadow bg-white">
            <h3 className="font-bold mb-2">Printable one‑pager</h3>
            <pre className="whitespace-pre-wrap text-sm bg-slate-50 p-3 rounded-xl border">{roundAsMarkdown}</pre>
          </div>
        </section>
      </div>

      <footer className="text-xs text-slate-500 text-center pt-4 border-t">
        Use with your own flashcards: choose the matching deck options above, then reveal the red twist after discussion.
      </footer>
    </div>
  );
}
