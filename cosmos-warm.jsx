import { useState } from "react";

// ── Warm palette ──────────────────────────────────────────────
const C = {
  bg:       "#f5efe6",      // 羊皮紙底色
  bg2:      "#ede4d8",      // 稍深一點的奶油
  card:     "#faf6f0",      // 卡片底
  cardDeep: "#f0e8dc",      // 強調卡片
  amber:    "#b5783a",      // 主色：深琥珀
  amberLt:  "#d4954e",      // 亮琥珀
  amberPale:"#e8c99a",      // 淡琥珀（背景裝飾）
  terracotta:"#b05b3b",     // 強調：赭紅
  sage:     "#7a8c6e",      // 平衡：鼠尾草綠
  text:     "#2e2318",      // 主文字：深暖棕
  textMid:  "#6b5540",      // 中等文字
  textDim:  "#a08870",      // 淡文字
  border:   "rgba(181,120,58,0.2)",
  borderAm: "rgba(181,120,58,0.5)",
  shadow:   "rgba(46,35,24,0.08)",
};

const serif = "'Palatino Linotype', 'Book Antiqua', Palatino, 'Noto Serif TC', Georgia, serif";
const sans  = "'Trebuchet MS', 'Gill Sans', 'Gill Sans MT', sans-serif";

// ── Decorative SVGs ───────────────────────────────────────────
function SunRays({ size = 60, style: s }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" style={{ opacity: 0.18, ...s }}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const x1 = 30 + 10 * Math.cos(a), y1 = 30 + 10 * Math.sin(a);
        const x2 = 30 + 26 * Math.cos(a), y2 = 30 + 26 * Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.amber} strokeWidth="0.8" />;
      })}
      <circle cx="30" cy="30" r="8" fill="none" stroke={C.amber} strokeWidth="0.8" />
      <circle cx="30" cy="30" r="3" fill={C.amber} opacity="0.6" />
    </svg>
  );
}

function LeafDecor({ style: s }) {
  return (
    <svg width="80" height="50" viewBox="0 0 80 50" style={{ opacity: 0.1, ...s }}>
      <path d="M10,40 Q25,5 50,15 Q35,35 10,40Z" fill={C.sage} />
      <path d="M10,40 Q30,30 50,15" stroke={C.sage} strokeWidth="0.8" fill="none" />
      <path d="M20,38 Q32,25 50,15" stroke={C.sage} strokeWidth="0.5" fill="none" />
      <path d="M30,35 Q38,22 50,15" stroke={C.sage} strokeWidth="0.4" fill="none" />
      <path d="M55,20 Q70,8 72,30 Q60,38 55,20Z" fill={C.amberPale} opacity="0.6" />
    </svg>
  );
}

function WaveDivider() {
  return (
    <svg width="100%" height="12" viewBox="0 0 300 12" preserveAspectRatio="none" style={{ opacity: 0.25 }}>
      <path d="M0,6 Q37.5,0 75,6 Q112.5,12 150,6 Q187.5,0 225,6 Q262.5,12 300,6" fill="none" stroke={C.amber} strokeWidth="0.8" />
    </svg>
  );
}

function Tag({ children, color = C.amber }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      border: `0.5px solid ${color}`,
      borderRadius: 20,
      fontSize: 9,
      letterSpacing: 2,
      color,
      fontFamily: sans,
    }}>
      {children}
    </span>
  );
}

