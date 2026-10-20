'use client'

import { useState } from 'react'
import { StatusMarker } from '@/components/ui/StatusMarker'
import { VerseCard } from '@/components/ui/VerseCard'

const nodes = [
  { id: 'yajuj', label: "Ya'juj & Ma'juj", style: { left: '20%', top: '18%' }, desc: "Ya'juj & Ma'juj — kaum perusak yang dikurung di balik tembok (Al-Kahf 94)." },
  { id: 'kahf', label: 'QS Al-Kahf 83–98', style: { left: '80%', top: '17%' }, desc: 'QS Al-Kahf 83–98 — satu-satunya rangkaian ayat tentang Dzulqarnain.' },
  { id: 'dzulqarnain', label: 'Dzulqarnain', style: { left: '50%', top: '50%' }, center: true, desc: 'Dzulqarnain — tokoh sentral rangkaian Al-Kahf 83–98.' },
  { id: 'tembok', label: 'Tembok Besi', style: { left: '17%', top: '79%' }, desc: 'Tembok Besi — dinding (sadd) yang dibangun antara dua gunung (Al-Kahf 96).' },
  { id: 'besi', label: 'Besi & Tembaga', style: { left: '82%', top: '78%' }, desc: 'Besi & Tembaga Cair — potongan besi dipanaskan lalu disiram tembaga cair (Al-Kahf 96).' },
  { id: 'iskandar', label: 'Iskandar?', sub: 'khilaf ulama', style: { left: '50%', top: '89%' }, desc: 'Iskandar? (khilaf ulama) — identitas Dzulqarnain diperselisihkan para ulama.' },
]

const edges = [
  { x1: 195, y1: 185, x2: 80, y2: 68, opacity: 0.25 },
  { x1: 195, y1: 185, x2: 312, y2: 62, opacity: 0.25 },
  { x1: 195, y1: 185, x2: 66, y2: 292, opacity: 0.18 },
  { x1: 195, y1: 185, x2: 322, y2: 288, opacity: 0.18 },
  { x1: 195, y1: 185, x2: 195, y2: 330, opacity: 0.14, dashed: true },
]

export function GrafScreen() {
  const [selectedNode, setSelectedNode] = useState('dzulqarnain')
  const hint = nodes.find(n => n.id === selectedNode)?.desc || 'Ketuk simpul untuk melihat keterkaitannya.'

  return (
    <div>
      <h2 className="mt-[2px] mb-1 text-[20px] font-extrabold tracking-[-0.02em]">Graf Entitas</h2>
      <p className="mb-[18px] text-[13px] leading-[1.6] text-ink-3">
        Tokoh, tempat, dan benda yang muncul bersama dalam satu rangkaian kisah — digambar sebagai peta.
      </p>

      {/* Graph */}
      <div className="relative bg-surface border border-line rounded-[6px] h-[370px] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 390 370" preserveAspectRatio="none" aria-hidden="true">
          {edges.map((e, i) => (
            <line
              key={i}
              x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke="#1A6B4A"
              strokeOpacity={e.opacity}
              strokeWidth={1.5}
              strokeDasharray={e.dashed ? '4 4' : undefined}
            />
          ))}
        </svg>
        {nodes.map((node) => (
          <button
            key={node.id}
            onClick={() => setSelectedNode(node.id)}
            style={{ left: node.style.left, top: node.style.top }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-[4px] text-center max-w-[128px] transition-[border-color,color,box-shadow] duration-[120ms] ${
              node.center
                ? 'bg-emerald-deep border-[1.5px] border-emerald-deep text-white text-[14px] font-extrabold p-[12px_18px] shadow-[0_4px_18px_rgba(15,68,48,0.2)] z-[2]'
                : `bg-paper-warm border border-line text-ink-2 text-[12px] font-bold leading-[1.25] p-[8px_12px] hover:border-emerald ${
                    selectedNode === node.id && !node.center ? 'border-emerald text-emerald shadow-[0_2px_12px_rgba(26,107,74,0.12)]' : ''
                  }`
            }`}
          >
            {node.label}
            {node.sub && (
              <span className={`block text-[10px] font-semibold mt-[2px] ${node.center ? 'text-white/60' : 'text-ink-4'}`}>
                {node.sub}
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="mt-2 mb-0 text-[12px] text-ink-4 text-center">{hint}</p>

      {/* Entity panel */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between mt-1 mb-[10px] pb-2 border-b border-line-soft">
          <h2 className="text-[14px] font-extrabold tracking-[0.02em] uppercase text-ink-3">Dzulqarnain</h2>
          <StatusMarker status="bersyarat" label="ENTITAS · TOKOH" />
        </div>
        <div className="bg-emerald/7 border-l-[3px] border-l-emerald rounded-r-[6px] p-[12px_14px] text-[13px] leading-[1.6] text-ink-2 font-semibold">
          Muncul di <strong>1 surah</strong> · rangkaian ayat <strong>Al-Kahf 83–98</strong> — seluruh kisahnya terkonsentrasi di satu tempat.
        </div>

        <VerseCard
          surah="QS Al-Kahf"
          ayahRef="18:94"
          arabic="قَالُوا۟ يَٰذَا ٱلْقَرْنَيْنِ إِنَّ يَأْجُوجَ وَمَأْجُوجَ مُفْسِدُونَ فِى ٱلْأَرْضِ فَهَلْ نَجْعَلُ لَكَ خَرْجًا عَلَىٰٓ أَن تَجْعَلَ بَيْنَنَا وَبَيْنَهُمْ سَدًّۭا"
          translation="&quot;Mereka berkata: Hai Dzulkarnain, sesungguhnya Ya'juj dan Ma'juj itu orang-orang yang membuat kerusakan di muka bumi, maka dapatkah kami memberikan sesuatu pembayaran kepadamu, supaya kamu membuat dinding antara kami dan mereka?&quot;"
        />
        <VerseCard
          surah="QS Al-Kahf"
          ayahRef="18:98"
          arabic="قَالَ هَٰذَا رَحْمَةٌۭ مِّن رَّبِّى ۖ فَإِذَا جَآءَ وَعْدُ رَبِّى جَعَلَهُۥ دَكَّآءَ ۖ وَكَانَ وَعْدُ رَبِّى حَقًّۭا"
          translation="&quot;Dzulkarnain berkata: Ini (dinding) adalah rahmat dari Tuhanku, maka apabila sudah datang janji Tuhanku, Dia akan menjadikannya hancur luluh; dan janji Tuhanku itu adalah benar.&quot;"
        />
      </div>
    </div>
  )
}
