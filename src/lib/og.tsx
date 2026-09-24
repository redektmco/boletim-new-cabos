import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { movementOf, pressureOf, variation } from "@/lib/bulletin/calc";
import { formatDateShort, formatDollar, formatNumber, formatPercent, formatTonnes } from "@/lib/bulletin/format";
import { BIAS_LABEL, type MetricKey } from "@/lib/bulletin/labels";
import type { BulletinContent, Pressure } from "@/lib/bulletin/schema";

/** Imagem de prévia (WhatsApp, LinkedIn…) com os números da edição. */
export const OG_SIZE = { width: 1200, height: 630 };

async function fonts() {
  const dir = join(process.cwd(), "assets/fonts");
  const [montserrat700, montserrat800, inter400, inter600] = await Promise.all([
    readFile(join(dir, "montserrat-700.ttf")),
    readFile(join(dir, "montserrat-800.ttf")),
    readFile(join(dir, "inter-400.ttf")),
    readFile(join(dir, "inter-600.ttf")),
  ]);
  return [
    { name: "Montserrat", data: montserrat700, weight: 700 as const, style: "normal" as const },
    { name: "Montserrat", data: montserrat800, weight: 800 as const, style: "normal" as const },
    { name: "Inter", data: inter400, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: inter600, weight: 600 as const, style: "normal" as const },
  ];
}

const PRESSURE_COLORS: Record<Pressure, { bg: string; fg: string }> = {
  alta: { bg: "rgba(217,45,32,0.28)", fg: "#ffc9c3" },
  baixa: { bg: "rgba(7,148,85,0.32)", fg: "#a6f0c6" },
  neutro: { bg: "rgba(255,255,255,0.12)", fg: "rgba(255,255,255,0.8)" },
};

function Arrow({ up, color }: { up: boolean; color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {up ? <path d="M12 19V5M5 12l7-7 7 7" /> : <path d="M12 5v14M19 12l-7 7-7-7" />}
    </svg>
  );
}

function Mark() {
  return (
    <svg width="56" height="56" viewBox="0 0 64 64">
      <ellipse cx="32" cy="38" rx="25" ry="12" transform="rotate(-18 32 38)" fill="none" stroke="#1479f6" strokeWidth="5" />
      <path d="M35 3 L17 35 H29 L23 61 L46 25 H34 L42 3 Z" fill="#f5a70f" />
      <path d="M8.2 45.7 A25 12 -18 0 0 55.8 30.3" fill="none" stroke="#1479f6" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function Kpi({ metric, label, value, change }: { metric: MetricKey; label: string; value: string; change: number | null }) {
  const movement = movementOf(change);
  const colors = PRESSURE_COLORS[pressureOf(metric, movement)];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        flexGrow: 1,
        flexBasis: 0,
        padding: "22px 24px",
        borderRadius: 20,
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.16)",
      }}
    >
      <div style={{ display: "flex", fontFamily: "Inter", fontWeight: 600, fontSize: 18, letterSpacing: 2, color: "#eaa877", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ display: "flex", marginTop: 8, fontFamily: "Montserrat", fontWeight: 700, fontSize: 38, color: "#fff" }}>{value}</div>
      {change != null ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 10,
            padding: "4px 12px",
            borderRadius: 999,
            background: colors.bg,
            color: colors.fg,
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 20,
          }}
        >
          {movement !== "flat" ? <Arrow up={movement === "up"} color={colors.fg} /> : null}
          {formatPercent(change)}
        </div>
      ) : null}
    </div>
  );
}

export async function renderBulletinOg(content: BulletinContent | null) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px 60px",
          color: "#fff",
          backgroundColor: "#011a3d",
          backgroundImage:
            "radial-gradient(circle at 100% 0%, rgba(220,138,79,0.6) 0%, rgba(197,106,44,0.25) 30%, rgba(1,26,61,0) 60%), linear-gradient(135deg, #011a3d 0%, #012759 60%, #0a3a7c 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Mark />
            <div style={{ display: "flex", flexDirection: "column", fontFamily: "Montserrat", fontWeight: 800, lineHeight: 0.9 }}>
              <span style={{ fontSize: 30 }}>NEW</span>
              <span style={{ fontSize: 24, letterSpacing: 1.5 }}>CABOS</span>
            </div>
            <div style={{ display: "flex", width: 2, height: 44, background: "rgba(255,255,255,0.25)", marginLeft: 8, marginRight: 8 }} />
            <div style={{ display: "flex", fontFamily: "Inter", fontWeight: 600, fontSize: 22, letterSpacing: 3, color: "#eaa877", textTransform: "uppercase" }}>
              Boletim do Cobre
            </div>
          </div>
          {content ? (
            <div
              style={{
                display: "flex",
                padding: "10px 20px",
                borderRadius: 999,
                background: "#f2b807",
                color: "#011a3d",
                fontFamily: "Montserrat",
                fontWeight: 700,
                fontSize: 24,
              }}
            >
              {formatDateShort(content.referenceDate)}
            </div>
          ) : null}
        </div>

        {content ? (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", marginTop: 36 }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Montserrat",
                fontWeight: 700,
                fontSize: content.headline.length > 90 ? 44 : 52,
                lineHeight: 1.12,
                letterSpacing: -1,
                maxWidth: 1040,
              }}
            >
              {content.headline}
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: 20, alignItems: "stretch", width: "100%" }}>
              <Kpi
                metric="copper"
                label="Cobre LME (US$/t)"
                value={formatNumber(content.copper.value, 2)}
                change={variation(content.copper.value, content.copper.previous)}
              />
              <Kpi
                metric="dollar"
                label="Dólar"
                value={formatDollar(content.dollar.value)}
                change={variation(content.dollar.value, content.dollar.previous)}
              />
              <Kpi
                metric="stocks"
                label="Estoques LME"
                value={formatTonnes(content.stocks.value)}
                change={variation(content.stocks.value, content.stocks.previous)}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "22px 24px",
                  borderRadius: 20,
                  background: "#fff",
                  color: "#012759",
                  width: 230,
                }}
              >
                <div style={{ display: "flex", fontFamily: "Inter", fontWeight: 600, fontSize: 18, letterSpacing: 2, color: "#637188", textTransform: "uppercase" }}>
                  Direção
                </div>
                <div style={{ display: "flex", marginTop: 8, fontFamily: "Montserrat", fontWeight: 800, fontSize: 30, lineHeight: 1.1 }}>
                  {BIAS_LABEL[content.direction.bias]}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", fontFamily: "Montserrat", fontWeight: 700, fontSize: 64, letterSpacing: -1 }}>Boletim do Cobre</div>
            <div style={{ display: "flex", fontFamily: "Inter", fontSize: 30, color: "rgba(255,255,255,0.75)", maxWidth: 900 }}>
              Cobre na LME, dólar, estoques e o que isso significa para o preço dos cabos fotovoltaicos.
            </div>
          </div>
        )}
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
