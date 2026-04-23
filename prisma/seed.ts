import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await db.adminUser.upsert({
    where: { email: 'admin@osem.dev' },
    update: {},
    create: {
      email: 'admin@osem.dev',
      password: hashedPassword,
      name: 'Osman Emre',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create skills
  const skills = [
    { name: 'Python', category: 'Languages', level: 90, icon: '🐍', order: 1 },
    { name: 'JavaScript', category: 'Languages', level: 85, icon: '⚡', order: 2 },
    { name: 'TypeScript', category: 'Languages', level: 80, icon: '📘', order: 3 },
    { name: 'Java', category: 'Languages', level: 60, icon: '☕', order: 4 },
    { name: 'PHP', category: 'Languages', level: 55, icon: '🐘', order: 5 },
    { name: 'C#', category: 'Languages', level: 65, icon: '🎯', order: 6 },
    { name: 'CSS', category: 'Design', level: 80, icon: '🎨', order: 7 },
    { name: 'React', category: 'Frontend', level: 75, icon: '⚛️', order: 8 },
    { name: 'Next.js', category: 'Frontend', level: 70, icon: '▲', order: 9 },
    { name: 'Node.js', category: 'Backend', level: 75, icon: '🟢', order: 10 },
    { name: 'Docker', category: 'DevOps', level: 60, icon: '🐳', order: 11 },
    { name: 'MongoDB', category: 'Database', level: 70, icon: '🍃', order: 12 },
  ];

  for (const skill of skills) {
    await db.skill.upsert({
      where: { id: `${skill.name.toLowerCase()}-skill` },
      update: {},
      create: { id: `${skill.name.toLowerCase()}-skill`, ...skill },
    });
  }
  console.log(`✅ ${skills.length} skills created`);

  // Create projects
  const projects = [
    {
      title: 'Darkrise Network',
      description: 'A large-scale Minecraft server network featuring custom plugins, anti-cheat systems, and an optimized infrastructure handling thousands of concurrent players. Built with Java and custom server-side modifications.',
      techStack: 'Java, Spigot, MySQL, Redis, Docker',
      imageUrl: '',
      liveUrl: '',
      githubUrl: 'https://github.com/osemdev',
      featured: true,
      order: 1,
    },
    {
      title: 'Discord Bot Suite',
      description: 'A comprehensive set of Discord bots providing automation, moderation, music playback, and server management capabilities. Features include advanced permission systems, automated moderation, and custom command frameworks.',
      techStack: 'Python, Discord.py, MongoDB, Redis',
      imageUrl: '',
      liveUrl: '',
      githubUrl: 'https://github.com/osemdev',
      featured: true,
      order: 2,
    },
    {
      title: 'Telegram Stock Bot',
      description: 'Automated trading assistant on Telegram that provides real-time stock data, price alerts, portfolio tracking, and market analysis. Integrates with multiple financial APIs for comprehensive market coverage.',
      techStack: 'Python, Telegram API, Financial APIs, PostgreSQL',
      imageUrl: '',
      liveUrl: '',
      githubUrl: 'https://github.com/osemdev',
      featured: true,
      order: 3,
    },
    {
      title: 'WhatsApp Automation',
      description: 'Enterprise-grade WhatsApp automation system for business communication, customer support, and marketing campaigns. Features include chatbot integration, bulk messaging, and analytics dashboards.',
      techStack: 'Node.js, WhatsApp Business API, MongoDB, Docker',
      imageUrl: '',
      liveUrl: '',
      githubUrl: '',
      featured: false,
      order: 4,
    },
    {
      title: 'AI Automation Platform',
      description: 'A versatile AI automation platform integrating OpenAI and custom ML models for content generation, data analysis, and workflow automation. Includes a web dashboard for managing automated pipelines.',
      techStack: 'Python, OpenAI API, FastAPI, React, PostgreSQL',
      imageUrl: '',
      liveUrl: '',
      githubUrl: '',
      featured: false,
      order: 5,
    },
  ];

  for (const project of projects) {
    await db.project.upsert({
      where: { id: `${project.title.toLowerCase().replace(/\s+/g, '-')}-project` },
      update: {},
      create: { id: `${project.title.toLowerCase().replace(/\s+/g, '-')}-project`, ...project },
    });
  }
  console.log(`✅ ${projects.length} projects created`);

  // Create experience
  const experiences = [
    {
      title: 'Founder & Lead Developer',
      company: 'Osem Digital',
      description: 'Founded a digital solutions company specializing in web development, automation systems, and AI integration. Leading a team of developers to deliver cutting-edge solutions for clients across various industries.',
      startDate: '2023-01',
      endDate: '',
      current: true,
      order: 1,
    },
    {
      title: 'Server Developer',
      company: 'Darkrise Network',
      description: 'Developed and maintained a large-scale Minecraft server network. Created custom plugins, optimized server performance, and implemented anti-cheat systems. Managed infrastructure for thousands of concurrent players.',
      startDate: '2021-06',
      endDate: '2023-12',
      current: false,
      order: 2,
    },
    {
      title: 'Freelance Developer',
      company: 'Self-Employed',
      description: 'Worked on various freelance projects including Discord bots, Telegram bots, web applications, and automation scripts. Delivered high-quality solutions for clients worldwide.',
      startDate: '2020-01',
      endDate: '2023-12',
      current: false,
      order: 3,
    },
  ];

  for (const exp of experiences) {
    await db.experience.upsert({
      where: { id: `${exp.company.toLowerCase().replace(/\s+/g, '-')}-exp` },
      update: {},
      create: { id: `${exp.company.toLowerCase().replace(/\s+/g, '-')}-exp`, ...exp },
    });
  }
  console.log(`✅ ${experiences.length} experiences created`);

  // Create social links
  const socialLinks = [
    { platform: 'GitHub', url: 'https://github.com/osemdev', icon: 'github', order: 1 },
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/osemdev', icon: 'linkedin', order: 2 },
    { platform: 'Instagram', url: 'https://instagram.com/osemdev', icon: 'instagram', order: 3 },
    { platform: 'Discord', url: 'https://discord.gg/osemdev', icon: 'discord', order: 4 },
    { platform: 'Twitter', url: 'https://twitter.com/osemdev', icon: 'twitter', order: 5 },
  ];

  for (const link of socialLinks) {
    await db.socialLink.upsert({
      where: { id: `${link.platform.toLowerCase()}-link` },
      update: {},
      create: { id: `${link.platform.toLowerCase()}-link`, ...link },
    });
  }
  console.log(`✅ ${socialLinks.length} social links created`);

  // Create initial activity status
  const activity = await db.activityStatus.upsert({
    where: { id: 'default-activity' },
    update: {},
    create: {
      id: 'default-activity',
      status: 'coding',
      title: 'listener.py',
      description: 'Discord bot için audio listener modülü yazıyorum',
      language: 'Python',
      isLive: true,
      startedAt: new Date(),
      visible: true,
    },
  });
  console.log('✅ Activity status created:', activity.title);

  // Create site settings
  const settings = [
    { key: 'heroVisible', value: 'true' },
    { key: 'aboutVisible', value: 'true' },
    { key: 'skillsVisible', value: 'true' },
    { key: 'projectsVisible', value: 'true' },
    { key: 'experienceVisible', value: 'true' },
    { key: 'contactVisible', value: 'true' },
  ];

  for (const setting of settings) {
    await db.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log(`✅ ${settings.length} settings created`);

  console.log('🎉 Seed completed successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
