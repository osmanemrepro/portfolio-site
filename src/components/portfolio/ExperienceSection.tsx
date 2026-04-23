"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Briefcase, Calendar, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface Experience {
  id: string;
  company: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
}

const defaultExperiences: Experience[] = [
  {
    id: "1",
    company: "Tech Innovations Inc.",
    title: "Kıdemli Frontend Geliştirici",
    description:
      "50K+ kullanıcıya hizmet veren bir SaaS platformu için frontend mimarisini yönettim. Mikro-frontend mimarisi uygulayarak derleme sürelerini %60 azalttım. Junior geliştiricilere mentorluk yaptım ve kodlama standartları belirledim.",
    startDate: "2023-03",
    endDate: null,
    current: true,
  },
  {
    id: "2",
    company: "Digital Solutions Co.",
    title: "Full Stack Geliştirici",
    description:
      "Birden fazla istemciye yönelik web uygulaması geliştirdim ve bakımlarını yaptım. Node.js ile RESTful API'ler oluşturdum ve React ile duyarlı kullanıcı arayüzleri tasarladım. Optimizasyon ile uygulama performansını %40 artırdım.",
    startDate: "2021-06",
    endDate: "2023-02",
    current: false,
  },
  {
    id: "3",
    company: "Startup Hub",
    title: "Junior Geliştirici",
    description:
      "Erken aşama girişimler için web uygulamaları geliştirerek profesyonel yolculuğuma başladım. React, Node.js ve bulut servisleri konusunda pratik deneyim kazandım. Açık kaynak projelere katkıda bulundum.",
    startDate: "2020-01",
    endDate: "2021-05",
    current: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

function formatDate(dateStr: string | null, lang: string): string {
  if (!dateStr) return lang === "tr" ? "Devam Ediyor" : "Present";
  const date = new Date(dateStr + "-01");
  const locale = lang === "tr" ? "tr-TR" : "en-US";
  return date.toLocaleDateString(locale, { month: "short", year: "numeric" });
}

export default function ExperienceSection() {
  const { t, lang } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/experiences")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setExperiences(data);
        } else {
          setExperiences(defaultExperiences);
        }
      })
      .catch(() => {
        setExperiences(defaultExperiences);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      id="experience"
      ref={ref}
      className="relative section-padding overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t("experience.title")}{" "}
            <span className="gradient-text">{t("experience.work")}</span>
          </h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: 80 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"
          />
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="relative"
          >
            {/* Timeline line */}
            <div className="absolute left-4 sm:left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-cyan-500/30 to-transparent" />

            {/* Timeline items */}
            <div className="space-y-8 sm:space-y-12">
              {experiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  variants={cardVariants}
                  className="relative pl-12 sm:pl-16 md:pl-20"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-2.5 sm:left-4.5 md:left-6.5 top-6 w-3 h-3 rounded-full border-2 border-purple-500 bg-black z-10">
                    {exp.current && (
                      <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-30" />
                    )}
                  </div>

                  {/* Card */}
                  <div className="glass-card gradient-border p-5 sm:p-6 group hover:border-purple-500/20 transition-all duration-300">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base sm:text-lg font-semibold text-white/90 group-hover:text-white transition-colors">
                            {exp.title}
                          </h3>
                          {exp.current && (
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-green-500/15 border border-green-500/25 text-green-400 uppercase tracking-wider">
                              {t("experience.current")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{exp.company}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-white/35 font-mono">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {formatDate(exp.startDate, lang)} — {formatDate(exp.endDate, lang)}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-white/45 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