// ── TODAY ─────────────────────────────────────────────────────
function TodayTab() {
  const [grat, setGrat] = useState("");
  const [sent, setSent] = useState(false);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "早安" : hour < 17 ? "午安" : "晚安";
  const dateStr = new Date().toLocaleDateString("zh-TW", { year:"numeric", month:"long", day:"numeric", weekday:"long" });

  return (
    <div style={{ padding: "28px 20px 100px", animation: "fadeUp 0.5s ease" }}>
      {/* Header */}
      <div style={{ marginBottom: 28, position: "relative" }}>
        <SunRays size={80} style={{ position: "absolute", right: -10, top: -20 }} />
        <div style={{ fontFamily: sans, fontSize: 10, letterSpacing: 4, color: C.textDim, marginBottom: 6 }}>COSMOS JOURNAL</div>
        <div style={{ fontFamily: serif, fontSize: 26, color: C.text, fontWeight: 400, lineHeight: 1.3 }}>
          {greeting}，<br />今天宇宙說什麼？
        </div>
        <div style={{ fontFamily: sans, fontSize: 10, color: C.textDim, marginTop: 6 }}>{dateStr}</div>
        <WaveDivider />
      </div>

      {/* Angel number of the day */}
      <div style={{
        background: C.cardDeep,
        border: `0.5px solid ${C.borderAm}`,
        borderRadius: 8,
        padding: "20px",
        marginBottom: 16,
        position: "relative",
        overflow: "hidden",
      }}>
        <LeafDecor style={{ position: "absolute", right: -5, bottom: -10 }} />
        <Tag>今日天使數字</Tag>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14 }}>
          <div style={{
            fontFamily: serif,
            fontSize: 56,
            color: C.amber,
            lineHeight: 1,
            textShadow: `0 2px 12px ${C.amberPale}`,
          }}>444</div>
          <div>
            <div style={{ fontFamily: serif, fontSize: 14, color: C.text, marginBottom: 4 }}>天使正圍繞著你</div>
            <div style={{ fontFamily: sans, fontSize: 11, color: C.textMid, lineHeight: 1.7 }}>
              穩定前行<br />一切正在就位
            </div>
          </div>
        </div>
      </div>

      {/* Orders snapshot */}
      <div style={{
        background: C.card,
        border: `0.5px solid ${C.border}`,
        borderRadius: 8,
        padding: "18px 20px",
        marginBottom: 16,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <Tag>顯化中的願望</Tag>
          <span style={{ fontFamily: sans, fontSize: 10, color: C.textDim }}>3 個運送中</span>
        </div>
        {[
          { id:"#1111", title:"在日本滑雪", days:47, pct:70 },
          { id:"#777",  title:"在加拿大擁有事業", days:23, pct:34 },
        ].map((o, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 0",
            borderTop: `0.5px solid ${C.border}`,
          }}>
            <div style={{ fontFamily: sans, fontSize: 9, color: C.amberLt, width: 34, letterSpacing: 1 }}>{o.id}</div>
            <div style={{ flex: 1, fontFamily: serif, fontSize: 13, color: C.text }}>{o.title}</div>
            <div style={{ width: 48, height: 2, background: C.bg2, borderRadius: 1, position: "relative" }}>
              <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${o.pct}%`, background: `linear-gradient(to right,${C.amberPale},${C.amber})`, borderRadius: 1 }} />
            </div>
            <div style={{ fontFamily: sans, fontSize: 9, color: C.textDim }}>{o.days}d</div>
          </div>
        ))}
      </div>

      {/* Gratitude quick capture */}
      <div style={{
        background: C.card,
        border: `0.5px solid ${C.border}`,
        borderRadius: 8,
        padding: "18px 20px",
      }}>
        <Tag color={C.sage}>今日感恩</Tag>
        <div style={{ fontFamily: serif, fontSize: 13, fontStyle: "italic", color: C.textMid, margin: "12px 0 10px", lineHeight: 1.8 }}>
          「今天，我感謝的是...」
        </div>
        <textarea
          value={grat}
          onChange={e => setGrat(e.target.value)}
          placeholder="寫下此刻心裡想感謝的..."
          style={{
            width: "100%", height: 70,
            background: C.bg2,
            border: `0.5px solid ${C.border}`,
            borderRadius: 6,
            padding: "10px 12px",
            color: C.text,
            fontSize: 13,
            fontFamily: serif,
            resize: "none",
            outline: "none",
            lineHeight: 1.7,
            boxSizing: "border-box",
          }}
        />
        <button onClick={() => setSent(true)} style={{
          marginTop: 10, width: "100%",
          padding: "11px",
          background: sent ? C.cardDeep : "transparent",
          border: `0.5px solid ${sent ? C.amber : C.border}`,
          borderRadius: 6,
          color: sent ? C.amber : C.textDim,
          fontSize: 11, fontFamily: sans, letterSpacing: 3, cursor: "pointer",
          transition: "all 0.3s",
        }}>
          {sent ? "✦ 感恩已記錄" : "記錄感恩"}
        </button>
      </div>
    </div>
  );
}

// ── ORDERS ────────────────────────────────────────────────────
const orders = [
  { id:"#1111", title:"在日本滑雪", sub:"與 Benson 在北海道", days:47, pct:70,
    img:"https://images.unsplash.com/photo-1517511620798-cec17d428bc0?w=600&q=80" },
  { id:"#777",  title:"在加拿大擁有自己的事業", sub:"輕鬆兩地跑", days:23, pct:34,
    img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80" },
  { id:"#333",  title:"擁有一間採光好的海景房", sub:"", days:8, pct:12,
    img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80" },
];

const Qs = [
  "當這一刻真實發生時，你的腳踩在哪裡？地板是什麼感覺？",
  "你身邊的空氣聞起來像什麼？溫度是涼的還是帶著陽光的暖？",
  "此刻你臉上的表情是什麼樣子的？",
];

function OrdersTab() {
  const [sel, setSel] = useState(null);
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState(["","",""]);
  const [shipped, setShipped] = useState(false);

  if (sel !== null) {
    const o = orders[sel];
    return (
      <div style={{ animation:"fadeUp 0.4s ease", paddingBottom:100 }}>
        <div style={{ position:"relative", height:260 }}>
          <img src={o.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(245,239,230,0) 20%,rgba(245,239,230,1) 100%)" }} />
          <button onClick={() => { setSel(null); setStep(0); setAns(["","",""]); setShipped(false); }}
            style={{ position:"absolute", top:14, left:14, background:"rgba(245,239,230,0.85)", border:`0.5px solid ${C.border}`, borderRadius:20, color:C.text, padding:"5px 14px", fontSize:10, cursor:"pointer", fontFamily:sans, letterSpacing:2 }}>
            ← 返回
          </button>
          <div style={{ position:"absolute", bottom:16, left:20 }}>
            <Tag>{o.id} · 第 {o.days} 天</Tag>
          </div>
        </div>

        <div style={{ padding:"4px 20px 0" }}>
          <div style={{ fontFamily:serif, fontSize:22, color:C.text, lineHeight:1.4, marginBottom:4 }}>{o.title}</div>
          {o.sub && <div style={{ fontFamily:sans, fontSize:11, color:C.textDim }}>{o.sub}</div>}
          <WaveDivider />
        </div>

        <div style={{ padding:"16px 20px" }}>
          <Tag color={C.sage}>感官投射儀式</Tag>
          <div style={{ marginTop:16 }}>
            {Qs.map((q, i) => (
              <div key={i} style={{
                marginBottom:18,
                opacity: i > step ? 0.28 : 1,
                transition:"opacity 0.4s",
                pointerEvents: i > step ? "none" : "auto",
              }}>
                <div style={{ fontFamily:serif, fontSize:13, color:C.amberLt, marginBottom:8, lineHeight:1.6 }}>
                  <span style={{ fontFamily:sans, fontSize:9, color:C.textDim, marginRight:8 }}>0{i+1}</span>
                  {q}
                </div>
                <textarea
                  value={ans[i]}
                  onChange={e => {
                    const a=[...ans]; a[i]=e.target.value; setAns(a);
                    if(e.target.value.length>2 && step===i) setStep(Math.min(i+1,2));
                  }}
                  placeholder="用文字感受這個畫面..."
                  style={{
                    width:"100%", height:58,
                    background: i===step ? C.cardDeep : C.bg2,
                    border:`0.5px solid ${i===step ? C.borderAm : C.border}`,
                    borderRadius:6, padding:"9px 12px",
                    color:C.text, fontSize:12, fontFamily:serif,
                    resize:"none", outline:"none", lineHeight:1.6,
                    boxSizing:"border-box", transition:"all 0.3s",
                  }}
                />
              </div>
            ))}
          </div>
          <WaveDivider />
          <button onClick={() => setShipped(true)} style={{
            marginTop:14, width:"100%", padding:"13px",
            background: shipped ? C.cardDeep : "transparent",
            border:`0.5px solid ${shipped ? C.amber : C.border}`,
            borderRadius:6, color: shipped ? C.amber : C.textMid,
            fontSize:11, fontFamily:sans, letterSpacing:3, cursor:"pointer", transition:"all 0.3s",
          }}>
            {shipped ? "✦ 已發送給宇宙" : "發送給宇宙"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:"28px 20px 100px", animation:"fadeUp 0.5s ease" }}>
      <div style={{ marginBottom:26 }}>
        <div style={{ fontFamily:sans, fontSize:10, letterSpacing:4, color:C.textDim, marginBottom:6 }}>MANIFEST ORDERS</div>
        <div style={{ fontFamily:serif, fontSize:26, color:C.text }}>顯化訂單</div>
        <WaveDivider />
      </div>

      {orders.map((o, i) => (
        <div key={i} onClick={() => setSel(i)} style={{
          marginBottom:14,
          background:C.card,
          border:`0.5px solid ${C.border}`,
          borderRadius:10,
          overflow:"hidden",
          cursor:"pointer",
          boxShadow:`0 2px 12px ${C.shadow}`,
          transition:"box-shadow 0.2s",
        }}>
          <div style={{ position:"relative", height:160 }}>
            <img src={o.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(250,246,240,0) 40%,rgba(250,246,240,0.97) 100%)" }} />
            <div style={{ position:"absolute", top:10, right:10 }}>
              <Tag>{o.id}</Tag>
            </div>
            <div style={{ position:"absolute", bottom:12, left:14, right:14 }}>
              <div style={{ fontFamily:serif, fontSize:16, color:C.text, fontWeight:400 }}>{o.title}</div>
            </div>
          </div>
          <div style={{ padding:"10px 14px 13px", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ flex:1, height:2, background:C.bg2, borderRadius:1, position:"relative" }}>
              <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${o.pct}%`, background:`linear-gradient(to right,${C.amberPale},${C.amberLt})`, borderRadius:1 }} />
            </div>
            <div style={{ fontFamily:sans, fontSize:10, color:C.textDim, whiteSpace:"nowrap" }}>第 {o.days} 天</div>
          </div>
        </div>
      ))}

      <button style={{
        width:"100%", padding:"13px",
        background:"transparent",
        border:`0.5px dashed ${C.border}`,
        borderRadius:10, color:C.textDim,
        fontSize:11, fontFamily:sans, letterSpacing:3, cursor:"pointer",
      }}>
        + 新增顯化訂單
      </button>
    </div>
  );
}

