"use client";
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

type Lang = "tr" | "en";

interface I18nContextType { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string; }

const translations: Record<Lang, Record<string, string>> = {
  tr: {
    "nav.about": "Hakkımda", "nav.skills": "Yetenekler", "nav.projects": "Projeler",
    "nav.experience": "Deneyim", "nav.contact": "İletişim",
    "hero.available": "Fırsatlara açığım", "hero.title": "Merhaba, ben",
    "hero.subtitle": "Öğrenmeye Odaklı", "hero.role": "Yazılım Geliştirici",
    "hero.description": "Modern, performanslı ve estetik web deneyimleri tutku ve sürekli öğrenme ile inşa ediyorum. Fikirleri zarif dijital çözümlere dönüştürüyorum.",
    "hero.viewWork": "Çalışmalarım", "hero.getInTouch": "İletişime Geç", "hero.scroll": "Kaydır",
    "about.title": "Hakkımda", "about.whoAmI": "Ben Kimim",
    "about.p1": "Merak ve anlamlı çözümler üretme arzusuyla teknoloji yolculuğuma devam eden tutkulu bir yazılım geliştiricisiyim. Büyüme odaklı yaklaşımım ve öğrenme tutkum beni her gün daha iyiye taşıyor.",
    "about.p2": "Modern web teknolojilerinde uzmanlaşıyorum ve yeni framework'leri, araçları ve en iyi uygulamaları keşfetmeyi seviyorum. Her proje, sınırları zorlamak ve yeteneklerimi geliştirmek için bir fırsat.",
    "about.projects": "Projeler", "about.yearsLearning": "Yıl Öğrenme",
    "about.technologies": "Teknoloji", "about.passion": "Tutku Seviyesi",
    "skills.title": "Yetenekler &", "skills.technologies": "Teknolojiler",
    "skills.languages": "Diller", "skills.frontend": "Ön Uç",
    "skills.backend": "Arka Uç", "skills.tools": "Araçlar",
    "skills.devops": "DevOps", "skills.other": "Diğer",
    "projects.title": "Öne Çıkan", "projects.featured": "Projeler",
    "projects.code": "Kod", "projects.liveDemo": "Canlı Demo",
    "experience.title": "İş", "experience.work": "Deneyim", "experience.current": "Devam Ediyor",
    "experience.present": "Devam Ediyor",
    "contact.title": "İletişime", "contact.touch": "Geç",
    "contact.description": "Aklında bir proje mi var yoksa sadece merhaba mı demek istiyorsun? Bana ulaşmaktan çekinme!",
    "contact.name": "İsim", "contact.email": "E-posta", "contact.message": "Mesaj",
    "contact.send": "Mesaj Gönder", "contact.sending": "Gönderiliyor...",
    "contact.namePlaceholder": "Adın",
    "contact.emailPlaceholder": "eposta@adres.com",
    "contact.messagePlaceholder": "Projen hakkında anlat veya sadece merhaba de...",
    "contact.sent": "Mesajınız gönderildi!",
    "contact.sentDesc": "Ulaştığınız için teşekkürler. En kısa sürede size geri dönüş yapacağım.",
    "contact.missingFields": "Boş alanlar",
    "contact.fillAll": "Lütfen tüm alanları doldurun.",
    "contact.failed": "Gönderilemedi",
    "contact.tryAgain": "Bir şeyler ters gitti. Lütfen daha sonra tekrar deneyin.",
    "footer.builtWith": "İle yapıldı", "footer.rights": "Tüm hakları saklıdır",
    "theme.dark": "Karanlık", "theme.light": "Aydınlık", "theme.auto": "Otomatik",
    "widget.weather": "Hava Durumu", "widget.clock": "Saat",
    "widget.visitors": "Ziyaretçi", "widget.visitorCount": "kişi ziyaret etti",
    "cmd.home": "Ana Sayfa", "cmd.homeDesc": "Hero bölümüne git",
    "cmd.aboutDesc": "Hakkımda bölümüne git",
    "cmd.skillsDesc": "Yetenekler bölümüne git",
    "cmd.projectsDesc": "Projeler bölümüne git",
    "cmd.expDesc": "Deneyim bölümüne git",
    "cmd.contactDesc": "İletişim bölümüne git",
    "cmd.themeDarkDesc": "Karanlık temaya geç",
    "cmd.themeLightDesc": "Aydınlık temaya geç",
    "cmd.themeAutoDesc": "Otomatik temaya geç",
    "cmd.githubDesc": "GitHub profiline git",
    "cmd.linkedinDesc": "LinkedIn profiline git",
    "cmd.twitterDesc": "Twitter profiline git",
    "cmd.category.nav": "Sayfaya Git", "cmd.category.theme": "Tema", "cmd.category.links": "Sosyal Medya",
    "cmd.searchPlaceholder": "Bir komut veya sayfa ara...",
    "cmd.noResults": "Sonuç bulunamadı",
    "cmd.navigate": "Gezin", "cmd.select": "Seç", "cmd.close": "Kapat",
    "globe.label": "Global Ağ",
  },
  en: {
    "nav.about": "About", "nav.skills": "Skills", "nav.projects": "Projects",
    "nav.experience": "Experience", "nav.contact": "Contact",
    "hero.available": "Available for opportunities", "hero.title": "Hey, I'm",
    "hero.subtitle": "Learning-Focused", "hero.role": "Software Developer",
    "hero.description": "Building modern, performant, and beautiful web experiences with passion and continuous learning.",
    "hero.viewWork": "View My Work", "hero.getInTouch": "Get In Touch", "hero.scroll": "Scroll",
    "about.title": "About", "about.whoAmI": "Who I Am",
    "about.p1": "I'm a passionate software developer with a relentless focus on learning and growth.",
    "about.p2": "I specialize in modern web technologies and love exploring new frameworks, tools, and best practices.",
    "about.projects": "Projects", "about.yearsLearning": "Years Learning",
    "about.technologies": "Technologies", "about.passion": "Passion Level",
    "skills.title": "Skills &", "skills.technologies": "Technologies",
    "skills.languages": "Languages", "skills.frontend": "Frontend",
    "skills.backend": "Backend", "skills.tools": "Tools",
    "skills.devops": "DevOps", "skills.other": "Other",
    "projects.title": "Featured", "projects.featured": "Projects",
    "projects.code": "Code", "projects.liveDemo": "Live Demo",
    "experience.title": "Work", "experience.work": "Experience", "experience.current": "Current",
    "experience.present": "Present",
    "contact.title": "Get In", "contact.touch": "Touch",
    "contact.description": "Have a project in mind or just want to say hello? Feel free to reach out!",
    "contact.name": "Name", "contact.email": "Email", "contact.message": "Message",
    "contact.send": "Send Message", "contact.sending": "Sending...",
    "contact.namePlaceholder": "Your name",
    "contact.emailPlaceholder": "your@email.com",
    "contact.messagePlaceholder": "Tell me about your project or just say hi...",
    "contact.sent": "Message sent!",
    "contact.sentDesc": "Thank you for reaching out. I'll get back to you soon.",
    "contact.missingFields": "Missing fields",
    "contact.fillAll": "Please fill in all fields.",
    "contact.failed": "Failed to send",
    "contact.tryAgain": "Something went wrong. Please try again later.",
    "footer.builtWith": "Built with", "footer.rights": "All rights reserved",
    "theme.dark": "Dark", "theme.light": "Light", "theme.auto": "Auto",
    "widget.weather": "Weather", "widget.clock": "Clock",
    "widget.visitors": "Visitors", "widget.visitorCount": "visitors",
    "cmd.home": "Home", "cmd.homeDesc": "Go to hero section",
    "cmd.aboutDesc": "Go to about section",
    "cmd.skillsDesc": "Go to skills section",
    "cmd.projectsDesc": "Go to projects section",
    "cmd.expDesc": "Go to experience section",
    "cmd.contactDesc": "Go to contact section",
    "cmd.themeDarkDesc": "Switch to dark theme",
    "cmd.themeLightDesc": "Switch to light theme",
    "cmd.themeAutoDesc": "Switch to auto theme",
    "cmd.githubDesc": "Go to GitHub profile",
    "cmd.linkedinDesc": "Go to LinkedIn profile",
    "cmd.twitterDesc": "Go to Twitter profile",
    "cmd.category.nav": "Go to Page", "cmd.category.theme": "Theme", "cmd.category.links": "Social Media",
    "cmd.searchPlaceholder": "Type a command or search...",
    "cmd.noResults": "No results found",
    "cmd.navigate": "Navigate", "cmd.select": "Select", "cmd.close": "Close",
    "globe.label": "Global Network",
  },
};

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "tr";
  const saved = localStorage.getItem("lang") as Lang | null;
  if (saved && (saved === "tr" || saved === "en")) return saved;
  return "tr";
}

const I18nContext = createContext<I18nContextType>({ lang: "tr", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const syncedRef = useRef(false);
  useEffect(() => { if (!syncedRef.current) { syncedRef.current = true; if (!localStorage.getItem("lang")) localStorage.setItem("lang", "tr"); } }, []);
  const handleSetLang = (l: Lang) => { setLang(l); localStorage.setItem("lang", l); };
  const t = (key: string) => translations[lang]?.[key] || translations["en"]?.[key] || key;
  return <I18nContext.Provider value={{ lang, setLang: handleSetLang, t }}>{children}</I18nContext.Provider>;
}

export function useLanguage() { return useContext(I18nContext); }
export type { Lang };
