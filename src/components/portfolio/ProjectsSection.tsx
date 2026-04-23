"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ExternalLink, Github, Loader2 } from "lucide-react";
import TiltCard from "@/components/portfolio/TiltCard";
import { useLanguage } from "@/lib/i18n";

interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string | string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  featured?: boolean;
}

function parseTechStack(techStack: string | string[]): string[] {
  if (Array.isArray(techStack)) return techStack;
  return techStack.split(',').map(s => s.trim()).filter(Boolean);
}

export default function ProjectsSection() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultProjects: Project[] = [
    {
      id: "1",
      title: "E-Ticaret Platformu",
      description:
        "Gerçek zamanlı envanter yönetimi, güvenli ödemeler ve yönetici paneli ile tam özellikli bir e-ticaret platformu. Optimal performans ve kullanıcı deneyimi için modern web teknolojileri ile geliştirildi.",
      techStack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Stripe"],
      githubUrl: "https://github.com",
      liveUrl: "https://example.com",
      featured: true,
    },
    {
      id: "2",
      title: "Görev Yönetim Uygulaması",
      description:
        "Gerçek zamanlı güncellemeler, sürükle-bırak işlevselliği ve takım çalışma alanları ile işbirliğine dayalı görev yönetim uygulaması. Verimlilik ve sorunsuz takım çalışması için tasarlandı.",
      techStack: ["React", "Node.js", "Socket.io", "MongoDB", "Tailwind CSS"],
      githubUrl: "https://github.com",
      featured: true,
    },
    {
      id: "3",
      title: "Yapay Zeka Sohbet Asistanı",
      description:
        "Büyük dil modelleriyle desteklenen akıllı bir sohbet asistanı. Konuşma hafızası, kod vurgulama ve metin ve görsel girdiler için çoklu mod desteği sunuyor.",
      techStack: ["Next.js", "OpenAI", "Python", "FastAPI", "Redis"],
      githubUrl: "https://github.com",
      liveUrl: "https://example.com",
      featured: true,
    },
    {
      id: "4",
      title: "Portfolio Oluşturucu",
      description:
        "Basit bir yapılandırma dosyasından güzel, özelleştirilebilir geliştirici portföyleri oluşturan bir CLI aracı. Birden fazla tema ve dağıtım hedefini destekler.",
      techStack: ["TypeScript", "Node.js", "Handlebars", "SCSS"],
      githubUrl: "https://github.com",
      featured: false,
    },
    {
      id: "5",
      title: "Hava Durumu Paneli",
      description:
        "7 günlük tahminler, interaktif haritalar ve konum tabanlı uyarılar ile şık bir hava durumu paneli. Tüm cihazlarda yumuşak animasyonlar ve duyarlı tasarım sunar.",
      techStack: ["React", "OpenWeather API", "Chart.js", "Mapbox"],
      githubUrl: "https://github.com",
      liveUrl: "https://example.com",
      featured: false,
    },
    {
      id: "6",
      title: "Kod Parçacığı Yöneticisi",
      description:
        "Kod parçacıklarını düzenlemek, aramak ve paylaşmak için bir geliştirici aracı. Sözdizimi vurgulama, etiketleme ve cihazlar arası bulut senkronizasyonu sunar.",
      techStack: ["Next.js", "Prisma", "SQLite", "Monaco Editor"],
      githubUrl: "https://github.com",
      featured: false,
    },
  ];

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        } else {
          setProjects(defaultProjects);
        }
      })
      .catch(() => {
        setProjects(defaultProjects);
      })
      .finally(() => setLoading(false));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section
      id="projects"
      ref={ref}
      className="relative section-padding overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t("projects.title")}{" "}
            <span className="gradient-text">{t("projects.featured")}</span>
          </h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: 80 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-indigo-500 to-pink-500 mx-auto rounded-full"
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects.map((project) => (
              <motion.div key={project.id} variants={cardVariants}>
              <TiltCard className="group glass-card gradient-border overflow-hidden flex flex-col">
                {/* Card top gradient bar */}
                <div className="h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="p-6 flex flex-col flex-1">
                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-3 text-white/90 group-hover:text-white transition-colors">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-white/45 leading-relaxed mb-4 flex-1 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {parseTechStack(project.techStack).slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 text-[11px] rounded-full bg-white/5 border border-white/8 text-white/50 font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                    {parseTechStack(project.techStack).length > 4 && (
                      <span className="px-2.5 py-1 text-[11px] rounded-full bg-white/5 border border-white/8 text-white/30">
                        +{parseTechStack(project.techStack).length - 4}
                      </span>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-purple-400 transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>{t("projects.code")}</span>
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-cyan-400 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{t("projects.liveDemo")}</span>
                      </a>
                    )}
                  </div>
                </div>
              </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
