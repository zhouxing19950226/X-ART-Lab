import React, { useState } from "react";
import {
  Compass,
  BookMarked,
  CreditCard,
  User,
  Lock,
  ChevronLeft,
  Search,
  Check,
} from "lucide-react";

const ink = "#141311";
const paper = "#FAF9F4";
const red = "#C81E1E";
const muted = "#8C897D";
const hairline = "#E3E0D5";

const papers = [
  {
    n: "07",
    tag: "UNKNOWABILITY",
    title: "从可见到缺席：不可知性及其悖论",
    titleEn: "From Visibility to Absence",
    excerpt: "不可知性不是“神秘女人”的浪漫化，而是对信息边界的坚持。",
    locked: true,
    minutes: 12,
  },
  {
    n: "04",
    tag: "TIME",
    title: "独处与时间所有权：非生产性存在的政治",
    titleEn: "Solitude and the Ownership of Time",
    excerpt: "她没有变得更好，她只是拥有了一段不需要产生价值的时间。",
    locked: true,
    minutes: 9,
  },
  {
    n: "02",
    tag: "SPACE",
    title: "房间不是背景：Woolf、Pollock 与性别化空间",
    titleEn: "The Room Is Not a Backdrop",
    excerpt: "房间既可能保护主体，也可能把主体限制在私人领域。",
    locked: false,
    minutes: 14,
  },
  {
    n: "01",
    tag: "THE GAZE",
    title: "观看的结构：Berger、Mulvey 与观看权力",
    titleEn: "The Structure of Looking",
    excerpt: "观看并没有消失；被撤回的是观看者理所当然获得回应的权利。",
    locked: false,
    minutes: 11,
  },
];

const plans = [
  {
    id: "monthly",
    name: "月度",
    nameEn: "MONTHLY",
    price: "¥28",
    period: "/ 月",
    note: "随时取消",
  },
  {
    id: "yearly",
    name: "年度",
    nameEn: "YEARLY",
    price: "¥268",
    period: "/ 年",
    note: "相当于 ¥22 / 月",
    recommended: true,
  },
  {
    id: "institution",
    name: "机构",
    nameEn: "INSTITUTION",
    price: "定制",
    period: "",
    note: "院校 / 图书馆 / 工作室",
  },
];

function Eyebrow({ children }) {
  return (
    <div
      style={{
        color: red,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.12em",
      }}
    >
      {children}
    </div>
  );
}

function TopBar({ title, onBack }) {
  return (
    <div
      className="flex items-center justify-between px-5"
      style={{ height: 52, borderBottom: `1px solid ${hairline}` }}
    >
      <div className="flex items-center gap-2" style={{ minWidth: 24 }}>
        {onBack ? (
          <button onClick={onBack} aria-label="返回">
            <ChevronLeft size={20} color={ink} />
          </button>
        ) : (
          <div style={{ width: 20 }} />
        )}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: ink,
        }}
      >
        {title}
      </div>
      <div style={{ width: 20 }} />
    </div>
  );
}

