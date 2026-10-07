"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck, ShieldX, AlertTriangle, CheckCircle2,
  Scan, Award, QrCode, FileText, ChevronRight
} from "lucide-react";

const certificates = [
  {
    id: 1,
    imgSrc: "/cert-nptel.png",
    fallback: "NPTEL",
    title: "Programming In Java",
    issuer: "IIT Kharagpur — NPTEL",
    issuerType: "Ministry of Education",
    score: 98,
    status: "GENUINE",
    verdict: "Verified",
    color: "#4ADE80",
    borderColor: "rgba(74,222,128,0.5)",
    glowColor: "rgba(74,222,128,0.2)",
    badgeLabel: "ELITE ✓",
    badgeColor: "#4ADE80",
    details: ["OCR: 98%", "Issuer: IIT Kharagpur ✓", "Anti-tamper: Clean", "QR: Valid"],
    icon: ShieldCheck,
    stampColor: "#4ADE80",
    stampText: "VERIFIED",
    stampIcon: "✓",
  },
  {
    id: 2,
    imgSrc: "/cert-oracle.png",
    fallback: "ORACLE",
    title: "Gen AI Professional",
    issuer: "Oracle University",
    issuerType: "Corporate Certification",
    score: 96,
    status: "GENUINE",
    verdict: "Verified",
    color: "#38BDF8",
    borderColor: "rgba(56,189,248,0.5)",
    glowColor: "rgba(56,189,248,0.2)",
    badgeLabel: "ORACLE ✓",
    badgeColor: "#38BDF8",
    details: ["OCR: 96%", "Issuer: Oracle ✓", "Anti-tamper: Clean", "Registry: Match"],
    icon: ShieldCheck,
    stampColor: "#38BDF8",
    stampText: "VERIFIED",
    stampIcon: "✓",
  },
  {
    id: 3,
    imgSrc: "/cert-localskills.png",
    fallback: "LocalSkills\nAcademy",
    title: "Digital Marketing Mastery",
    issuer: "LocalSkills Academy",
    issuerType: "Unaccredited",
    score: 12,
    status: "SUSPICIOUS",
    verdict: "Unverified",
    color: "#EF4444",
    borderColor: "rgba(239,68,68,0.5)",
    glowColor: "rgba(239,68,68,0.15)",
    badgeLabel: "REJECTED",
    badgeColor: "#EF4444",
    details: ["OCR: 0%", "Issuer: UNKNOWN ✕", "Tampering: Detected", "Cert ID: Invalid"],
    icon: ShieldX,
    stampColor: "#EF4444",
    stampText: "SUSPICIOUS",
    stampIcon: "⚠",
  },
  {
    id: 4,
    imgSrc: null,
    fallback: "Online\nPlatform\nBasic",
    title: "Web Development Bootcamp",
    issuer: "CourseTech Online",
    issuerType: "Unregistered",
    score: 42,
    status: "LOW CONFIDENCE",
    verdict: "Warning",
    color: "#F59E0B",
    borderColor: "rgba(245,158,11,0.5)",
    glowColor: "rgba(245,158,11,0.15)",
    badgeLabel: "⚠ WARN",
    badgeColor: "#F59E0B",
    details: ["OCR: 42%", "Issuer: NOT Verified", "Anti-tamper: Suspicious", "No Registry"],
    icon: AlertTriangle,
    stampColor: "#F59E0B",
    stampText: "WARNING",
    stampIcon: "⚠",
  },
];

const engineFeatures = [
  { icon: Scan, label: "ML-Powered OCR", desc: "Reads any PDF/image certificate at 98% accuracy" },
  { icon: ShieldCheck, label: "Issuer Verification", desc: "Validates against 390+ accredited institutes & registries" },
  { icon: QrCode, label: "QR Code Validation", desc: "Real-time QR scan and registry cross-check" },
  { icon: FileText, label: "Tamper Detection", desc: "Pixel-level analysis catches edited metadata and forged signatures" },
];

