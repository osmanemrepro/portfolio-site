"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Send, Loader2, Mail, User, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { useLanguage } from "@/lib/i18n";

export default function ContactSection() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: t("contact.missingFields"),
        description: t("contact.fillAll"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast({
          title: t("contact.sent"),
          description: t("contact.sentDesc"),
        });
        setFormData({ name: "", email: "", message: "" });
      } else {
        throw new Error("Failed to send");
      }
    } catch {
      toast({
        title: t("contact.failed"),
        description: t("contact.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="relative section-padding overflow-hidden"
    >
      {/* Background accents */}
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t("contact.title")}{" "}
            <span className="gradient-text">{t("contact.touch")}</span>
          </h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: 80 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full"
          />
          <p className="mt-4 text-white/40 text-base max-w-md mx-auto">
            {t("contact.description")}
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          onSubmit={handleSubmit}
          className="glass-card gradient-border p-6 sm:p-8 md:p-10"
        >
          {/* Name */}
          <motion.div variants={itemVariants} className="mb-6">
            <label
              htmlFor="name"
              className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2"
            >
              <User className="w-4 h-4 text-purple-400" />
              {t("contact.name")}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("contact.namePlaceholder")}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all duration-300"
              required
            />
          </motion.div>

          {/* Email */}
          <motion.div variants={itemVariants} className="mb-6">
            <label
              htmlFor="email"
              className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2"
            >
              <Mail className="w-4 h-4 text-cyan-400" />
              {t("contact.email")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("contact.emailPlaceholder")}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all duration-300"
              required
            />
          </motion.div>

          {/* Message */}
          <motion.div variants={itemVariants} className="mb-8">
            <label
              htmlFor="message"
              className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2"
            >
              <MessageSquare className="w-4 h-4 text-pink-400" />
              {t("contact.message")}
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={t("contact.messagePlaceholder")}
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all duration-300 resize-none"
              required
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("contact.sending")}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t("contact.send")}
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>

    </section>
  );
}