function DiscoverScreen({ onOpenPaper }) {
  return (
    <div className="flex flex-col h-full" style={{ background: paper }}>
      <div className="px-5 pt-6 pb-4" style={{ borderBottom: `1px solid ${hairline}` }}>
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: ink, letterSpacing: "-0.01em" }}>
              格物
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: muted, letterSpacing: "0.18em", marginTop: 2 }}>
              GEWU · CONTEMPORARY ART RESEARCH
            </div>
          </div>
          <button
            className="flex items-center justify-center rounded-full"
            style={{ width: 36, height: 36, border: `1px solid ${hairline}` }}
            aria-label="搜索"
          >
            <Search size={16} color={ink} />
          </button>
        </div>
      </div>

      <div className="px-5 pt-5 pb-2">
        <Eyebrow>本期专题 / ISSUE 01</Eyebrow>
        <div style={{ fontSize: 20, fontWeight: 800, color: ink, marginTop: 6, lineHeight: 1.3 }}>
          无人观看
        </div>
        <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>
          女性独处、私人空间与观看的政治 · 共 10 篇
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6" style={{ marginTop: 8 }}>
        {papers.map((p) => (
          <button
            key={p.n}
            onClick={() => onOpenPaper(p)}
            className="w-full text-left"
            style={{
              display: "block",
              paddingTop: 16,
              paddingBottom: 16,
              borderBottom: `1px solid ${hairline}`,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: red,
                  minWidth: 20,
                  paddingTop: 2,
                }}
              >
                {p.n}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: muted, letterSpacing: "0.1em" }}>
                  {p.tag}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: ink, marginTop: 4, lineHeight: 1.4 }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 12, color: muted, marginTop: 6, lineHeight: 1.5 }}>
                  {p.excerpt}
                </div>
                <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: muted }}>{p.minutes} 分钟阅读</span>
                  {p.locked && (
                    <span className="flex items-center gap-1" style={{ fontSize: 11, color: red }}>
                      <Lock size={10} /> 订阅解锁
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ReaderScreen({ paper, onBack, onSubscribe, subscribed }) {
  const isLocked = paper.locked && !subscribed;
  return (
    <div className="flex flex-col h-full" style={{ background: paper }}>
      <TopBar title="正文" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-8">
        <Eyebrow>{paper.n} / {paper.tag}</Eyebrow>
        <div style={{ fontSize: 22, fontWeight: 800, color: ink, marginTop: 8, lineHeight: 1.35 }}>
          {paper.title}
        </div>
        <div style={{ fontSize: 12, color: muted, marginTop: 6 }}>
          {paper.titleEn} · {paper.minutes} 分钟阅读
        </div>

        <div style={{ height: 1, background: hairline, margin: "20px 0" }} />

        <p style={{ fontSize: 15, color: ink, lineHeight: 1.9 }}>
          {paper.excerpt}
          在西方视觉文化的长期传统中，女性形象经常被组织为可观看、可描述和可欲望的对象。本文的出发点不是简单要求"更多女性形象"，而是追问图像内部的关系。
        </p>

        {isLocked ? (
          <div className="relative" style={{ marginTop: 8 }}>
            <p
              style={{
                fontSize: 15,
                color: ink,
                lineHeight: 1.9,
                filter: "blur(4px)",
                userSelect: "none",
              }}
            >
              当人物转身、闭眼、睡眠、阅读或发呆时，她仍然处于画面之中，也仍然被观众看见；然而，她不再通过眼神、姿态或叙事线索主动确认观看者的存在。因此，"无人观看"并非字面意义上的没有观众。它更接近一种方法论上的悖论：艺术作品天然要求被观看，但作品中的主体可以拒绝为观看提供充分回应。
            </p>
            <div
              className="absolute inset-x-0 bottom-0 flex flex-col items-center text-center px-4"
              style={{
                paddingTop: 48,
                background: `linear-gradient(180deg, transparent, ${paper} 55%)`,
              }}
            >
              <Lock size={18} color={red} />
              <div style={{ fontSize: 14, fontWeight: 700, color: ink, marginTop: 10 }}>
                你尚未获得进入此文本其余部分的权利
              </div>
              <div style={{ fontSize: 12, color: muted, marginTop: 4, maxWidth: 260 }}>
                订阅「格物」，解锁本篇及全部研究专题的完整正文
              </div>
              <button
                onClick={onSubscribe}
                style={{
                  marginTop: 16,
                  background: ink,
                  color: paper,
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "12px 28px",
                  borderRadius: 999,
                }}
              >
                订阅 / 获得进入与理解的权利
              </button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 15, color: ink, lineHeight: 1.9, marginTop: 8 }}>
            当人物转身、闭眼、睡眠、阅读或发呆时，她仍然处于画面之中，也仍然被观众看见；然而，她不再通过眼神、姿态或叙事线索主动确认观看者的存在。因此，"无人观看"并非字面意义上的没有观众。
          </p>
        )}
      </div>
    </div>
  );
}