function CertThumbnail({ cert }: { cert: typeof certificates[0] }) {
  if (cert.imgSrc) {
    return (
      <div className="relative w-full h-32 rounded-xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cert.imgSrc}
          alt={cert.title}
          className="w-full h-full object-cover"
          style={{ filter: cert.score < 50 ? 'brightness(0.85) saturate(0.8)' : 'brightness(0.9)' }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* AI Scan overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(2,6,23,0.9) 100%)' }} />
        {/* Scan line */}
        <motion.div
          className="absolute inset-x-0 h-[1px] pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${cert.color}80, transparent)` }}
          animate={{ top: ['5%', '95%', '5%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        {/* Verdict stamp overlay */}
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg"
          style={{ background: `${cert.color}20`, border: `1px solid ${cert.color}50`, backdropFilter: 'blur(8px)' }}>
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: cert.color }}>
            {cert.stampIcon} {cert.verdict}
          </span>
        </div>
      </div>
    );
  }

  // Fallback styled placeholder
  return (
    <div className="w-full h-32 rounded-xl flex flex-col items-center justify-center border relative overflow-hidden"
      style={{ background: `${cert.color}06`, borderColor: `${cert.color}20` }}>
      <div className="text-center mb-1">
        <span className="font-black text-xs uppercase tracking-widest whitespace-pre-line text-center leading-tight"
          style={{ color: cert.color, opacity: 0.6 }}>{cert.fallback}</span>
      </div>
      <cert.icon className="w-6 h-6 mt-1" style={{ color: cert.color, opacity: 0.4 }} />
      {/* Scan line */}
      <motion.div
        className="absolute inset-x-0 h-[1px] pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${cert.color}60, transparent)` }}
        animate={{ top: ['5%', '95%', '5%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export default function Demo() {
  return (
    <section id="demo" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] blur-[110px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(74,222,128,0.07) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] blur-[100px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(239,68,68,0.05) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* LEFT */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border mb-6"
              style={{ background: 'rgba(74,222,128,0.08)', borderColor: 'rgba(74,222,128,0.2)', boxShadow: '0 0 15px rgba(74,222,128,0.08)' }}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-mint" />
              <span className="text-xs font-black text-mint uppercase tracking-widest">Certificate Intelligence</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-syne text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight"
            >
              AI Certificate{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky to-mint">
                Trust Engine
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8 font-medium"
            >
              ML-powered OCR validates certificates from any institution in seconds.
              IIT, NIT, NPTEL — verified instantly. Fake or unaccredited certificates are flagged with evidence.
            </motion.p>

            <div className="space-y-4 mb-10">
              {engineFeatures.map((feat, i) => (
                <motion.div
                  key={feat.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex gap-4 items-start"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.2)' }}>
                    <feat.icon className="w-5 h-5 text-mint" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{feat.label}</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Legend */}
            <div className="p-5 rounded-2xl border mb-8 bg-white/70 dark:bg-[rgba(8,12,20,0.6)]" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Result Legend</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "IIT / NIT / NPTEL", color: "#4ADE80", icon: "✓" },
                  { label: "Coursera / edX / Udemy", color: "#38BDF8", icon: "✓" },
                  { label: "Low Confidence", color: "#F59E0B", icon: "⚠" },
                  { label: "Fake / Unregistered", color: "#EF4444", icon: "✕" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="font-black text-base w-4 text-center" style={{ color: item.color }}>{item.icon}</span>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <motion.a
              href="/auth/signup"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest text-[#020617]"
              style={{ background: 'linear-gradient(135deg, #38BDF8, #4ADE80)', boxShadow: '0 0 30px rgba(74,222,128,0.3)' }}
            >
              Validate Your Certificates
              <ChevronRight className="w-4 h-4" />
            </motion.a>
          </div>

          {/* RIGHT: Certificate Cards with Images */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-[44px] blur-[60px] pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(74,222,128,0.08) 0%, rgba(239,68,68,0.04) 70%, transparent 100%)' }} />

            {/* ML Engine header */}
            <div className="relative flex items-center justify-between px-5 py-3 rounded-2xl border mb-4 bg-white/90 dark:bg-[rgba(8,12,20,0.85)]" style={{ borderColor: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
              <div className="flex items-center gap-2">
                <motion.div className="w-2 h-2 rounded-full bg-mint"
                  animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ boxShadow: '0 0 6px rgba(74,222,128,0.6)' }} />
                <span className="text-[11px] font-black text-mint uppercase tracking-widest">ML Validation Engine — Active</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-mint" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">4 certificates scanned</span>
              </div>
            </div>

            {/* 2x2 Certificate Grid */}
            <div className="grid grid-cols-2 gap-4">
              {certificates.map((cert, i) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className="group relative rounded-2xl border overflow-hidden transition-all duration-500 hover:-translate-y-2 cursor-pointer hover:shadow-[0_0_30px_rgba(var(--tw-color-rgb),0.3)]"
                  style={{
                    background: `rgba(8,12,20,0.9)`,
                    borderColor: cert.borderColor,
                    boxShadow: `0 8px 30px -10px ${cert.color}25, inset 0 0 20px ${cert.glowColor}`,
                  }}
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Top shimmer */}
                  <div className="absolute top-0 inset-x-0 h-[1px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${cert.color}60, transparent)` }} />

                  <div className="p-4">
                    {/* Certificate image/thumbnail */}
                    <CertThumbnail cert={cert} />

                    {/* Info */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[11px] font-black text-white leading-tight truncate pr-2">{cert.title}</p>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ background: `${cert.color}15`, color: cert.color, border: `1px solid ${cert.color}30` }}>
                          {cert.badgeLabel}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium truncate">{cert.issuer}</p>

                      {/* Score bar */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Score</span>
                          <span className="text-[10px] font-black" style={{ color: cert.color }}>{cert.score}/100</span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: cert.color, boxShadow: `0 0 6px ${cert.color}80` }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${cert.score}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { value: "2", label: "Verified", color: "#4ADE80" },
                { value: "1", label: "Warning", color: "#F59E0B" },
                { value: "1", label: "Rejected", color: "#EF4444" },
              ].map(s => (
                <div key={s.label} className="rounded-2xl border p-3 text-center bg-white dark:bg-[rgba(8,12,20,0.94)] shadow-lg shadow-slate-200/50 dark:shadow-none"
                  style={{ borderColor: `${s.color}20`, backdropFilter: 'blur(20px)' }}>
                  <p className="font-black text-xl" style={{ color: s.color, textShadow: `0 0 10px ${s.color}40` }}>{s.value}</p>
                  <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
