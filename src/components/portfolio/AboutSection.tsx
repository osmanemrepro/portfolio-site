"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Code2,
  Coffee,
  FolderGit2,
  GraduationCap,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function AboutSection() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { icon: FolderGit2, labelKey: "about.projects", value: "15+", color: "text-purple-400" },
    { icon: Coffee, labelKey: "about.yearsLearning", value: "3+", color: "text-cyan-400" },
    { icon: Code2, labelKey: "about.technologies", value: "20+", color: "text-pink-400" },
    { icon: Zap, labelKey: "about.passion", value: "∞", color: "text-amber-400" },
  ];

  return (
    <section
      id="about"
      ref={ref}
      className="relative section-padding overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t("about.title")}{" "}
            <span className="gradient-text">Me</span>
          </h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: 80 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full"
          />
        </motion.div>

        {/* About Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="glass-card gradient-border p-6 sm:p-10 md:p-12"
        >
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Text content */}
            <div>
              <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <GraduationCap className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold">{t("about.whoAmI")}</h3>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="text-white/60 leading-relaxed text-base sm:text-lg mb-4"
              >
                {t("about.p1")}
              </motion.p>
              <motion.p
                variants={itemVariants}
                className="text-white/50 leading-relaxed text-sm sm:text-base"
              >
                {t("about.p2")}
              </motion.p>

              <motion.div variants={itemVariants} className="mt-6">
                <div className="flex flex-wrap gap-2">
                  {["React", "Next.js", "TypeScript", "Node.js", "Python"].map(
                    (tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-xs rounded-full bg-white/5 border border-white/10 text-white/50"
                      >
                        {tech}
                      </span>
                    )
                  )}
                </div>
              </motion.div>
            </div>

            {/* Stats Grid */}
            <motion.div variants={containerVariants} className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <motion.div
                  key={stat.labelKey}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -2 }}
                  className="glass-card p-5 text-center group hover:border-purple-500/20 transition-all duration-300"
                >
                  <stat.icon
                    className={`w-7 h-7 mx-auto mb-3 ${stat.color} group-hover:scale-110 transition-transform duration-300`}
                  />
                  <div className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-white/40">{t(stat.labelKey)}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
