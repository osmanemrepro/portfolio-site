"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  icon?: string;
}

const defaultSkills: Skill[] = [
  { id: "1", name: "TypeScript", category: "Languages", level: 90 },
  { id: "2", name: "JavaScript", category: "Languages", level: 95 },
  { id: "3", name: "Python", category: "Languages", level: 80 },
  { id: "4", name: "React", category: "Frontend", level: 92 },
  { id: "5", name: "Next.js", category: "Frontend", level: 88 },
  { id: "6", name: "Tailwind CSS", category: "Frontend", level: 90 },
  { id: "7", name: "Node.js", category: "Backend", level: 85 },
  { id: "8", name: "Express", category: "Backend", level: 82 },
  { id: "9", name: "PostgreSQL", category: "Backend", level: 78 },
  { id: "10", name: "Git", category: "Tools", level: 88 },
  { id: "11", name: "Docker", category: "Tools", level: 72 },
  { id: "12", name: "Figma", category: "Tools", level: 70 },
];

const categoryColors: Record<string, { border: string; glow: string; bar: string }> = {
  Languages: { border: "border-purple-500/20", glow: "hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]", bar: "from-purple-500 to-purple-400" },
  Frontend: { border: "border-cyan-500/20", glow: "hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]", bar: "from-cyan-500 to-cyan-400" },
  Backend: { border: "border-pink-500/20", glow: "hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]", bar: "from-pink-500 to-pink-400" },
  Tools: { border: "border-amber-500/20", glow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]", bar: "from-amber-500 to-amber-400" },
  "DevOps": { border: "border-green-500/20", glow: "hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]", bar: "from-green-500 to-green-400" },
};

const defaultCategoryColor = { border: "border-white/10", glow: "hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]", bar: "from-purple-500 to-indigo-500" };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const skillVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
};

const categoryTranslationKeys: Record<string, string> = {
  Languages: "skills.languages",
  Frontend: "skills.frontend",
  Backend: "skills.backend",
  Tools: "skills.tools",
  DevOps: "skills.devops",
};

export default function SkillsSection() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/skills")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSkills(data);
        } else {
          setSkills(defaultSkills);
        }
      })
      .catch(() => {
        setSkills(defaultSkills);
      })
      .finally(() => setLoading(false));
  }, []);

  const groupedSkills = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <section
      id="skills"
      ref={ref}
      className="relative section-padding overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t("skills.title")}{" "}
            <span className="gradient-text">{t("skills.technologies")}</span>
          </h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: 80 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto rounded-full"
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
            className="grid md:grid-cols-2 gap-6"
          >
            {Object.entries(groupedSkills).map(([category, catSkills]) => {
              const colors = categoryColors[category] || defaultCategoryColor;
              const translationKey = categoryTranslationKeys[category] || "skills.other";
              return (
                <motion.div
                  key={category}
                  variants={cardVariants}
                  whileHover={{ scale: 1.01 }}
                  className={`glass-card p-6 border ${colors.border} ${colors.glow} transition-all duration-300`}
                >
                  <h3 className="text-lg font-semibold mb-5 text-white/90">
                    {t(translationKey)}
                  </h3>
                  <motion.div variants={containerVariants} className="space-y-4">
                    {catSkills.map((skill) => (
                      <motion.div key={skill.id} variants={skillVariants} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                            {skill.icon && <span className="mr-2">{skill.icon}</span>}
                            {skill.name}
                          </span>
                          <span className="text-xs text-white/40 font-mono">
                            {skill.level}%
                          </span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${colors.bar} rounded-full`}
                            initial={{ width: 0 }}
                            animate={isInView ? { width: `${skill.level}%` } : {}}
                            transition={{
                              duration: 1.2,
                              delay: 0.5,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