// ── ANGEL ─────────────────────────────────────────────────────
const angels = {
  "111":{ title:"新的起點正在開啟", body:"你的思想正在快速成真，保持積極的念頭。宇宙正在聆聽你最深的意圖。", energy:"創造", color:C.sage },
  "222":{ title:"信任這個過程", body:"一切正在按照神聖計劃發展。你所播下的種子正在悄悄生根。", energy:"平衡", color:C.sage },
  "333":{ title:"宇宙三位一體", body:"你的守護者就在身旁，確認你走在正確的道路上。繼續前進吧。", energy:"支持", color:C.amberLt },
  "444":{ title:"天使正圍繞著你", body:"你有強大的保護與支持。地基已為你打好，相信這個穩固的基礎。", energy:"穩定", color:C.amber },
  "555":{ title:"重大轉變即將到來", body:"巨大的改變正在臨近，將把你帶往更高的自我。擁抱未知，它是禮物。", energy:"蛻變", color:C.terracotta },
  "777":{ title:"宇宙在為你喝彩", body:"你走在神聖道路上，奇蹟與幸運正向你聚集。這是對齊的最高時刻。", energy:"奇蹟", color:C.amber },
  "888":{ title:"豐盛之門已打開", body:"財富、成功與繁榮正在流向你。打開雙手，你值得接收所有美好。", energy:"豐盛", color:C.amberLt },
  "999":{ title:"一個循環的完成", body:"某個章節已寫完。放下舊有的一切，為靈魂的新使命騰出空間。", energy:"完成", color:C.textMid },
};

