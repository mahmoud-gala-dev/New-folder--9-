/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Layers, 
  Globe, 
  Shield, 
  Zap, 
  GitBranch, 
  Copy, 
  Check, 
  RefreshCw,
  Terminal,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Languages,
  Info,
  Plus,
  X,
  Search,
  Filter,
  Calendar,
  Database,
  Server,
  Cpu,
  CreditCard,
  Mail,
  Phone,
  Map,
  Flame,
  Lock,
  MessageSquare,
  MessageCircle,
  Cloud,
  Box,
  Layout,
  Activity,
  Smartphone,
  Code,
  Monitor,
  Brain,
  Chrome,
  Download,
  Loader2,
  Save,
  Upload,
  Beaker
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { GoogleGenAI, Type } from "@google/genai";
import { auth, db } from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import { TECH_ICONS } from './constants';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

type ProjectInfo = {
  projectName: string;
  projectDescription: string;
  projectType: string;
  targetUsers: string;
  techStack: string[];
  systemArchitecture: string;
  mainModules: string;
  databaseType: string[];
  externalIntegrations: string[];
  deploymentEnvironment: string[];
  securityRequirements: string;
  performanceRequirements: string[];
  methodology: string;
  tone: string;
  detailLevel: string;
  includedSections: string[];
};

type GeneratedFile = {
  name: string;
  content: string;
  lastModified: string;
};

type SearchResult = {
  fileName: string;
  matches: {
    line: number;
    text: string;
    preview: string;
  }[];
};

const initialInfo: ProjectInfo = {
  projectName: '',
  projectDescription: '',
  projectType: 'Web app',
  targetUsers: '',
  techStack: [],
  systemArchitecture: 'Monolith',
  mainModules: '',
  databaseType: [],
  externalIntegrations: [],
  deploymentEnvironment: [],
  securityRequirements: '',
  performanceRequirements: [],
  methodology: 'Agile',
  tone: 'Professional',
  detailLevel: 'Standard',
  includedSections: ['PRD.md', 'SRS.md', 'ARCHITECTURE.md', 'API_SPEC.md', 'DATABASE_SCHEMA.md', 'CODING_RULES.md', 'ROADMAP.md', 'RUNBOOK.md', 'AI_CONTEXT.md'],
};

const PREDEFINED_OPTIONS = {
  techStack: [
    { name: 'React', icon: () => TECH_ICONS.react },
    { name: 'Vue', icon: () => TECH_ICONS.vue },
    { name: 'TypeScript', icon: () => TECH_ICONS.typescript },
    { name: 'Node.js', icon: () => TECH_ICONS.nodejs },
    { name: 'Laravel', icon: () => TECH_ICONS.laravel },
    { name: 'Express', icon: () => TECH_ICONS.express },
    { name: 'NestJS', icon: () => TECH_ICONS.nestjs },
    { name: 'Flutter', icon: () => TECH_ICONS.flutter },
    { name: 'PHP', icon: () => TECH_ICONS.php },
    { name: 'Python', icon: () => TECH_ICONS.python },
    { name: 'Django', icon: () => TECH_ICONS.django },
    { name: 'FastAPI', icon: () => TECH_ICONS.fastapi },
    { name: 'Gutenberg', icon: () => TECH_ICONS.gutenberg },
    { name: 'Chrome-Extension', icon: () => TECH_ICONS.chrome },
  ],
  databaseType: [
    { name: 'PostgreSQL', icon: Database },
    { name: 'MongoDB', icon: Database },
    { name: 'MySQL', icon: Database },
    { name: 'Redis', icon: Zap },
    { name: 'SQLite', icon: Database },
    { name: 'Firebase', icon: Flame },
  ],
  externalIntegrations: [
    { name: 'Stripe', icon: CreditCard },
    { name: 'AWS S3', icon: Cloud },
    { name: 'SendGrid', icon: Mail },
    { name: 'Twilio', icon: Phone },
    { name: 'Google Maps', icon: Map },
    { name: 'Auth0', icon: Lock },
    { name: 'Slack', icon: MessageSquare },
    { name: 'PayPal', icon: CreditCard },
    { name: 'Algolia', icon: Zap },
    { name: 'Cloudinary', icon: Cloud },
  ],
  deploymentEnvironment: [
    { name: 'AWS', icon: Cloud },
    { name: 'Vercel', icon: Zap },
    { name: 'Docker', icon: Box },
    { name: 'Google Cloud', icon: Cloud },
    { name: 'Azure', icon: Cloud },
    { name: 'Kubernetes', icon: Layers },
    { name: 'Netlify', icon: Zap },
    { name: 'Heroku', icon: Box },
    { name: 'DigitalOcean', icon: Cloud },
    { name: 'On-premise', icon: Server },
  ],
  performanceRequirements: [
    { name: '< 200ms latency', icon: Activity },
    { name: '10k concurrent users', icon: Zap },
    { name: '99.9% uptime', icon: Shield },
    { name: 'Horizontal scaling', icon: Layers },
    { name: 'CDN caching', icon: Globe },
    { name: 'SSR Optimization', icon: Zap },
    { name: 'Image Compression', icon: Cloud },
  ]
};

const PROMPT_TEMPLATES = {
  full: {
    id: 'full',
    name: 'Full Suite',
    icon: Layers,
    description: 'Complete documentation for the entire project lifecycle.',
    files: ['PRD.md', 'SRS.md', 'ARCHITECTURE.md', 'API_SPEC.md', 'DATABASE_SCHEMA.md', 'CODING_RULES.md', 'ROADMAP.md', 'RUNBOOK.md', 'AI_CONTEXT.md'],
    defaultValues: {
      projectName: 'Nexus Cloud Platform',
      projectDescription: 'A high-performance cloud management platform for multi-cloud environments.',
      projectType: 'Web app',
      targetUsers: 'DevOps Engineers, IT Managers',
      techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      systemArchitecture: 'Microservices',
      mainModules: 'Dashboard, Billing, Instance Management, IAM',
      databaseType: ['PostgreSQL', 'Redis'],
      externalIntegrations: ['AWS S3', 'Stripe', 'Slack'],
      deploymentEnvironment: ['AWS', 'Docker', 'Kubernetes'],
      securityRequirements: 'OAuth2, RBAC, Data Encryption at Rest',
      performanceRequirements: ['< 200ms latency', '10k concurrent users', '99.9% uptime'],
      methodology: 'Scrum',
      tone: 'Professional',
      detailLevel: 'Exhaustive',
      includedSections: ['PRD.md', 'SRS.md', 'ARCHITECTURE.md', 'API_SPEC.md', 'DATABASE_SCHEMA.md', 'CODING_RULES.md', 'ROADMAP.md', 'RUNBOOK.md', 'AI_CONTEXT.md'],
    }
  },
  product: {
    id: 'product',
    name: 'Product & Requirements',
    icon: FileText,
    description: 'Focused on user needs, business goals, and functional specs.',
    files: ['PRD.md', 'SRS.md', 'ROADMAP.md'],
    defaultValues: {
      projectName: 'SocialConnect Mobile',
      projectDescription: 'A privacy-focused social networking app for local communities.',
      projectType: 'Mobile app',
      targetUsers: 'Local community members, Event organizers',
      techStack: ['Flutter', 'Firebase', 'TypeScript'],
      systemArchitecture: 'Serverless',
      mainModules: 'Feed, Messaging, Events, Profile',
      databaseType: ['Firebase'],
      externalIntegrations: ['Google Maps', 'Auth0'],
      deploymentEnvironment: ['Google Cloud'],
      securityRequirements: 'End-to-end encryption, GDPR compliance',
      performanceRequirements: ['Offline support', 'Image Compression'],
      methodology: 'Agile',
      tone: 'Conversational',
      detailLevel: 'Standard',
      includedSections: ['PRD.md', 'SRS.md', 'ROADMAP.md'],
    }
  },
  architecture: {
    id: 'architecture',
    name: 'Technical Architecture',
    icon: Cpu,
    description: 'Deep dive into system design, data flow, and API specs.',
    files: ['ARCHITECTURE.md', 'API_SPEC.md', 'DATABASE_SCHEMA.md', 'CODING_RULES.md'],
    defaultValues: {
      projectName: 'FinTrack API',
      projectDescription: 'A robust financial transaction processing and tracking API.',
      projectType: 'API',
      targetUsers: 'Financial Institutions, Fintech Developers',
      techStack: ['NestJS', 'TypeScript', 'PostgreSQL', 'Redis'],
      systemArchitecture: 'Microservices',
      mainModules: 'Transactions, Accounts, Audit Log, Webhooks',
      databaseType: ['PostgreSQL', 'Redis'],
      externalIntegrations: ['Stripe', 'PayPal'],
      deploymentEnvironment: ['Docker', 'Kubernetes'],
      securityRequirements: 'PCI-DSS, JWT, API Key rotation',
      performanceRequirements: ['< 100ms latency', 'Horizontal scaling'],
      methodology: 'Kanban',
      tone: 'Technical',
      detailLevel: 'Exhaustive',
      includedSections: ['ARCHITECTURE.md', 'API_SPEC.md', 'DATABASE_SCHEMA.md', 'CODING_RULES.md'],
    }
  }
};

