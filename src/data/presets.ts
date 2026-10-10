export interface PresetScenario {
  id: string;
  name: string;
  badge: string;
  interviewerTitle: string;
  targetRole: string;
  targetCompany: string;
  candidateSeniority: string;
  trainingsContent: string;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "frontend-techlead",
    name: "Senior Tech Lead Mülakatı (Frontend / Fullstack)",
    badge: "Yazılım / Tech",
    interviewerTitle: "Senior Tech Lead / Staff Software Engineer",
    targetRole: "Senior Frontend Engineer (React / TypeScript)",
    targetCompany: "Hızlı büyüyen FinTech Scale-Up",
    candidateSeniority: "Mid-Senior (4 yıl deneyim)",
    trainingsContent: `- Udemy: İleri Seviye Modern React, Hooks, Redux Toolkit & Performance Optimization (40 saat)
- Frontend Masters: TypeScript Deep Dive & Design Patterns (25 saat)
- Coursera: Web Performance, Core Web Vitals & Browser Rendering Pipeline
- Meta Frontend Developer Professional Certificate (React, Web Accessibility, Git & CI/CD temelleri)
- Kişisel Projeler: E-ticaret sepet mikroservis entegrasyonu, Real-time Dashboard (WebSockets)`
  },
  {
    id: "product-hr-director",
    name: "İK Direktörü & Yetenek Kazanımı Mülakatı (Product Manager)",
    badge: "Ürün & Yönetim",
    interviewerTitle: "Head of People & Talent Acquisition Director",
    targetRole: "Senior Product Manager",
    targetCompany: "Global B2B SaaS Şirketi",
    candidateSeniority: "Senior (6 yıl deneyim)",
    trainingsContent: `- Scrum.org: Professional Scrum Product Owner (PSPO I & II) Sertifikası
- Reforge: Product Strategy & Growth Loops Workshop
- Coursera: Data-Driven Decision Making & A/B Testing for Product Managers (Duke University)
- Harvard ManageMentor: Stratejik Paydaş Yönetimi ve Çatışma Çözümü Eğitimi
- Pratik Deneyim: 0'dan 1'e analitik SaaS aracı lansmanı, 4 farklı çapraz fonksiyonel mühendislik takımına liderlik`
  },
  {
    id: "backend-cto",
    name: "CTO / Mühendislik Direktörü Mülakatı (Cloud Architect)",
    badge: "Mimari & Executive",
    interviewerTitle: "Chief Technology Officer (CTO)",
    targetRole: "Lead Backend & Cloud Solutions Architect",
    targetCompany: "Yüksek Trafikli Finansal Teknoloji & Ödeme Sistemleri",
    candidateSeniority: "Lead / Principal (8 yıl deneyim)",
    trainingsContent: `- AWS Certified Solutions Architect - Associate & Professional
- Linux Foundation: Kubernetes (CKA) ve Mikroservis Mesh Mimarileri
- Dağıtık Sistemler Eğitimi: Event-Driven Architecture, Kafka, CQRS ve Event Sourcing
- PostgreSQL İleri Düzey Performans Tuning & Sharding Eğitimi
- Pratik Deneyim: Günlük 15M istek alan monolit mimariyi Go ve Kafka tabanlı mikroservislere dönüştürme`
  },
  {
    id: "data-analytics-head",
    name: "Head of BI & Analytics Mülakatı (Data Scientist)",
    badge: "Veri & Yapay Zeka",
    interviewerTitle: "Head of Data & Business Intelligence",
    targetRole: "Senior Data Scientist & AI Engineer",
    targetCompany: "E-Ticaret & Perakende Devi",
    candidateSeniority: "Senior (5 yıl deneyim)",
    trainingsContent: `- DeepLearning.AI: Machine Learning Specialization & Deep Learning Specialization
- Coursera: Applied Data Science with Python (University of Michigan)
- Databricks: Apache Spark & Large Scale Data Processing Sertifikası
- MLOps Workshop: MLflow, Docker ve Model Deployment Pipelines
- Pratik Deneyim: Churn tahminleme modeli (ROC-AUC 0.88), Müşteri Segmentasyon Kümeleme Projesi`
  }
];
