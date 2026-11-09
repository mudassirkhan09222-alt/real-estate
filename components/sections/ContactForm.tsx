"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

const PROPERTY_TYPES = ["House", "Apartment / Flat", "Plot / Land", "Shop / Commercial", "Office", "Villa", "Other"];
const PURPOSES       = ["Buy",  "Rent / Lease",     "Sell",        "Get Valuation"];
const BUDGETS        = [
  "Under PKR 50 Lakh",
  "PKR 50 Lakh – 1 Crore",
  "PKR 1 Crore – 2 Crore",
  "PKR 2 Crore – 5 Crore",
  "PKR 5 Crore+",
  "Flexible",
];
const BEDROOMS = ["Studio", "1", "2", "3", "4", "5", "6+", "Open Plan"];

export function ContactForm() {
  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    propertyType: "", purpose: "", budget: "",
    bedrooms: "", area: "", message: "",
  });
  const [status,  setStatus]  = useState<"idle"|"sending"|"sent"|"error">("idle");
  const [errMsg,  setErrMsg]  = useState("");

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending"); setErrMsg("");
    const r = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (!r.ok) { setStatus("error"); setErrMsg(d.error || "Something went wrong"); return; }
    setStatus("sent");
    setForm({ name:"", phone:"", email:"", propertyType:"", purpose:"", budget:"", bedrooms:"", area:"", message:"" });
  }

  return (
    <section
      id="contact-form"
      className="scroll-mt-20"
      style={{ background: "linear-gradient(135deg,#1C1208 0%,#2C1A0E 100%)", padding: "80px 0" }}
    >
      <div className="estatio-container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">

          {/* ── Left: heading ── */}
          <AnimatedSection className="text-white">
            <p style={{ fontFamily:"var(--font-inter)", fontSize:11, fontWeight:700, letterSpacing:"0.28em", textTransform:"uppercase", color:"#C8A96E", marginBottom:12 }}>
              Find Your Dream Property
            </p>
            <h2 style={{ fontFamily:"var(--font-cormorant)", fontSize:"clamp(2rem,5vw,3.2rem)", fontWeight:700, color:"#FAF6EF", lineHeight:1.1, margin:"0 0 16px" }}>
              Tell Us What You&apos;re Looking For
            </h2>
            <p style={{ fontFamily:"var(--font-inter)", fontSize:14, color:"rgba(250,246,239,0.65)", lineHeight:1.8, margin:"0 0 28px", maxWidth:380 }}>
              Fill in your requirements and our team will get back to you with the best available options.
            </p>

            {/* Contact details */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <a href="https://wa.me/923122249346" target="_blank" rel="noreferrer"
                style={{ display:"inline-flex", alignItems:"center", gap:10, color:"#FAF6EF", textDecoration:"none", fontFamily:"var(--font-inter)", fontSize:14, fontWeight:600 }}>
                <span style={{ width:36, height:36, borderRadius:"50%", background:"#25D366", display:"grid", placeItems:"center", flexShrink:0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.828L.057 23.776a.5.5 0 0 0 .614.637l6.071-1.525A11.935 11.935 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.511-5.178-1.401l-.37-.22-3.833.963.98-3.77-.241-.388A9.933 9.933 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                </span>
                0312-2249346
              </a>
              <a href="mailto:warsijeeconstructioncompany@gmail.com"
                style={{ display:"inline-flex", alignItems:"center", gap:10, color:"rgba(250,246,239,0.65)", textDecoration:"none", fontFamily:"var(--font-inter)", fontSize:13 }}>
                <span style={{ width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,0.08)", display:"grid", placeItems:"center", flexShrink:0, fontSize:16 }}>
                  ✉️
                </span>
                warsijeeconstructioncompany@gmail.com
              </a>
            </div>
          </AnimatedSection>

          {/* ── Right: form ── */}
          <AnimatedSection delay={0.1}>
            <form onSubmit={onSubmit}
              style={{ background:"rgba(250,246,239,0.05)", border:"1px solid rgba(250,246,239,0.1)", borderRadius:16, padding:"28px 28px 24px" }}>

              {status === "sent" ? (
                <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} style={{ textAlign:"center", padding:"40px 20px" }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                  <h3 style={{ fontFamily:"var(--font-cormorant)", fontSize:"1.6rem", color:"#FAF6EF", margin:"0 0 8px" }}>Enquiry Sent!</h3>
                  <p style={{ fontFamily:"var(--font-inter)", fontSize:14, color:"rgba(250,246,239,0.6)", margin:"0 0 20px" }}>
                    We&apos;ll get back to you shortly on your phone or email.
                  </p>
                  <button type="button" onClick={() => setStatus("idle")}
                    style={{ background:"#C8A96E", color:"#1C1208", border:"none", borderRadius:20, padding:"10px 28px", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                    <Field label="Full Name *">
                      <input value={form.name} onChange={set("name")} required placeholder="Owais Ahmed" style={INP} />
                    </Field>
                    <Field label="Phone Number *">
                      <input value={form.phone} onChange={set("phone")} required placeholder="03XX-XXXXXXX" style={INP} />
                    </Field>
                    <Field label="Email (optional)">
                      <input value={form.email} onChange={set("email")} type="email" placeholder="you@email.com" style={INP} />
                    </Field>
                    <Field label="Property Type">
                      <select value={form.propertyType} onChange={set("propertyType")} style={INP}>
                        <option value="" style={OPT}>Select type…</option>
                        {PROPERTY_TYPES.map(t => <option key={t} style={OPT}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="Purpose">
                      <select value={form.purpose} onChange={set("purpose")} style={INP}>
                        <option value="" style={OPT}>Select purpose…</option>
                        {PURPOSES.map(p => <option key={p} style={OPT}>{p}</option>)}
                      </select>
                    </Field>
                    <Field label="Budget">
                      <select value={form.budget} onChange={set("budget")} style={INP}>
                        <option value="" style={OPT}>Select budget…</option>
                        {BUDGETS.map(b => <option key={b} style={OPT}>{b}</option>)}
                      </select>
                    </Field>
                    <Field label="Bedrooms">
                      <select value={form.bedrooms} onChange={set("bedrooms")} style={INP}>
                        <option value="" style={OPT}>Select…</option>
                        {BEDROOMS.map(b => <option key={b} style={OPT}>{b}</option>)}
                      </select>
                    </Field>
                    <Field label="Area Required">
                      <input value={form.area} onChange={set("area")} placeholder="e.g. 200 sq yd / 5 Marla" style={INP} />
                    </Field>
                  </div>

                  <Field label="Additional Message (optional)">
                    <textarea value={form.message} onChange={set("message")} rows={3} placeholder="Any specific requirements, preferred location, etc." style={{ ...INP, resize:"vertical" }} />
                  </Field>

                  {status === "error" && (
                    <p style={{ color:"#f87171", fontSize:13, margin:"10px 0 0", fontFamily:"var(--font-inter)" }}>{errMsg}</p>
                  )}

                  <button type="submit" disabled={status === "sending"}
                    style={{ width:"100%", background:"#C8A96E", color:"#1C1208", border:"none", borderRadius:10, padding:"13px", fontWeight:700, fontSize:15, cursor:"pointer", marginTop:18, opacity: status === "sending" ? .7 : 1 }}>
                    {status === "sending" ? "Sending…" : "Send Enquiry →"}
                  </button>
                </>
              )}
            </form>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display:"block", fontFamily:"var(--font-inter)", fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(250,246,239,0.5)", marginBottom:6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const INP: React.CSSProperties = {
  width:"100%", background:"rgba(250,246,239,0.08)",
  border:"1px solid rgba(250,246,239,0.15)", borderRadius:8,
  padding:"10px 12px", color:"#FAF6EF",
  fontFamily:"var(--font-inter)", fontSize:14,
  outline:"none", boxSizing:"border-box",
  colorScheme: "dark",
};

const OPT: React.CSSProperties = {
  background: "#2C1A0E",
  color: "#FAF6EF",
};