const translations = {
  en: {
    title: 'DocuPrompt Architect',
    subtitle: 'Prompt Engineering System',
    stage1: 'Stage 1: Collection',
    stage2: 'Stage 2: Generation',
    headerTitle: 'Project Information',
    headerDesc: 'Provide the architectural details of your project. This data will be used to construct a high-fidelity prompt for generating professional documentation.',
    coreIdentity: 'Core Identity',
    techArch: 'Technical Architecture',
    integrationsOps: 'Integrations & Ops',
    requirements: 'Requirements',
    generateBtn: 'Generate Prompt',
    editBtn: 'Edit Info',
    copyBtn: 'Copy Prompt',
    downloadZipBtn: 'Download ZIP',
    generateDocsBtn: 'Generate Docs',
    viewPrompt: 'View Prompt',
    viewDocs: 'View Docs',
    searchPlaceholder: 'Search across all files...',
    fileTypeFilter: 'File Type',
    moduleFilter: 'Module',
    all: 'All',
    noResults: 'No results found for your search.',
    resultsFound: 'results found in',
    files: 'files',
    lastModified: 'Last modified',
    exportConfigBtn: 'Export JSON',
    importConfigBtn: 'Import JSON',
    saveBrowserBtn: 'Save to Browser',
    newProjectBtn: 'New Project',
    projectsTitle: 'My Projects',
    loginBtn: 'Sign In',
    logoutBtn: 'Sign Out',
    deleteProjectBtn: 'Delete Project',
    syncing: 'Syncing...',
    synced: 'Cloud Synced',
    loadExampleBtn: 'Load Example',
    templatesTitle: 'Prompt Templates',
    templatesDesc: 'Select a template to pre-fill the form with industry-standard examples.',
    advancedOptions: 'Advanced Customization',
    advancedOptionsDesc: 'Fine-tune the tone, detail, and specific sections of your documentation.',
    generating: 'Generating Files...',
    copied: 'Copied!',
    finalTitle: 'Final AI Prompt',
    finalDesc: 'Copy this prompt into your preferred AI system (Gemini, GPT-4, etc.) to generate the documentation.',
    fields: {
      projectName: { 
        label: 'Project Name', 
        required: true,
        desc: 'The official name of your software project.', 
        slang: "What's the name of this masterpiece? Make it catchy so people remember it!",
        placeholder: 'e.g. Nexus Cloud Platform' 
      },
      projectDescription: { 
        label: 'Project Description', 
        required: true,
        desc: 'A high-level summary of what the system does and its value proposition.', 
        slang: "What's the big idea? Explain it like I'm five – what problem are you solving and why does it matter?",
        placeholder: 'What does this system do?' 
      },
      projectType: { 
        label: 'Project Type', 
        required: true,
        desc: 'The platform or nature of the application.', 
        slang: "Is it a website, a mobile app, or some fancy AI brain? Tell us where this thing is gonna live.",
        options: [
          { name: 'Web app', icon: Globe },
          { name: 'Mobile app', icon: Smartphone },
          { name: 'API', icon: Code },
          { name: 'Desktop', icon: Monitor },
          { name: 'AI system', icon: Brain }
        ] 
      },
      targetUsers: { 
        label: 'Target Users', 
        required: true,
        desc: 'Who will be using this software? (e.g., End users, Admins, Developers).', 
        slang: "Who is this for? Normal people, tech wizards, or the big bosses who just want to see charts?",
        placeholder: 'e.g. DevOps Engineers' 
      },
      techStack: { 
        label: 'Tech Stack', 
        required: true,
        desc: 'Languages, frameworks, and libraries used.', 
        slang: "What's under the hood? Pick your favorite tools and languages to build this thing from the ground up.",
        placeholder: 'React, Node.js, TypeScript...' 
      },
      systemArchitecture: { 
        label: 'Architecture', 
        required: true,
        desc: 'The structural pattern of the system.', 
        slang: "How is it all wired together? One big solid block or a bunch of small, smart services talking to each other?",
        options: ['Monolith', 'Microservices', 'Serverless'] 
      },
      databaseType: { 
        label: 'Database Type', 
        required: false,
        desc: 'Primary data storage systems.', 
        slang: "Where are you stashing the data? Think of it as the app's long-term memory where everything is kept safe.",
        placeholder: 'PostgreSQL, MongoDB...' 
      },
      mainModules: { 
        label: 'Main Modules', 
        required: true,
        desc: 'Core functional areas of the application.', 
        slang: "What are the main building blocks? Like the login system, the shopping cart, or the admin dashboard.",
        placeholder: 'Auth, Billing, Dashboard...' 
      },
      externalIntegrations: { 
        label: 'External Integrations', 
        required: false,
        desc: 'Third-party services and APIs.', 
        slang: "Who else are we talking to? Like Stripe for the cash, AWS for the heavy lifting, or Slack for notifications.",
        placeholder: 'Stripe, SendGrid, AWS S3...' 
      },
      deploymentEnvironment: { 
        label: 'Deployment Environment', 
        required: false,
        desc: 'Where the app is hosted and how it is deployed.', 
        slang: "Where's this thing gonna live on the internet? AWS, Vercel, or maybe a Docker container floating in the cloud?",
        placeholder: 'AWS, Azure, On-premise...' 
      },
      methodology: { 
        label: 'Methodology', 
        required: true,
        desc: 'The development process followed by the team.', 
        slang: "How does the team move? Are we fast and flexible like Agile, or more structured and planned out?",
        options: ['Agile', 'Scrum', 'Kanban'] 
      },
      tone: {
        label: 'Documentation Tone',
        required: true,
        desc: 'The writing style of the documentation.',
        slang: 'How should it sound? Like a serious professor or a helpful teammate?',
        options: ['Professional', 'Technical', 'Conversational', 'Academic']
      },
      detailLevel: {
        label: 'Detail Level',
        required: true,
        desc: 'How much depth should the documentation have?',
        slang: 'Just the basics or every single tiny detail?',
        options: ['Concise', 'Standard', 'Exhaustive']
      },
      includedSections: {
        label: 'Included Sections',
        required: true,
        desc: 'Select which documentation files to generate.',
        slang: 'Which parts of the docs do you actually need right now?',
        options: [
          'PRD.md', 'SRS.md', 'ARCHITECTURE.md', 'API_SPEC.md', 
          'DATABASE_SCHEMA.md', 'CODING_RULES.md', 'ROADMAP.md', 
          'RUNBOOK.md', 'AI_CONTEXT.md'
        ]
      },
      securityRequirements: { 
        label: 'Security Requirements', 
        required: false,
        desc: 'Specific security standards or features needed.', 
        slang: "How do we keep the hackers away? Think of it as the locks, alarms, and secret codes for your app.",
        placeholder: 'OAuth2, Encryption at rest...' 
      },
      performanceRequirements: { 
        label: 'Performance Requirements', 
        required: false,
        desc: 'Speed, scalability, and availability targets.', 
        slang: "How fast and strong should it be? We want it snappy, smooth, and able to handle a massive crowd without lagging!",
        placeholder: '< 200ms latency, 10k concurrent users...' 
      },
    },
    features: [
      { title: 'High Precision', desc: 'Tailored specifically to your tech stack and architecture decisions.' },
      { title: 'Iterative Design', desc: 'Use the "Edit Info" button to refine the context and regenerate the prompt.' },
      { title: 'Standardized', desc: 'Follows PRD, SRS, and ADR standards used by top engineering teams.' }
    ]
  },
  ar: {
    title: 'مهندس وثائق الذكاء الاصطناعي',
    subtitle: 'نظام هندسة الأوامر',
    stage1: 'المرحلة 1: جمع المعلومات',
    stage2: 'المرحلة 2: توليد الأمر',
    headerTitle: 'معلومات المشروع',
    headerDesc: 'قدم التفاصيل المعمارية لمشروعك. سيتم استخدام هذه البيانات لبناء أمر عالي الدقة لتوليد وثائق احترافية.',
    coreIdentity: 'الهوية الأساسية',
    techArch: 'المعمارية التقنية',
    integrationsOps: 'التكاملات والعمليات',
    requirements: 'المتطلبات',
    generateBtn: 'توليد الأمر',
    editBtn: 'تعديل المعلومات',
    copyBtn: 'نسخ الأمر',
    downloadZipBtn: 'تحميل ZIP',
    generateDocsBtn: 'توليد المستندات',
    viewPrompt: 'عرض الأمر',
    viewDocs: 'عرض المستندات',
    searchPlaceholder: 'البحث في جميع الملفات...',
    fileTypeFilter: 'نوع الملف',
    moduleFilter: 'الوحدة',
    all: 'الكل',
    noResults: 'لم يتم العثور على نتائج لبحثك.',
    resultsFound: 'نتائج وجدت في',
    files: 'ملفات',
    lastModified: 'آخر تعديل',
    exportConfigBtn: 'تصدير JSON',
    importConfigBtn: 'استيراد JSON',
    saveBrowserBtn: 'حفظ في المتصفح',
    newProjectBtn: 'مشروع جديد',
    projectsTitle: 'مشاريعي',
    loginBtn: 'تسجيل الدخول',
    logoutBtn: 'تسجيل الخروج',
    deleteProjectBtn: 'حذف المشروع',
    syncing: 'جاري المزامنة...',
    synced: 'تمت المزامنة سحابياً',
    loadExampleBtn: 'تحميل مثال',
    templatesTitle: 'قوالب الأوامر',
    templatesDesc: 'اختر قالباً لملء النموذج بأمثلة قياسية في الصناعة.',
    advancedOptions: 'تخصيص متقدم',
    advancedOptionsDesc: 'قم بضبط النبرة، ومستوى التفاصيل، والأقسام المحددة لوثائقك.',
    generating: 'جاري التوليد...',
    copied: 'تم النسخ!',
    finalTitle: 'أمر الذكاء الاصطناعي النهائي',
    finalDesc: 'انسخ هذا الأمر في نظام الذكاء الاصطناعي المفضل لديك (Gemini، GPT-4، إلخ) لتوليد الوثائق.',
    fields: {
      projectName: { 
        label: 'اسم المشروع', 
        required: true,
        desc: 'الاسم الرسمي لمشروعك البرمجي.', 
        slang: 'هنسمي المشروع ده إيه؟ اختار اسم رنان كده يعلق مع الناس ويخليهم يفتكروه!',
        placeholder: 'مثال: منصة نيكسوس السحابية' 
      },
      projectDescription: { 
        label: 'وصف المشروع', 
        required: true,
        desc: 'ملخص رفيع المستوى لما يفعله النظام وقيمته المقترحة.', 
        slang: 'إيه الفكرة بالظبط؟ اشرحلي ببساطة كده السيستم ده بيحل مشكلة إيه وليه هو مهم؟',
        placeholder: 'ماذا يفعل هذا النظام؟' 
      },
      projectType: { 
        label: 'نوع المشروع', 
        required: true,
        desc: 'المنصة أو طبيعة التطبيق.', 
        slang: 'ده موقع ولا أبلكيشن موبايل ولا نظام ذكاء اصطناعي؟ حدد لنا المنصة اللي هيعيش عليها.',
        options: [
          { name: 'تطبيق ويب', icon: Globe },
          { name: 'تطبيق جوال', icon: Smartphone },
          { name: 'واجهة برمجة تطبيقات (API)', icon: Code },
          { name: 'تطبيق مكتبي', icon: Monitor },
          { name: 'نظام ذكاء اصطناعي', icon: Brain }
        ] 
      },
      targetUsers: { 
        label: 'المستخدمون المستهدفون', 
        required: true,
        desc: 'من سيستخدم هذا البرنامج؟ (مثل: المستخدمين النهائيين، المشرفين، المطورين).', 
        slang: 'مين اللي هيستخدم الكلام ده؟ ناس عادية، ولا مبرمجين حريفة، ولا المديرين اللي عايزين تقارير؟',
        placeholder: 'مثال: مهندسو العمليات (DevOps)' 
      },
      techStack: { 
        label: 'المكونات التقنية', 
        required: true,
        desc: 'اللغات، أطر العمل، والمكتبات المستخدمة.', 
        slang: 'إيه العدة اللي هنستخدمها؟ اختار اللغات والأدوات اللي هتبني بيها المشروع من الصفر.',
        placeholder: 'React, Node.js, TypeScript...' 
      },
      systemArchitecture: { 
        label: 'هيكلية النظام', 
        required: true,
        desc: 'النمط الهيكلي للنظام.', 
        slang: 'النظام متقسم إزاي؟ حتة واحدة كبيرة وتقيلة ولا خدمات صغيرة ذكية متوصلة ببعض؟',
        options: ['Monolith (متجانس)', 'Microservices (خدمات مصغرة)', 'Serverless (بدون خادم)'] 
      },
      databaseType: { 
        label: 'نوع قاعدة البيانات', 
        required: false,
        desc: 'أنظمة تخزين البيانات الأساسية.', 
        slang: 'البيانات هتتخزن فين؟ ده المخ اللي بيحفظ كل حاجة في الأبلكيشن عشان متضيعش.',
        placeholder: 'PostgreSQL, MongoDB...' 
      },
      mainModules: { 
        label: 'الوحدات الرئيسية', 
        required: true,
        desc: 'المناطق الوظيفية الأساسية للتطبيق.', 
        slang: 'إيه الأجزاء الأساسية؟ زي نظام الدخول، المحفظة، أو لوحة التحكم اللي بتدير كل حاجة.',
        placeholder: 'الهوية، الفواتير، لوحة التحكم...' 
      },
      externalIntegrations: { 
        label: 'التكاملات الخارجية', 
        required: false,
        desc: 'الخدمات الخارجية وواجهات برمجة التطبيقات التابعة لجهات خارجية.', 
        slang: 'هنتعامل مع مين بره؟ زي Stripe عشان الكاش، أو AWS للتخزين، أو Slack للتنبيهات.',
        placeholder: 'Stripe, SendGrid, AWS S3...' 
      },
      deploymentEnvironment: { 
        label: 'بيئة النشر', 
        required: false,
        desc: 'مكان استضافة التطبيق وكيفية نشره.', 
        slang: 'المشروع ده هيترفع فين؟ على AWS ولا Vercel ولا شغال بالـ Docker في السحابة؟',
        placeholder: 'AWS, Azure, On-premise...' 
      },
      methodology: { 
        label: 'منهجية التطوير', 
        required: true,
        desc: 'عملية التطوير التي يتبعها الفريق.', 
        slang: 'شغالين إزاي؟ بنجري ونعدل بسرعة (Agile) ولا بنمشي بخطوات ثابتة ومخطط لها؟',
        options: ['Agile', 'Scrum', 'Kanban'] 
      },
      tone: {
        label: 'نبرة الوثائق',
        required: true,
        desc: 'أسلوب كتابة الوثائق.',
        slang: 'عايز الكلام يبقى إزاي؟ رسمي وجاد ولا كأننا بنشرح لزميلنا في الشغل؟',
        options: ['Professional (احترافي)', 'Technical (تقني)', 'Conversational (حوارى)', 'Academic (أكاديمي)']
      },
      detailLevel: {
        label: 'مستوى التفاصيل',
        required: true,
        desc: 'ما مدى العمق الذي يجب أن تكون عليه الوثائق؟',
        slang: 'عايز الخلاصة ولا كل تفصيلة صغيرة وكبيرة بالتفصيل الممل؟',
        options: ['Concise (مختصر)', 'Standard (قياسي)', 'Exhaustive (شامل)']
      },
      includedSections: {
        label: 'الأقسام المضمنة',
        required: true,
        desc: 'اختر ملفات الوثائق التي تريد توليدها.',
        slang: 'إيه الأجزاء اللي محتاجها فعلاً دلوقتي من الوثائق دي كلها؟',
        options: [
          'PRD.md', 'SRS.md', 'ARCHITECTURE.md', 'API_SPEC.md', 
          'DATABASE_SCHEMA.md', 'CODING_RULES.md', 'ROADMAP.md', 
          'RUNBOOK.md', 'AI_CONTEXT.md'
        ]
      },
      securityRequirements: { 
        label: 'المتطلبات الأمنية', 
        required: false,
        desc: 'معايير أمنية محددة أو ميزات مطلوبة.', 
        slang: 'هنأمن المشروع إزاي؟ فكر فيها كأنها الأقفال، الإنذار، والأكواد السرية اللي بتحمي شغلك.',
        placeholder: 'OAuth2، التشفير عند السكون...' 
      },
      performanceRequirements: { 
        label: 'متطلبات الأداء', 
        required: false,
        desc: 'أهداف السرعة، القابلية للتوسع، والتوفر.', 
        slang: 'عايز السرعة قد إيه؟ لازم يكون طيارة، ناعم، ويستحمل دوسة الناس عليه من غير ما يهنق!',
        placeholder: 'زمن استجابة < 200ms، 10k مستخدم متزامن...' 
      },
    },
    features: [
      { title: 'دقة عالية', desc: 'مصمم خصيصاً لمكوناتك التقنية وقراراتك المعمارية.' },
      { title: 'تصميم تكراري', desc: 'استخدم زر "تعديل المعلومات" لتحسين السياق وإعادة توليد الأمر.' },
      { title: 'معياري', desc: 'يتبع معايير PRD و SRS و ADR المستخدمة من قبل أفضل الفرق الهندسية.' }
    ]
  }
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'ar'>(() => {
    const saved = localStorage.getItem('docuprompt_lang');
    return (saved === 'en' || saved === 'ar') ? saved : 'en';
  });
  const [stage, setStage] = useState<1 | 2>(1);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [projects, setProjects] = useState<Record<string, ProjectInfo>>(() => {
    const saved = localStorage.getItem('docuprompt_projects');
    return saved ? JSON.parse(saved) : {};
  });
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(() => {
    return localStorage.getItem('docuprompt_current_project_id');
  });

  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    fileType: 'all',
    module: 'all',
  });
  const [viewMode, setViewMode] = useState<'prompt' | 'docs'>('prompt');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('full');

  const [info, setInfo] = useState<ProjectInfo>(() => {
    const saved = localStorage.getItem('docuprompt_project_info');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved project info', e);
      }
    }
    return initialInfo;
  });

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    // We could show a toast here
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProjects({});
      setInfo(initialInfo);
      setCurrentProjectId(null);
      localStorage.removeItem('docuprompt_projects');
      localStorage.removeItem('docuprompt_current_project_id');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSaveToCloud = async (projectInfo: ProjectInfo, id: string) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const docRef = doc(db, 'projects', id);
      await setDoc(docRef, {
        ...projectInfo,
        uid: user.uid,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `projects/${id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveToBrowser = () => {
    if (!info.projectName.trim()) {
      alert(lang === 'en' ? 'Please enter a project name first.' : 'يرجى إدخال اسم المشروع أولاً.');
      return;
    }

    // Check if a project with the same name already exists (excluding the current one)
    const existingEntry = Object.entries(projects).find(
      ([id, p]) => (p as ProjectInfo).projectName.toLowerCase() === info.projectName.toLowerCase() && id !== currentProjectId
    );

    let idToUse = currentProjectId;

    if (existingEntry) {
      const [existingId] = existingEntry;
      const confirmOverwrite = confirm(lang === 'en' 
        ? `A project named "${info.projectName}" already exists. Do you want to overwrite it?` 
        : `مشروع باسم "${info.projectName}" موجود بالفعل. هل تريد استبداله؟`);
      
      if (!confirmOverwrite) return;
      idToUse = existingId;
    }

    const id = idToUse || Date.now().toString();
    const updatedProjects = { ...projects, [id]: info };
    setProjects(updatedProjects);
    setCurrentProjectId(id);
    localStorage.setItem('docuprompt_projects', JSON.stringify(updatedProjects));
    localStorage.setItem('docuprompt_current_project_id', id);
    
    if (user) {
      handleSaveToCloud(info, id);
    }
    
    alert(lang === 'en' ? 'Project saved!' : 'تم حفظ المشروع!');
  };

  const handleNewProject = () => {
    if (confirm(lang === 'en' ? 'Are you sure you want to start a new project? Unsaved changes will be lost.' : 'هل أنت متأكد أنك تريد بدء مشروع جديد؟ ستفقد التغييرات غير المحفوظة.')) {
      setInfo(initialInfo);
      setCurrentProjectId(null);
      localStorage.removeItem('docuprompt_current_project_id');
      setStage(1);
    }
  };
  const [copied, setCopied] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const t = translations[lang];

  const isFormValid = () => {
    return (
      (info.projectName?.trim() ?? '') !== '' &&
      (info.projectDescription?.trim() ?? '') !== '' &&
      (info.targetUsers?.trim() ?? '') !== '' &&
      (info.techStack?.length ?? 0) > 0 &&
      (info.mainModules?.trim() ?? '') !== ''
    );
  };

  const handleProceed = () => {
    if (isFormValid()) {
      setStage(2);
      setShowErrors(false);
    } else {
      setShowErrors(true);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    const q = query(collection(db, 'projects'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cloudProjects: Record<string, ProjectInfo> = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Remove internal fields for the UI
        const { uid, updatedAt, ...projectInfo } = data;
        cloudProjects[doc.id] = projectInfo as ProjectInfo;
      });
      setProjects(cloudProjects);
      localStorage.setItem('docuprompt_projects', JSON.stringify(cloudProjects));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('docuprompt_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('docuprompt_project_info', JSON.stringify(info));
  }, [info]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInfo(prev => ({ ...prev, [name]: value }));
  };

  const generatePrompt = () => {
    const filesToGenerate = info.includedSections;

    const prompt = `
# ROLE: Senior Software Architect & Documentation Expert

# GOAL:
Generate a professional documentation system for the software project described below. 
The documentation must be developer-friendly, AI-readable, and follow industry best practices.

# STYLE GUIDELINES:
- **Tone:** ${info.tone} (Ensure the documentation reflects this tone throughout).
- **Detail Level:** ${info.detailLevel} (Provide content depth corresponding to this level).

# PROJECT CONTEXT:
- **Project Name:** ${info.projectName}
- **Project Description:** ${info.projectDescription}
- **Project Type:** ${info.projectType}
- **Target Users:** ${info.targetUsers}
- **Tech Stack:** ${info.techStack.join(', ')}
- **System Architecture:** ${info.systemArchitecture}
- **Main Modules:** ${info.mainModules}
- **Database Type:** ${info.databaseType.join(', ')}
- **External Integrations:** ${info.externalIntegrations.join(', ')}
- **Deployment Environment:** ${info.deploymentEnvironment.join(', ')}
- **Security Requirements:** ${info.securityRequirements}
- **Performance Requirements:** ${info.performanceRequirements.join(', ')}
- **Development Methodology:** ${info.methodology}

# INSTRUCTIONS:
Create a documentation system in Markdown format. 
Organize the output into the following folder structure and files:

docs/
${filesToGenerate.map(f => `├── ${f}`).join('\n')}

# DETAILED REQUIREMENTS FOR EACH SECTION:

${filesToGenerate.includes('PRD.md') || filesToGenerate.includes('SRS.md') ? `
1. **PRD.md & SRS.md:** 
   - Include specific **User Stories** and **Acceptance Criteria**.
   - **Concrete Examples:** Include at least 5 **User Stories** (e.g., "As a [User Role], I want to [Action] so that [Value]") specifically tailored to ${info.projectName}.
   - Define **Non-Functional Requirements** (NFRs) with measurable metrics (e.g., "99.9% availability", "Response time < 200ms").
` : ''}

${filesToGenerate.includes('ARCHITECTURE.md') ? `
2. **ARCHITECTURE.md:**
   - Provide a **Component Diagram** using Mermaid.js visualizing the interaction between: ${info.mainModules}.
   - Detail the **Data Flow** between the frontend (${info.techStack.filter(t => ['React', 'Vue', 'Flutter'].includes(t)).join('/') || 'Client'}) and backend (${info.techStack.filter(t => ['Node.js', 'Express', 'NestJS', 'Laravel', 'Python', 'Django', 'FastAPI'].includes(t)).join('/') || 'Server'}).
` : ''}

${filesToGenerate.includes('API_SPEC.md') ? `
3. **API_SPEC.md:**
   - **OpenAPI Specification:** Provide a complete **OpenAPI 3.0.0** specification in YAML format for the core API endpoints.
   - **Actionable Examples:** Provide at least 5 detailed examples of API requests/responses (JSON format) covering different functional modules (${info.mainModules || 'Auth, Users, etc.'}).
   - For each endpoint, include:
     - The HTTP method and full path.
     - Required headers (e.g., \`Authorization\`, \`Content-Type\`).
     - A successful (200/201) response with a realistic JSON body.
     - A robust **Error Handling** example for **Invalid Input (400)** with specific validation error messages.
     - An **Authentication Failure (401)** example showing the required header/token format.
   - Ensure all examples use the project's tech stack (${info.techStack.join('/')}) conventions.
` : ''}

${filesToGenerate.includes('RUNBOOK.md') ? `
4. **RUNBOOK.md (CRITICAL - ACTIONABLE & SPECIFIC):**
   - **Deployment Pipeline:** 
     - Detail the manual steps for deploying to **${info.deploymentEnvironment.join(' or ') || 'Production'}**. Include specific CLI commands (e.g., \`docker build\`, \`git push vercel\`, \`aws s3 sync\`).
     - Provide **CI/CD Configuration Snippets** for **GitHub Actions** or **GitLab CI** tailored to the chosen environment.
   - **Maintenance Tasks:** 
     - **Database Backups:** Provide exact commands for **${info.databaseType.join(', ')}** (e.g., \`pg_dump\`, \`mongodump\`).
     - **Logs Management:** 
       - Define example log file paths for a Linux-based server (e.g., \`/var/log/${info.projectName.toLowerCase().replace(/\s+/g, '-')}/app.log\`).
       - Provide **Log Rotation** commands and a sample \`logrotate\` configuration file.
       - **Concrete Examples:** Provide a **Sample Log Snippet** (10+ lines) demonstrating typical application behavior (e.g., server start, request logging, error trace) contextual to this project.
   - **Monitoring & Alerting (Best Practices):**
     - **Health Checks:** Define requirements for \`/health\` and \`/ready\` endpoints.
     - **Key Metrics:** Define specific metrics to track for **${info.projectName}** using the **RED pattern** (Rate, Errors, Duration) and **USE method** (Utilization, Saturation, Errors).
     - **Logging Strategy:** 
       - Detail **Structured Logging** using JSON format.
       - Include requirements for **Correlation IDs** to track requests across services.
       - Define logging levels (DEBUG, INFO, WARN, ERROR) with examples of what to log at each level.
     - **Alerting Thresholds:** Provide specific alerting thresholds based on performance requirements: **${info.performanceRequirements.join(', ')}**. 
       - Define **Severity Levels** (e.g., Critical/P1, Warning/P2).
       - Provide concrete examples like: "Alert if 95th percentile latency > 500ms for 5 minutes" or "Error rate > 1% over a 10-minute window".
     - **Dashboards:** Recommend key visualizations (e.g., Latency Heatmaps, Error Rate over time).
   - **Troubleshooting Steps:**
     - **Scenario 1: High Latency.** Steps to diagnose using **${info.performanceRequirements.join(', ')}** metrics.
     - **Scenario 2: Database Connection Failure.** Specific checks for **${info.databaseType.join(', ')}**.
     - **Scenario 3: Integration Error.** How to debug **${info.externalIntegrations.join(', ')}** connections.
   - **Incident Response:** A step-by-step checklist for the "On-Call" engineer.
` : ''}

${filesToGenerate.includes('CODING_RULES.md') ? `
5. **CODING_RULES.md:**
   - **Standards & Best Practices:** Outline the coding standards for the project.
   - **React & TypeScript:** 
     - Provide guidelines for functional components, hooks usage, and prop types.
     - Define TypeScript standards (e.g., avoiding \`any\`, naming conventions for interfaces/types).
   - **Project Structure:** Define the recommended folder structure (e.g., \`src/components\`, \`src/services\`, \`src/hooks\`).
   - **Concrete Examples:** Provide **Code Snippets** demonstrating the preferred pattern for:
     - A standard **Functional Component** with props.
     - A **Custom Hook** for data fetching or state logic.
     - An **API Service** module using the project's tech stack (${info.techStack.join(' and ')}).
   - **Styling:** Define patterns for using **Tailwind CSS** and maintaining design consistency.
` : ''}

# GENERAL GUIDELINES:
- **Actionable:** Every section must contain content that a developer can use immediately.
- **Contextual:** All examples must use the project name (**${info.projectName}**) and tech stack.
- **AI-Ready:** Use consistent Markdown formatting for easy parsing by other AI tools.

# OUTPUT FORMAT:
Provide the content for each file clearly separated by headers or code blocks indicating the file path.
    `.trim();

    return prompt;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateDocs = async (download = true) => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3.1-pro-preview";
      
      const response = await ai.models.generateContent({
        model,
        contents: `
          Based on the following project context, generate the content for all the documentation files mentioned in the prompt.
          Return the result as a JSON object where the keys are the filenames (e.g., "PRD.md", "SRS.md") and the values are the markdown content of those files.
          
          PROJECT CONTEXT:
          ${generatePrompt()}
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              files: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    content: { type: Type.STRING }
                  },
                  required: ["name", "content"]
                }
              }
            },
            required: ["files"]
          }
        }
      });

      const data = JSON.parse(response.text);
      const now = new Date().toISOString();
      const files: GeneratedFile[] = data.files.map((f: any) => ({
        ...f,
        lastModified: now
      }));
      
      setGeneratedFiles(files);
      setViewMode('docs');

      if (download) {
        const zip = new JSZip();
        files.forEach((file) => {
          zip.file(file.name, file.content);
        });

        const content = await zip.generateAsync({ type: 'blob' });
        const url = window.URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${info.projectName.toLowerCase().replace(/\s+/g, '_')}_docs.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to generate docs:', error);
      alert('Failed to generate documentation files. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getSearchResults = (): SearchResult[] => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    generatedFiles.forEach(file => {
      // Apply filters
      if (searchFilters.fileType !== 'all') {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext !== searchFilters.fileType) return;
      }

      // Module filter (simple check if module name is in file content or name)
      if (searchFilters.module !== 'all') {
        if (!file.content.toLowerCase().includes(searchFilters.module.toLowerCase()) && 
            !file.name.toLowerCase().includes(searchFilters.module.toLowerCase())) {
          return;
        }
      }

      const lines = file.content.split('\n');
      const matches: SearchResult['matches'] = [];

      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(query)) {
          const start = Math.max(0, line.toLowerCase().indexOf(query) - 40);
          const end = Math.min(line.length, line.toLowerCase().indexOf(query) + query.length + 40);
          matches.push({
            line: index + 1,
            text: line,
            preview: (start > 0 ? '...' : '') + line.substring(start, end) + (end < line.length ? '...' : '')
          });
        }
      });

      if (matches.length > 0) {
        results.push({
          fileName: file.name,
          matches
        });
      }
    });

    return results;
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5">{part}</mark> 
            : part
        )}
      </>
    );
  };

  const handleExportConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(info, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${(info.projectName || 'project').toLowerCase().replace(/\s+/g, '_')}_config.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json && typeof json === 'object' && 'projectName' in json) {
          setInfo(json);
          setShowErrors(false);
        } else {
          alert(lang === 'en' ? 'Invalid configuration file.' : 'ملف تكوين غير صالح.');
        }
      } catch (err) {
        console.error('Failed to parse config:', err);
        alert(lang === 'en' ? 'Error reading file.' : 'خطأ في قراءة الملف.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm(lang === 'en' ? 'Are you sure you want to delete this project?' : 'هل أنت متأكد أنك تريد حذف هذا المشروع؟')) {
      if (user) {
        setIsSyncing(true);
        try {
          await deleteDoc(doc(db, 'projects', id));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
        } finally {
          setIsSyncing(false);
        }
      } else {
        const updatedProjects = { ...projects };
        delete updatedProjects[id];
        setProjects(updatedProjects);
        localStorage.setItem('docuprompt_projects', JSON.stringify(updatedProjects));
      }
      
      if (currentProjectId === id) {
        setInfo(initialInfo);
        setCurrentProjectId(null);
        localStorage.removeItem('docuprompt_current_project_id');
      }
    }
  };
  const handleSelectTemplate = (templateId: string) => {
    const template = PROMPT_TEMPLATES[templateId as keyof typeof PROMPT_TEMPLATES];
    if (template) {
      setInfo(template.defaultValues);
      setSelectedTemplate(templateId);
      setShowErrors(false);
    }
  };

  const TagInput = ({ 
    name, 
    value, 
    options 
  }: { 
    name: keyof ProjectInfo, 
    value: string[], 
    options: { name: string, icon: any }[] 
  }) => {
    const [inputValue, setInputValue] = useState('');

    const addTag = (tag: string) => {
      if (tag && !value.includes(tag)) {
        setInfo(prev => ({ ...prev, [name]: [...(prev[name] as string[]), tag] }));
      }
      setInputValue('');
    };

    const removeTag = (tag: string) => {
      setInfo(prev => ({ ...prev, [name]: (prev[name] as string[]).filter(t => t !== tag) }));
    };

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 min-h-[42px] p-2 bg-white border border-[#CBD5E1] rounded-lg focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          {value.map(tag => {
            const option = options.find(o => o.name === tag);
            const Icon = option?.icon || Terminal;
            return (
              <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F1F5F9] text-[#475569] text-xs font-bold rounded-md border border-[#E2E8F0]">
                {typeof Icon === 'function' && Icon.length === 0 ? Icon() : <Icon size={12} />}
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                  <X size={12} />
                </button>
              </span>
            );
          })}
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(inputValue.trim());
              }
            }}
            placeholder={t.fields[name as keyof typeof t.fields]?.placeholder}
            className="flex-1 min-w-[120px] outline-none text-sm font-medium bg-transparent"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {options.map(opt => (
            <button
              key={opt.name}
              onClick={() => addTag(opt.name)}
              disabled={value.includes(opt.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                value.includes(opt.name) 
                ? 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed' 
                : 'bg-white text-[#64748B] border-[#CBD5E1] hover:border-blue-500 hover:text-blue-500'
              }`}
            >
              {typeof opt.icon === 'function' && opt.icon.length === 0 ? opt.icon() : <opt.icon size={12} />}
              {opt.name}
              {!value.includes(opt.name) && <Plus size={10} />}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const FieldWrapper = ({ name, children }: { name: keyof typeof t.fields, children: React.ReactNode }) => {
    const field = t.fields[name];
    const isRequired = (field as any).required;
    const isEmpty = Array.isArray(info[name as keyof ProjectInfo]) 
      ? (info[name as keyof ProjectInfo] as string[]).length === 0
      : (info[name as keyof ProjectInfo] as string)?.trim() === '';
    const hasError = showErrors && isRequired && isEmpty;

    return (
      <div className="space-y-1.5 group">
        <div className="flex items-center justify-between">
          <label className={`text-sm font-semibold transition-colors ${hasError ? 'text-red-500' : 'text-[#475569]'}`}>
            {field.label}
            {isRequired && <span className="ml-1 text-red-500">*</span>}
          </label>
          <div className="flex items-center gap-2">
            {hasError && (
              <span className="text-[10px] font-bold text-red-500 animate-pulse">
                {lang === 'en' ? 'Required' : 'مطلوب'}
              </span>
            )}
            <div className="relative">
              <Info size={14} className="text-[#94A3B8] cursor-help hover:text-blue-500 transition-colors" />
              <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-[#1E293B] text-white text-[10px] rounded shadow-xl z-20 pointer-events-none ltr:right-0 rtl:left-0">
                {field.desc}
              </div>
            </div>
          </div>
        </div>
        <div className={`transition-all ${hasError ? 'ring-2 ring-red-500/20' : ''}`}>
          {children}
        </div>
        <p className="text-[11px] text-[#64748B] font-medium italic opacity-80 mt-1">
          {field.slang}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0F172A] rounded-lg flex items-center justify-center text-white shadow-lg">
              <Terminal size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight leading-none">{t.title}</h1>
              <p className="text-[10px] text-[#64748B] font-medium uppercase tracking-wider mt-1">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 border-r border-[#E2E8F0] pr-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-[#0F172A] truncate max-w-[100px]">{user.displayName}</span>
                    <span className="text-[9px] font-medium text-[#64748B] flex items-center gap-1">
                      {isSyncing ? <Loader2 size={8} className="animate-spin" /> : <Cloud size={8} />}
                      {isSyncing ? t.syncing : t.synced}
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-1.5 text-[#64748B] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title={t.logoutBtn}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-bold hover:bg-[#1E293B] transition-all shadow-sm"
                >
                  <Globe size={14} />
                  {t.loginBtn}
                </button>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 border-r border-[#E2E8F0] pr-4">
              <button 
                onClick={handleNewProject}
                className="flex items-center gap-2 px-3 py-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold transition-all"
                title={t.newProjectBtn}
              >
                <Plus size={14} />
                <span className="hidden lg:inline">{t.newProjectBtn}</span>
              </button>

              {Object.keys(projects).length > 0 && (
                <div className="relative group/projects">
                  <button className="flex items-center gap-2 px-3 py-1.5 text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg text-xs font-bold transition-all">
                    <Box size={14} />
                    <span className="hidden lg:inline">{t.projectsTitle}</span>
                  </button>
                  <div className="absolute top-full mt-1 hidden group-hover/projects:block w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-2xl z-50 ltr:right-0 rtl:left-0 overflow-hidden">
                    {Object.entries(projects).map(([id, p]) => {
                      const project = p as ProjectInfo;
                      return (
                        <button
                          key={id}
                          onClick={() => {
                            setInfo(project);
                            setCurrentProjectId(id);
                            localStorage.setItem('docuprompt_current_project_id', id);
                            setStage(1);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-[#F8FAFC] transition-colors border-b border-[#F1F5F9] last:border-0 flex items-center justify-between group/item ${currentProjectId === id ? 'text-blue-600 bg-blue-50' : 'text-[#475569]'}`}
                        >
                          <span className="truncate max-w-[120px]">{project.projectName}</span>
                          <div className="flex items-center gap-2">
                            {currentProjectId === id && <Check size={12} />}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(id);
                              }}
                              className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-red-500 transition-all"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button 
                onClick={handleSaveToBrowser}
                className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-bold transition-all"
                title={t.saveBrowserBtn}
              >
                <Save size={14} />
                <span className="hidden lg:inline">{t.saveBrowserBtn}</span>
              </button>

              <button 
                onClick={() => handleSelectTemplate('full')}
                className="flex items-center gap-2 px-3 py-1.5 text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg text-xs font-bold transition-all"
                title={t.loadExampleBtn}
              >
                <Beaker size={14} />
                <span className="hidden lg:inline">{t.loadExampleBtn}</span>
              </button>
              
              <button 
                onClick={handleExportConfig}
                className="flex items-center gap-2 px-3 py-1.5 text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg text-xs font-bold transition-all"
                title={t.exportConfigBtn}
              >
                <Download size={14} />
                <span className="hidden lg:inline">{t.exportConfigBtn}</span>
              </button>
              <label className="flex items-center gap-2 px-3 py-1.5 text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg text-xs font-bold transition-all cursor-pointer" title={t.importConfigBtn}>
                <Upload size={14} />
                <span className="hidden lg:inline">{t.importConfigBtn}</span>
                <input type="file" accept=".json" onChange={handleImportConfig} className="hidden" />
              </label>
            </div>
            <button 
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-full text-xs font-bold transition-all"
            >
              <Languages size={14} />
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${stage === 1 ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-xs font-bold text-[#64748B]">
                {stage === 1 ? t.stage1 : t.stage2}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {stage === 1 ? (
            <motion.div
              key="stage1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="max-w-2xl">
                <h2 className="text-3xl font-extrabold text-[#0F172A] mb-4 tracking-tight">{t.headerTitle}</h2>
                <p className="text-[#64748B] leading-relaxed font-medium">
                  {t.headerDesc}
                </p>
              </div>

              {/* Template Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">{t.templatesTitle}</h3>
                    <p className="text-[11px] text-[#64748B] font-medium">{t.templatesDesc}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.values(PROMPT_TEMPLATES).map((template) => {
                    const Icon = template.icon;
                    const isSelected = selectedTemplate === template.id;
                    return (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template.id)}
                        className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left group ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-500/10' 
                            : 'border-[#E2E8F0] bg-white hover:border-blue-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg mb-3 transition-colors ${
                          isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-[#64748B] group-hover:text-blue-500'
                        }`}>
                          <Icon size={20} />
                        </div>
                        <h4 className={`text-sm font-bold mb-1 ${isSelected ? 'text-blue-700' : 'text-[#1E293B]'}`}>
                          {template.name}
                        </h4>
                        <p className="text-[10px] text-[#64748B] font-medium leading-relaxed">
                          {template.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-[#0F172A] font-bold border-b border-[#E2E8F0] pb-2">
                    <FileText size={18} />
                    <h3>{t.coreIdentity}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <FieldWrapper name="projectName">
                      <input 
                        type="text" 
                        name="projectName"
                        value={info.projectName}
                        onChange={handleInputChange}
                        placeholder={t.fields.projectName.placeholder}
                        className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                      />
                    </FieldWrapper>

                    <FieldWrapper name="projectDescription">
                      <textarea 
                        name="projectDescription"
                        value={info.projectDescription}
                        onChange={handleInputChange}
                        placeholder={t.fields.projectDescription.placeholder}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none font-medium"
                      />
                    </FieldWrapper>

                    <div className="grid grid-cols-2 gap-4">
                      <FieldWrapper name="projectType">
                        <div className="relative">
                          <select 
                            name="projectType"
                            value={info.projectType}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium appearance-none"
                          >
                            {t.fields.projectType.options?.map(opt => (
                              <option key={opt.name} value={opt.name}>{opt.name}</option>
                            ))}
                          </select>
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none">
                            {(() => {
                              const opt = t.fields.projectType.options?.find(o => o.name === info.projectType);
                              const Icon = opt?.icon || Globe;
                              return <Icon size={18} />;
                            })()}
                          </div>
                        </div>
                      </FieldWrapper>
                      <FieldWrapper name="targetUsers">
                        <input 
                          type="text" 
                          name="targetUsers"
                          value={info.targetUsers}
                          onChange={handleInputChange}
                          placeholder={t.fields.targetUsers.placeholder}
                          className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                        />
                      </FieldWrapper>
                    </div>
                  </div>
                </section>

                {/* Technical Stack */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-[#0F172A] font-bold border-b border-[#E2E8F0] pb-2">
                    <Layers size={18} />
                    <h3>{t.techArch}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <FieldWrapper name="techStack">
                      <TagInput 
                        name="techStack" 
                        value={info.techStack} 
                        options={PREDEFINED_OPTIONS.techStack} 
                      />
                    </FieldWrapper>

                    <div className="grid grid-cols-2 gap-4">
                      <FieldWrapper name="systemArchitecture">
                        <select 
                          name="systemArchitecture"
                          value={info.systemArchitecture}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                        >
                          {t.fields.systemArchitecture.options?.map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                      </FieldWrapper>
                      <FieldWrapper name="databaseType">
                        <TagInput 
                          name="databaseType" 
                          value={info.databaseType} 
                          options={PREDEFINED_OPTIONS.databaseType} 
                        />
                      </FieldWrapper>
                    </div>

                    <FieldWrapper name="mainModules">
                      <input 
                        type="text" 
                        name="mainModules"
                        value={info.mainModules}
                        onChange={handleInputChange}
                        placeholder={t.fields.mainModules.placeholder}
                        className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                      />
                    </FieldWrapper>
                  </div>
                </section>

                {/* Integrations & Environment */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-[#0F172A] font-bold border-b border-[#E2E8F0] pb-2">
                    <Globe size={18} />
                    <h3>{t.integrationsOps}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <FieldWrapper name="externalIntegrations">
                      <TagInput 
                        name="externalIntegrations" 
                        value={info.externalIntegrations} 
                        options={PREDEFINED_OPTIONS.externalIntegrations} 
                      />
                    </FieldWrapper>

                    <FieldWrapper name="deploymentEnvironment">
                      <TagInput 
                        name="deploymentEnvironment" 
                        value={info.deploymentEnvironment} 
                        options={PREDEFINED_OPTIONS.deploymentEnvironment} 
                      />
                    </FieldWrapper>

                    <FieldWrapper name="methodology">
                      <select 
                        name="methodology"
                        value={info.methodology}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                      >
                        {t.fields.methodology.options?.map(opt => <option key={opt}>{opt}</option>)}
                      </select>
                    </FieldWrapper>
                  </div>
                </section>

                {/* Requirements */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-[#0F172A] font-bold border-b border-[#E2E8F0] pb-2">
                    <Shield size={18} />
                    <h3>{t.requirements}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <FieldWrapper name="securityRequirements">
                      <input 
                        type="text" 
                        name="securityRequirements"
                        value={info.securityRequirements}
                        onChange={handleInputChange}
                        placeholder={t.fields.securityRequirements.placeholder}
                        className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                      />
                    </FieldWrapper>

                    <FieldWrapper name="performanceRequirements">
                      <TagInput 
                        name="performanceRequirements" 
                        value={info.performanceRequirements} 
                        options={PREDEFINED_OPTIONS.performanceRequirements} 
                      />
                    </FieldWrapper>
                  </div>
                </section>
              </div>

              {/* Advanced Customization */}
              <section className="space-y-6 bg-white p-6 md:p-8 rounded-2xl border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center gap-2 text-[#0F172A] font-bold border-b border-[#E2E8F0] pb-2">
                  <Zap size={18} className="text-blue-500" />
                  <h3>{t.advancedOptions}</h3>
                </div>
                <p className="text-xs text-[#64748B] font-medium">{t.advancedOptionsDesc}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-2">
                  <FieldWrapper name="tone">
                    <select 
                      name="tone"
                      value={info.tone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                    >
                      {t.fields.tone.options?.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </FieldWrapper>

                  <FieldWrapper name="detailLevel">
                    <select 
                      name="detailLevel"
                      value={info.detailLevel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                    >
                      {t.fields.detailLevel.options?.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </FieldWrapper>

                  <div className="lg:col-span-1 md:col-span-2">
                    <label className="text-sm font-semibold text-[#475569] mb-3 block">
                      {t.fields.includedSections.label}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {t.fields.includedSections.options?.map(section => (
                        <label key={section} className="flex items-center gap-2 p-2 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 cursor-pointer transition-all">
                          <input 
                            type="checkbox"
                            checked={info.includedSections.includes(section)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setInfo(prev => ({
                                ...prev,
                                includedSections: checked 
                                  ? [...prev.includedSections, section]
                                  : prev.includedSections.filter(s => s !== section)
                              }));
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-[10px] font-bold text-[#475569] truncate">{section}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <div className="pt-8 flex flex-col items-end gap-3">
                {showErrors && !isFormValid() && (
                  <p className="text-xs font-bold text-red-500 animate-bounce">
                    {lang === 'en' 
                      ? 'Please fill in all required fields marked with *' 
                      : 'يرجى ملء جميع الحقول المطلوبة المميزة بـ *'}
                  </p>
                )}
                <button
                  onClick={handleProceed}
                  className={`flex items-center gap-2 px-8 py-3.5 text-white rounded-xl font-bold transition-all shadow-xl ${
                    isFormValid() 
                    ? 'bg-[#0F172A] hover:bg-[#1E293B] shadow-blue-500/10' 
                    : 'bg-[#94A3B8] cursor-not-allowed'
                  }`}
                >
                  {t.generateBtn}
                  {lang === 'en' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-[#0F172A] mb-2 tracking-tight">
                    {viewMode === 'prompt' ? t.finalTitle : t.viewDocs}
                  </h2>
                  <p className="text-[#64748B] font-medium">
                    {viewMode === 'prompt' ? t.finalDesc : `${generatedFiles.length} ${t.files} ${t.generating.replace('...', '')}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStage(1)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] text-[#475569] rounded-lg font-bold hover:bg-[#F8FAFC] transition-all"
                  >
                    {lang === 'en' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    {t.editBtn}
                  </button>
                  
                  <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
                    <button
                      onClick={() => setViewMode('prompt')}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'prompt' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
                    >
                      {t.viewPrompt}
                    </button>
                    <button
                      onClick={() => {
                        if (generatedFiles.length === 0) {
                          handleGenerateDocs(false);
                        } else {
                          setViewMode('docs');
                        }
                      }}
                      disabled={isGenerating}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'docs' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'} ${isGenerating ? 'opacity-50' : ''}`}
                    >
                      {isGenerating && <Loader2 size={12} className="animate-spin" />}
                      {t.viewDocs}
                    </button>
                  </div>

                  {viewMode === 'prompt' ? (
                    <>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#0F172A] text-white rounded-lg font-bold hover:bg-[#1E293B] transition-all shadow-lg"
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? t.copied : t.copyBtn}
                      </button>
                      <button
                        onClick={() => handleGenerateDocs(true)}
                        disabled={isGenerating}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg ${
                          isGenerating 
                          ? 'bg-[#94A3B8] cursor-not-allowed text-white' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        {isGenerating ? t.generating : t.generateDocsBtn}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleGenerateDocs(true)}
                      disabled={isGenerating}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg"
                    >
                      {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                      {t.downloadZipBtn}
                    </button>
                  )}
                </div>
              </div>

              {viewMode === 'prompt' ? (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                        </div>
                        <span className="ml-2 text-xs font-mono text-[#94A3B8]">prompt_v1.0.md</span>
                      </div>
                      <BookOpen size={14} className="text-[#94A3B8]" />
                    </div>
                    <pre className="p-8 text-sm font-mono text-[#334155] whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[600px] ltr:text-left rtl:text-right">
                      {generatePrompt()}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Search Interface */}
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <Filter size={14} className="text-[#64748B]" />
                        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{t.fileTypeFilter}:</span>
                        <select 
                          value={searchFilters.fileType}
                          onChange={(e) => setSearchFilters(prev => ({ ...prev, fileType: e.target.value }))}
                          className="text-xs font-bold bg-[#F1F5F9] border-none rounded-md px-2 py-1 outline-none"
                        >
                          <option value="all">{t.all}</option>
                          <option value="md">Markdown (.md)</option>
                          <option value="yaml">YAML (.yaml)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-[#64748B]" />
                        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{t.moduleFilter}:</span>
                        <select 
                          value={searchFilters.module}
                          onChange={(e) => setSearchFilters(prev => ({ ...prev, module: e.target.value }))}
                          className="text-xs font-bold bg-[#F1F5F9] border-none rounded-md px-2 py-1 outline-none"
                        >
                          <option value="all">{t.all}</option>
                          {info.mainModules.split(',').map(m => (
                            <option key={m.trim()} value={m.trim()}>{m.trim()}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Search Results or File List */}
                  <div className="space-y-4">
                    {searchQuery.trim() ? (
                      <div className="space-y-4">
                        {getSearchResults().length > 0 ? (
                          <>
                            <p className="text-sm font-bold text-[#64748B]">
                              {getSearchResults().reduce((acc, curr) => acc + curr.matches.length, 0)} {t.resultsFound} {getSearchResults().length} {t.files}
                            </p>
                            {getSearchResults().map((result, idx) => (
                              <div key={idx} className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FileText size={14} className="text-blue-600" />
                                    <span className="text-xs font-bold text-[#0F172A]">{result.fileName}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase">{result.matches.length} matches</span>
                                </div>
                                <div className="p-4 space-y-3">
                                  {result.matches.map((match, mIdx) => (
                                    <div key={mIdx} className="group cursor-pointer hover:bg-[#F8FAFC] p-2 rounded-lg transition-colors">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-mono text-[#94A3B8]">Line {match.line}</span>
                                      </div>
                                      <p className="text-sm font-mono text-[#334155] break-all">
                                        {highlightText(match.preview, searchQuery)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="text-center py-12 bg-white border border-[#E2E8F0] rounded-2xl">
                            <Search size={48} className="mx-auto text-[#E2E8F0] mb-4" />
                            <p className="text-[#64748B] font-bold">{t.noResults}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {generatedFiles.map((file, idx) => (
                          <div key={idx} className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between hover:border-blue-500 transition-all cursor-pointer group shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <FileText size={20} />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-[#0F172A]">{file.name}</h4>
                                <p className="text-[10px] font-bold text-[#94A3B8] uppercase flex items-center gap-1">
                                  <Calendar size={10} />
                                  {t.lastModified}: {new Date(file.lastModified).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-[#CBD5E1] group-hover:text-blue-600 transition-all" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {t.features.map((feature, idx) => (
                  <div key={idx} className="p-6 bg-white border border-[#E2E8F0] rounded-xl space-y-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${idx === 0 ? 'bg-blue-50 text-blue-600' : idx === 1 ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {idx === 0 ? <Zap size={20} /> : idx === 1 ? <RefreshCw size={20} /> : <GitBranch size={20} />}
                    </div>
                    <h4 className="font-bold">{feature.title}</h4>
                    <p className="text-sm text-[#64748B] font-medium">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-[#E2E8F0] mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Terminal size={16} />
            <span className="text-sm font-bold">DocuPrompt Architect &copy; 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-bold text-[#64748B]">
            <a href="#" className="hover:text-[#0F172A] transition-colors">Documentation Guide</a>
            <a href="#" className="hover:text-[#0F172A] transition-colors">Best Practices</a>
            <a href="#" className="hover:text-[#0F172A] transition-colors">AI Context Tips</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
