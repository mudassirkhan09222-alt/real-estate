"use client";

import { useMemo, useState } from "react";
import { LineChart, type LinePoint } from "@/components/ui/LineChart";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatCompactPrice, formatPrice } from "@/lib/format";

/**
 * Interactive yield forecast. Every input recomputes cash flow, cash-on-cash
 * return, and an equity+cashflow curve over the holding period, rendered with the
 * animated LineChart. Numbers are illustrative projections, not guarantees.
 */

interface Inputs {
  price: number;
  downPct: number;
  rate: number;
  termYears: number;
  rent: number;
  expenses: number;
  appreciation: number;
  holdYears: number;
}

const DEFAULTS: Inputs = {
  price: 2_000_000,
  downPct: 30,
  rate: 5.5,
  termYears: 25,
  rent: 9_500,
  expenses: 1_800,
  appreciation: 4,
  holdYears: 10,
};

function monthlyPayment(principal: number, annualRatePct: number, termYears: number): number {
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

function balanceAfter(principal: number, annualRatePct: number, termYears: number, monthsElapsed: number): number {
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return (principal * (n - monthsElapsed)) / n;
  const growth = Math.pow(1 + r, n);
  const elapsed = Math.pow(1 + r, monthsElapsed);
  return (principal * (growth - elapsed)) / (growth - 1);
}

export function YieldForecast() {
  const [v, setV] = useState<Inputs>(DEFAULTS);

  const calc = useMemo(() => {
    const down = v.price * (v.downPct / 100);
    const loan = v.price - down;
    const mortgage = monthlyPayment(loan, v.rate, v.termYears);
    const monthlyNet = v.rent - v.expenses - mortgage;
    const annualNet = monthlyNet * 12;
    const grossYield = v.price > 0 ? (v.rent * 12) / v.price * 100 : 0;
    const cashOnCash = down > 0 ? (annualNet / down) * 100 : 0;

    const points: LinePoint[] = [];
    const years = Math.max(1, Math.min(30, Math.round(v.holdYears)));
    for (let k = 0; k <= years; k++) {
      const value = v.price * Math.pow(1 + v.appreciation / 100, k);
      const balance = balanceAfter(loan, v.rate, v.termYears, k * 12);
      const equity = Math.max(0, value - balance);
      const cumulativeCash = annualNet * k;
      points.push({ label: `Y${k}`, value: Math.round(equity + cumulativeCash) });
    }

    const endValue = v.price * Math.pow(1 + v.appreciation / 100, years);
    const endEquity = Math.max(0, endValue - balanceAfter(loan, v.rate, v.termYears, years * 12));

    return { down, loan, mortgage, monthlyNet, annualNet, grossYield, cashOnCash, points, endEquity, endValue, years };
  }, [v]);

  const set = (patch: Partial<Inputs>) => setV((prev) => ({ ...prev, ...patch }));

  return (
    <section id="forecast" className="bg-espresso-950 py-24 text-cream-100 scroll-mt-24">
      <div className="container-luxe">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Yield Forecast"
            title={<span className="text-cream-50">Model your return before you invest</span>}
            subtitle={<span className="text-cream-200/60">Adjust the assumptions to see projected cash flow, cash-on-cash return, and equity build-up over your holding period.</span>}
          />
        </AnimatedSection>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Inputs */}
          <AnimatedSection className="h-fit">
            <div className="rounded-2xl border border-cream-200/10 bg-espresso-900/60 p-6 sm:p-8">
              <div className="space-y-7">
                <Slider label="Purchase price" value={v.price} min={200_000} max={10_000_000} step={50_000} format={(n) => formatCompactPrice(n)} onChange={(n) => set({ price: n })} />
                <Slider label="Down payment" value={v.downPct} min={0} max={100} step={5} format={(n) => `${n}%`} onChange={(n) => set({ downPct: n })} />
                <Slider label="Interest rate" value={v.rate} min={0} max={12} step={0.1} format={(n) => `${n.toFixed(1)}%`} onChange={(n) => set({ rate: n })} />
                <Slider label="Holding period" value={v.holdYears} min={1} max={30} step={1} format={(n) => `${n} yrs`} onChange={(n) => set({ holdYears: n })} />
                <div className="grid grid-cols-2 gap-5">
                  <NumberField label="Monthly rent" value={v.rent} step={100} onChange={(n) => set({ rent: n })} />
                  <NumberField label="Monthly expenses" value={v.expenses} step={50} onChange={(n) => set({ expenses: n })} />
                  <NumberField label="Loan term (yrs)" value={v.termYears} min={5} max={40} step={1} onChange={(n) => set({ termYears: n })} />
                  <NumberField label="Appreciation / yr" value={v.appreciation} min={0} max={12} step={0.5} onChange={(n) => set({ appreciation: n })} />
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Results */}
          <AnimatedSection delay={0.08}>
            <div className="flex h-full flex-col rounded-2xl border border-cream-200/10 bg-espresso-900/60 p-6 sm:p-8">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Metric label="Monthly cash flow" value={formatPrice(Math.round(calc.monthlyNet))} accent={calc.monthlyNet >= 0} />
                <Metric label="Cash-on-cash" value={`${calc.cashOnCash.toFixed(1)}%`} accent={calc.cashOnCash >= 0} />
                <Metric label="Gross yield" value={`${calc.grossYield.toFixed(1)}%`} />
                <Metric label={`Equity @ Y${calc.years}`} value={formatCompactPrice(Math.round(calc.endEquity))} />
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-cream-100">Projected position over {calc.years} years</p>
                  <p className="text-xs text-cream-200/40">Equity + cumulative cash flow</p>
                </div>
                <div className="mt-4 rounded-xl bg-espresso-950/50 p-4">
                  <LineChart points={calc.points} stroke="#c2a878" areaId="forecast-area" />
                </div>
              </div>

              <p className="mt-6 text-xs leading-relaxed text-cream-200/40">
                Projections are estimates for illustration only and are not investment
                advice. Actual returns depend on market conditions, costs, and tenanting.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-espresso-950/40 p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-cream-200/45">{label}</p>
      <p className={`mt-1.5 font-serif text-xl ${accent === true ? "text-gold-400" : accent === false ? "text-red-300/80" : "text-cream-50"}`}>
        {value}
      </p>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (n: number) => string;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm text-cream-200/70">{label}</label>
        <span className="font-serif text-base text-cream-50">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-cream-200/15 accent-gold-500"
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  min = 0,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label className="text-sm text-cream-200/70">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full rounded-lg border border-cream-200/10 bg-espresso-950/40 px-3 py-2.5 text-sm text-cream-50 outline-none transition-colors focus:border-gold-500"
      />
    </div>
  );
}