function AngelTab() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [showLink, setShowLink] = useState(false);

  const decode = () => {
    const key = Object.keys(angels).find(k => input.includes(k)) || "444";
    setResult(angels[key]);
  };

  return (
    <div style={{ padding:"28px 20px 100px", animation:"fadeUp 0.5s ease" }}>
      <div style={{ marginBottom:26 }}>
        <div style={{ fontFamily:sans, fontSize:10, letterSpacing:4, color:C.textDim, marginBottom:6 }}>ANGEL NUMBERS</div>
        <div style={{ fontFamily:serif, fontSize:26, color:C.text }}>天使數字解碼</div>
        <div style={{ fontFamily:serif, fontSize:12, fontStyle:"italic", color:C.textMid, marginTop:6 }}>當宇宙透過數字與你說話</div>
        <WaveDivider />
      </div>

      <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:10, padding:"20px", marginBottom:14, boxShadow:`0 2px 12px ${C.shadow}` }}>
        <input
          value={input}
          onChange={e => { setInput(e.target.value); setResult(null); }}
          placeholder="444"
          style={{
            width:"100%", background:C.bg2,
            border:`0.5px solid ${C.border}`, borderRadius:6,
            padding:"14px", color:C.text,
            fontSize:36, fontFamily:serif,
            outline:"none", textAlign:"center", letterSpacing:10,
            boxSizing:"border-box",
          }}
        />
        <button onClick={decode} style={{
          marginTop:12, width:"100%", padding:"12px",
          background:C.cardDeep, border:`0.5px solid ${C.borderAm}`,
          borderRadius:6, color:C.amber,
          fontSize:11, fontFamily:sans, letterSpacing:3, cursor:"pointer",
        }}>
          ✦ 解碼訊息
        </button>
      </div>

      {result && (
        <div style={{ animation:"fadeUp 0.4s ease" }}>
          <div style={{
            background:C.card, border:`0.5px solid ${C.borderAm}`,
            borderRadius:10, padding:"22px 20px",
            marginBottom:14, boxShadow:`0 4px 20px ${C.shadow}`,
            position:"relative", overflow:"hidden",
          }}>
            <SunRays size={100} style={{ position:"absolute", right:-20, top:-20 }} />
            <Tag color={result.color}>{result.energy}</Tag>
            <div style={{ fontFamily:serif, fontSize:19, color:C.text, margin:"12px 0 10px", lineHeight:1.4 }}>{result.title}</div>
            <WaveDivider />
            <div style={{ fontFamily:serif, fontSize:13, fontStyle:"italic", color:C.textMid, lineHeight:1.9, marginTop:12 }}>{result.body}</div>
          </div>

          <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:10, padding:"16px 20px" }}>
            <Tag color={C.sage}>這個訊號與你的願望有關嗎？</Tag>
            <button onClick={() => setShowLink(!showLink)} style={{
              display:"block", marginTop:12,
              background:"transparent", border:"none",
              color:C.textDim, fontSize:12, cursor:"pointer",
              fontFamily:serif, fontStyle:"italic",
            }}>
              {showLink ? "▾ 收起" : "▸ 連結到我的訂單"}
            </button>
            {showLink && (
              <div style={{ marginTop:12 }}>
                {orders.map((o, i) => (
                  <div key={i} style={{
                    display:"flex", alignItems:"center", gap:10,
                    padding:"9px 0", borderTop:`0.5px solid ${C.border}`,
                    cursor:"pointer",
                  }}>
                    <div style={{ fontSize:9, color:C.amberLt, fontFamily:sans, letterSpacing:1, width:34 }}>{o.id}</div>
                    <div style={{ flex:1, fontFamily:serif, fontSize:13, color:C.text }}>{o.title}</div>
                    <div style={{ fontSize:10, color:C.amberLt }}>連結 →</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!result && (
        <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:10, padding:"18px 20px", boxShadow:`0 2px 12px ${C.shadow}` }}>
          <Tag>常見天使數字</Tag>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:14 }}>
            {Object.entries(angels).slice(0,6).map(([num, m]) => (
              <div key={num} onClick={() => { setInput(num); setResult(m); }} style={{
                padding:"14px 12px",
                background:C.bg2,
                border:`0.5px solid ${C.border}`,
                borderRadius:8, cursor:"pointer",
                transition:"border-color 0.2s",
              }}>
                <div style={{ fontFamily:serif, fontSize:22, color:m.color, marginBottom:4 }}>{num}</div>
                <div style={{ fontFamily:sans, fontSize:9, color:C.textDim, letterSpacing:2 }}>{m.energy}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── GRATITUDE ─────────────────────────────────────────────────
const history = [
  { date:"2026年4月22日", items:["今天的海邊散步，陽光很溫柔","一杯完美的拿鐵","遠方朋友的一條訊息"] },
  { date:"2026年4月21日", items:["找到了一間很有感覺的咖啡廳","完成了一個覺得很難的任務"] },
  { date:"2026年4月20日", items:["窗外的風，吹走了煩躁","自己做了一頓好吃的早餐","黃昏的晚霞"] },
];

function GratitudeTab() {
  const [items, setItems] = useState(["","",""]);
  const [saved, setSaved] = useState(false);

  return (
    <div style={{ padding:"28px 20px 100px", animation:"fadeUp 0.5s ease" }}>
      <div style={{ marginBottom:26 }}>
        <div style={{ fontFamily:sans, fontSize:10, letterSpacing:4, color:C.textDim, marginBottom:6 }}>GRATITUDE JOURNAL</div>
        <div style={{ fontFamily:serif, fontSize:26, color:C.text }}>感恩日記</div>
        <div style={{ fontFamily:serif, fontSize:12, fontStyle:"italic", color:C.textMid, marginTop:6 }}>宇宙在你已感恩之處，給予更多</div>
        <WaveDivider />
      </div>

      {/* Today input */}
      <div style={{ background:C.card, border:`0.5px solid ${C.borderAm}`, borderRadius:10, padding:"20px", marginBottom:16, boxShadow:`0 2px 16px ${C.shadow}` }}>
        <Tag color={C.sage}>今天，我感謝的三件事</Tag>
        <div style={{ marginTop:16 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:14 }}>
              <div style={{
                width:22, height:22, borderRadius:"50%",
                border:`0.5px solid ${C.borderAm}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:9, color:C.amber, flexShrink:0, marginTop:4, fontFamily:sans,
              }}>
                {i+1}
              </div>
              <input
                value={items[i]}
                onChange={e => { const a=[...items]; a[i]=e.target.value; setItems(a); }}
                placeholder={["此刻最想感謝的是...","今天一個小小的美好...","一件讓你微笑的事..."][i]}
                style={{
                  flex:1, background:"transparent",
                  border:"none", borderBottom:`0.5px solid ${items[i] ? C.borderAm : C.border}`,
                  padding:"6px 0", color:C.text, fontSize:13, fontFamily:serif,
                  outline:"none", transition:"border-color 0.3s",
                }}
              />
            </div>
          ))}
        </div>
        <button onClick={() => setSaved(true)} style={{
          marginTop:6, width:"100%", padding:"12px",
          background: saved ? C.cardDeep : "transparent",
          border:`0.5px solid ${saved ? C.amber : C.border}`,
          borderRadius:6, color: saved ? C.amber : C.textDim,
          fontSize:11, fontFamily:sans, letterSpacing:3, cursor:"pointer", transition:"all 0.3s",
        }}>
          {saved ? "✦ 感恩已送出，宇宙已收到" : "記錄感恩"}
        </button>
      </div>

      {/* Streak */}
      <div style={{
        background:C.card, border:`0.5px solid ${C.border}`,
        borderRadius:10, padding:"14px 20px",
        marginBottom:20, display:"flex", alignItems:"center", gap:16,
        boxShadow:`0 2px 12px ${C.shadow}`,
      }}>
        <div style={{ fontFamily:serif, fontSize:40, color:C.amber, lineHeight:1 }}>7</div>
        <div>
          <div style={{ fontFamily:serif, fontSize:13, color:C.text, marginBottom:3 }}>連續感恩第 7 天</div>
          <div style={{ fontFamily:sans, fontSize:10, color:C.textDim }}>豐盛正在向你流來</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:5 }}>
          {Array.from({length:7},(_,i)=>(
            <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:C.amberLt, opacity:0.4+i*0.09 }} />
          ))}
        </div>
      </div>

      {/* History timeline */}
      <div style={{ fontFamily:sans, fontSize:10, letterSpacing:4, color:C.textDim, marginBottom:16 }}>過去的感恩</div>
      {history.map((e,ei) => (
        <div key={ei} style={{
          paddingLeft:18, marginBottom:20,
          borderLeft:`1px solid ${C.border}`,
          position:"relative",
        }}>
          <div style={{
            position:"absolute", left:-4, top:5,
            width:7, height:7, borderRadius:"50%",
            background:C.amberPale, border:`1px solid ${C.amberLt}`,
          }} />
          <div style={{ fontFamily:sans, fontSize:9, color:C.textDim, letterSpacing:2, marginBottom:8 }}>{e.date}</div>
          {e.items.map((item,ii) => (
            <div key={ii} style={{ fontFamily:serif, fontSize:12, fontStyle:"italic", color:C.textMid, marginBottom:5, lineHeight:1.7 }}>
              「{item}」
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
const tabs = [
  { id:"today",    label:"今日",   icon:"◎" },
  { id:"orders",   label:"訂單",   icon:"◫" },
  { id:"angel",    label:"天使",   icon:"✦" },
  { id:"gratitude",label:"感恩",   icon:"♡" },
];

export default function App() {
  const [active, setActive] = useState("today");

  return (
    <div style={{
      background: C.bg,
      minHeight:"100vh", maxWidth:430,
      margin:"0 auto",
      fontFamily:serif,
      color:C.text,
      position:"relative",
    }}>
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:${C.bg}; }
        textarea::placeholder, input::placeholder { color:${C.textDim}; font-style:italic; }
        ::-webkit-scrollbar { width:0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{ overflowY:"auto", maxHeight:"100vh" }}>
        {active==="today"     && <TodayTab />}
        {active==="orders"    && <OrdersTab />}
        {active==="angel"     && <AngelTab />}
        {active==="gratitude" && <GratitudeTab />}
      </div>

      {/* Bottom nav */}
      <div style={{
        position:"fixed", bottom:0,
        left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:430,
        background:"rgba(245,239,230,0.95)",
        backdropFilter:"blur(16px)",
        borderTop:`0.5px solid ${C.border}`,
        display:"flex", zIndex:100,
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)} style={{
            flex:1, padding:"13px 0 17px",
            background:"transparent", border:"none", cursor:"pointer",
          }}>
            <div style={{ fontSize:15, marginBottom:3, color:active===t.id ? C.amber : C.textDim, transition:"color 0.2s" }}>
              {t.icon}
            </div>
            <div style={{ fontSize:9, letterSpacing:2, fontFamily:sans, color:active===t.id ? C.amber : C.textDim, transition:"color 0.2s" }}>
              {t.label}
            </div>
            {active===t.id && (
              <div style={{ width:16, height:1, background:C.amber, margin:"4px auto 0", borderRadius:1 }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