function SubscribeScreen({ onSubscribed, subscribed }) {
  const [selected, setSelected] = useState("yearly");
  return (
    <div className="flex flex-col h-full" style={{ background: paper }}>
      <div className="px-5 pt-6 pb-4" style={{ borderBottom: `1px solid ${hairline}` }}>
        <Eyebrow>MEMBERSHIP</Eyebrow>
        <div style={{ fontSize: 22, fontWeight: 800, color: ink, marginTop: 8, lineHeight: 1.35 }}>
          订阅，获得进入与理解的权利
        </div>
        <div style={{ fontSize: 12, color: muted, marginTop: 6, lineHeight: 1.6 }}>
          解锁全部当代艺术研究专题，含正文、参考文献与创作概念矩阵
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-6">
        {plans.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className="w-full text-left"
            style={{
              display: "block",
              padding: 16,
              marginBottom: 12,
              borderRadius: 12,
              border: `1px solid ${selected === p.id ? red : hairline}`,
              background: selected === p.id ? "#FDF1F1" : "transparent",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 15, fontWeight: 700, color: ink }}>{p.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: muted, letterSpacing: "0.08em" }}>
                    {p.nameEn}
                  </span>
                  {p.recommended && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: paper,
                        background: red,
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      推荐
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: muted, marginTop: 4 }}>{p.note}</div>
              </div>
              <div className="flex items-center gap-3">
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: ink }}>{p.price}</span>
                  <span style={{ fontSize: 11, color: muted }}>{p.period}</span>
                </div>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: `1.5px solid ${selected === p.id ? red : hairline}`,
                    background: selected === p.id ? red : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selected === p.id && <Check size={11} color={paper} />}
                </div>
              </div>
            </div>
          </button>
        ))}

        <div style={{ marginTop: 8 }}>
          {["全部研究专题完整正文", "可下载 PDF / 离线阅读", "创作概念矩阵与实践方法附录"].map(
            (f) => (
              <div key={f} className="flex items-center gap-2" style={{ marginTop: 10 }}>
                <Check size={14} color={red} />
                <span style={{ fontSize: 13, color: ink }}>{f}</span>
              </div>
            )
          )}
        </div>
      </div>

      <div className="px-5 pb-6 pt-3" style={{ borderTop: `1px solid ${hairline}` }}>
        <button
          onClick={onSubscribed}
          style={{
            width: "100%",
            background: subscribed ? muted : ink,
            color: paper,
            fontSize: 14,
            fontWeight: 700,
            padding: "14px 0",
            borderRadius: 999,
          }}
        >
          {subscribed ? "已订阅" : "确认订阅"}
        </button>
      </div>
    </div>
  );
}

function ProfileScreen({ subscribed }) {
  return (
    <div className="flex flex-col h-full" style={{ background: paper }}>
      <div className="px-5 pt-6 pb-4" style={{ borderBottom: `1px solid ${hairline}` }}>
        <Eyebrow>ACCOUNT</Eyebrow>
        <div style={{ fontSize: 20, fontWeight: 800, color: ink, marginTop: 8 }}>我的书房</div>
      </div>

      <div className="px-5 pt-5">
        <div
          style={{
            border: `1px solid ${hairline}`,
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>会员状态</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>
                {subscribed ? "格物年度会员 · 有效期至 2027-08" : "未订阅"}
              </div>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: subscribed ? "#0F6E56" : muted,
                background: subscribed ? "#E1F5EE" : "#F1EFE8",
                padding: "4px 10px",
                borderRadius: 999,
              }}
            >
              {subscribed ? "生效中" : "免费版"}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: "0.08em" }}>
            已收藏
          </div>
          {papers.slice(0, 2).map((p) => (
            <div
              key={p.n}
              className="flex items-center justify-between"
              style={{ padding: "12px 0", borderBottom: `1px solid ${hairline}` }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: ink }}>{p.title}</div>
                <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{p.tag}</div>
              </div>
              <BookMarked size={16} color={muted} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabBar({ tab, setTab }) {
  const items = [
    { id: "discover", label: "发现", icon: Compass },
    { id: "library", label: "我的", icon: User },
    { id: "subscribe", label: "订阅", icon: CreditCard },
  ];
  return (
    <div
      className="flex items-center justify-around"
      style={{ height: 64, borderTop: `1px solid ${hairline}`, background: paper }}
    >
      {items.map((it) => {
        const Icon = it.icon;
        const active = tab === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setTab(it.id)}
            className="flex flex-col items-center gap-1"
          >
            <Icon size={20} color={active ? red : muted} />
            <span style={{ fontSize: 10, color: active ? red : muted, fontWeight: active ? 700 : 400 }}>
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function GewuApp() {
  const [tab, setTab] = useState("discover");
  const [openPaper, setOpenPaper] = useState(null);
  const [subscribed, setSubscribed] = useState(false);

  let screen;
  if (openPaper) {
    screen = (
      <ReaderScreen
        paper={openPaper}
        onBack={() => setOpenPaper(null)}
        onSubscribe={() => {
          setOpenPaper(null);
          setTab("subscribe");
        }}
        subscribed={subscribed}
      />
    );
  } else if (tab === "discover") {
    screen = <DiscoverScreen onOpenPaper={setOpenPaper} />;
  } else if (tab === "subscribe") {
    screen = (
      <SubscribeScreen subscribed={subscribed} onSubscribed={() => setSubscribed(true)} />
    );
  } else {
    screen = <ProfileScreen subscribed={subscribed} />;
  }

  return (
    <div
      className="w-full flex items-center justify-center"
      style={{ minHeight: 760, background: "#EFEDE5", padding: "32px 0" }}
    >
      <div
        style={{
          width: 380,
          height: 720,
          borderRadius: 36,
          border: `8px solid ${ink}`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ flex: 1, overflow: "hidden" }}>{screen}</div>
        {!openPaper && <TabBar tab={tab} setTab={setTab} />}
      </div>
    </div>
  );
}
