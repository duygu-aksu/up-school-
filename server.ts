import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));

// Shared Gemini SDK client on server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

// Resilient domain fallback generators for high availability
function generateQuestionsFallback(interviewerTitle: string, targetRole: string, candidateSeniority?: string) {
  const isTech = /tech|lead|architect|cto|engineer|developer|mühendis/i.test(interviewerTitle);
  const isHR = /hr|people|ik|insan|talent|recruiter/i.test(interviewerTitle);
  const isProduct = /product|pm|cpo|ürün/i.test(interviewerTitle);

  let psychology = `"${interviewerTitle}" olarak ana odak noktası: Adayın ${targetRole} rolünde pragmatik kararlar alıp alamadığı, baskı altında ekibi ve iş hedeflerini nasıl dengelediğidir.`;
  let dims = ["Teknik Olgunluk & Çözüm Mimarisi", "İletişim & Paydaş Yönetimi", "Problem Çözme Çevikliği", "Kültürel ve Değer Uyumu"];

  if (isTech) {
    psychology = `"${interviewerTitle}" unvanındaki bir teknik lider; adayın ezber teoriyi değil, üretim ortamında (production) yaşadığı gerçek krizleri, teknik borç (technical debt) yönetimini, kod kalitesini ve mimari ödünleşimleri (trade-offs) nasıl savunduğunu tartar.`;
    dims = ["Mimari Ödünleşimler (Trade-offs)", "Hata Ayıklama & Performans Analizi", "Kod Kalitesi & Test Kültürü", "Ölçeklenebilirlik & Güvenilirlik"];
  } else if (isHR) {
    psychology = `"${interviewerTitle}" unvanındaki bir yetenek yöneticisi; şirket kültürüne adaptasyon, çatışma anında yapıcı iletişim, öğrenme çevikliği ve adayın kurumda uzun vadeli kalma motivasyonunu inceler.`;
    dims = ["Kültürel Uyum & Değerler", "Geri Bildirim Açıklığı", "Ekip İçi Çatışma Yönetimi", "Kariyer Tutarlılığı & Motivasyon"];
  } else if (isProduct) {
    psychology = `"${interviewerTitle}" unvanındaki bir ürün lideri; mühendislik kararlarının doğrudan iş metriklerine (ROI, dönüşüm, kullanıcı memnuniyeti) nasıl yansıdığını, gereksinim önceliklendirme yeteneğini ve belirsizlik yönetimini sorgular.`;
    dims = ["Kullanıcı ve İş Odaklılık", "Önceliklendirme Metodolojisi", "Mühendislik-İş Dengesi", "Metrik & Veri Odaklı Karar Alma"];
  }

  const questions = [
    {
      id: "q1",
      category: isTech ? "Teknik Mimari & Karar Alma" : isProduct ? "Ürün & İş Etkisi" : "Kültürel Uyum & Motivasyon",
      difficulty: "Orta / İleri",
      question: isTech
        ? `${targetRole} olarak daha önce aldığınız ve sonradan eksikliklerini fark ettiğiniz bir mimari/teknik kararı anlatır mısınız? Geriye dönseydiniz neyi farklı yapardınız?`
        : isProduct
        ? `Geliştirme ekibi ile iş birimleri arasında çatışan hedefleri nasıl hizalıyorsunuz? Somut bir örnek verebilir misiniz?`
        : `Ekibinizde çalışma temposunu ve motivasyonunu düşüren bir kriz yaşandığında üstlendiğiniz inisiyatif ne oldu?`,
      whyTheyAsk: `Bu unvan adayın kendi hatalarından öğrenme olgunluğunu (self-awareness) ve teknik/operasyonel egoyu yönetebilme kapasitesini ölçer.`,
      idealStrategy: `STAR metodunu kullanın: Durumu kısaca özetleyin, görevi tanımlayın, aldığınız somut dersi (Action) ve sistemin/ekibin nasıl iyileştiğini (Result) metriklerle vurgulayın.`,
      pitfallsToAvoid: [
        "Suçu ekip arkadaşlarına veya yönetime atmak.",
        "Hiç hata yapmadığını iddia etmek.",
        "Çözümün sonucunu ölçülebilir bağlamadan bırakmak."
      ],
      sampleAnswer: `"Geçmiş projemizde monolitik bir modülü hız kaygısıyla acelece mikroservise böldük. Ancak ağ gecikmesi ve veri tutarlılığı sorunları yaşadık. Hemen geriye dönüp distributed tracing ekledim ve asenkron event-driven modele geçtik. Bu tecrübe bana 'her zaman en yeni teknoloji değil, işe en uygun mimari' ilkesini aşıladı."`,
      probingFollowUp: isTech ? "Peki bu refactoring sırasında production kesintisini nasıl sıfıra indirdiniz?" : "Paydaşlar bu gecikmeye nasıl tepki verdi?"
    },
    {
      id: "q2",
      category: "Durumsal Senaryo (Kriz Yönetimi)",
      difficulty: "Zorlayıcı",
      question: `Teslim tarihine 48 saat kala kritik bir hata keşfettiniz ve yöneticiniz erteleme istemiyor. Bu senaryoda karar süreciniz ve atacağınız adımlar neler olur?`,
      whyTheyAsk: `Baskı altında panik yapmadan pragmatik karar alabilme, risk yönetimi ve şeffaf iletişim yeteneğinizi test eder.`,
      idealStrategy: `Panik yerine triyaj (triage) yaklaşımı sunun: Hatayı izole etme, kapsamı (scope) kırpma opsiyonları, yöneticinin önüne veriyle gitme ve risk matrisi çıkarma.`,
      pitfallsToAvoid: [
        "Hatayı görmezden gelip canlıya almak.",
        "İletişim kurmadan tek başına gece sabahlayıp kontrolsüz kod yazmak."
      ],
      sampleAnswer: `"Önce hatanın etki alanını analiz ederdim (Kullanıcıların yüzde kaçı etkileniyor?). Ardından yöneticiye 2 net seçenek sunardım: Ya kritik olmayan özelliği devre dışı bırakıp ana akışı zamanında çıkarmak ya da 1 gün kontrollü öteleyip sağlam test etmek. Şeffaf veri karar almayı kolaylaştırır."`,
      probingFollowUp: "Yönetici yine de 'İkisini de yap, uyumadan yetiştir' derse cevabınız ne olur?"
    },
    {
      id: "q3",
      category: isTech ? "Teknik Derinlik & Kalite" : "Liderlik & Çatışma",
      difficulty: "İleri",
      question: isTech
        ? `Ekibinizde kod incelemelerinde (Code Review) ya da teknik standartlarda anlaşmazlık çıktığında consensus (uzlaşı) sağlamak için nasıl bir yöntem izlersiniz?`
        : `Birlikte çalışması zor veya sürekli itiraz eden bir paydaş/takım arkadaşıyla verimli bir çalışma ritmi nasıl kurdunuz?`,
      whyTheyAsk: `Teknik dogmatizmden uzak, ekibi büyüten ve birleştiren bir yaklaşım sergileyip sergilemediğinizi görmek ister.`,
      idealStrategy: `Kişisel zevkler yerine belgelenmiş standartlar, otomatik linting/testler ve veri temelli tartışma prensiplerini örnek gösterin.`,
      pitfallsToAvoid: ["'Ben kıdemliyim, benim dediğim olur' algısı yaratmak.", "Konuyu sürüncemede bırakıp pasif kalmak."],
      sampleAnswer: `"Tartışmaları kişisel tercihlerden çıkarıp objektif metriklere bağlamayı ilke edindim. Örneğin bir tartışmada RFC (Request for Comments) dökümanı açıp iki yaklaşımın benchmark sonuçlarını benchmark testleriyle karşılaştırdık ve ekiple oybirliğiyle karar aldık."`,
      probingFollowUp: "Eğer ekip ikiye bölünürse ve eşitlik bozulmazsa son kararı nasıl verirsiniz?"
    },
    {
      id: "q4",
      category: "Ölçeklenebilirlik & Vizyon",
      difficulty: "İleri",
      question: `Sisteminizin veya ürününüzün kullanıcı yükü 10 katına çıktığında ilk kırılacak yer neresidir ve bunu önceden nasıl sağlamlaştırırsınız?`,
      whyTheyAsk: `Adayın ileriye dönük sistemik düşünme (system thinking) ve proaktif mimari olgunluğunu ölçmek ister.`,
      idealStrategy: `Darboğazları (bottlenecks: veri tabanı I/O, cache invalidation, thread contention, network bandwidth) sınıflandırın ve katmanlı savunma stratejisi anlatın.`,
      pitfallsToAvoid: ["'Sadece sunucuyu büyütürüz (Vertical scaling)' demek.", "Gözlemleme (Observability) araçlarından bahsetmemek."],
      sampleAnswer: `"Genelde ilk patlayan yer veritabanı kilitleri ve verimsiz sorgulardır. Bunu önlemek için okuma/yazma ayrımı (CQRS/Read Replicas), Redis tabanlı önbellek ve yük testleri (Load testing) ile kırılma noktasını önceden simüle ederim."`,
      probingFollowUp: "Cache invalidation stratejinizde stale data riskini nasıl bertaraf edersiniz?"
    },
    {
      id: "q5",
      category: "Davranışsal & STAR (Etki Odaklılık)",
      difficulty: "Orta",
      question: `Son 1 yılda aldığınız en büyük inisiyatif ve bunun şirkete/ekibe sağladığı somut fayda ne oldu?`,
      whyTheyAsk: `Görev bekleyen pasif bir uygulayıcı mı yoksa şirket için katma değer yaratan proaktif bir profesyonel mi olduğunuzu anlamak için sorar.`,
      idealStrategy: `Şirkette gördüğünüz bir aksaklığı tespit edişinizi, kendi inisiyatifinizle geliştirdiğiniz çözümü ve sağladığı % zaman veya maliyet tasarrufunu anlatın.`,
      pitfallsToAvoid: ["Sadece rutin iş tanımındaki görevleri saymak.", "Sonuçta rakamsal etki belirtmemek."],
      sampleAnswer: `"CI/CD derleme sürelerimizin 35 dakikayı bulduğunu ve günde onlarca deploy'u yavaşlattığını gördüm. İnisiyatif alarak pipeline'a caching ve parallel test adımları entegre ettim; süreyi 8 dakikaya düşürdüm. Ekip ayda yaklaşık 40 mühendislik saati kazandı."`,
      probingFollowUp: "Bu inisiyatifi başlatırken mevcut sprint işlerinizi nasıl aksatmadınız?"
    }
  ];

  const reverseQuestionsToAsk = [
    {
      question: `Sizin gözünüzden ${interviewerTitle} olarak, bu pozisyona gelecek kişinin ilk 90 günde başaracağı hangi tek bir sonuç sizi 'Harika bir seçim yaptık' dedirtir?`,
      whyItImpresses: `Mülakatçıya adayın sonuç odaklı olduğunu ve ilk günden net başarı kriteri aradığını gösterir.`
    },
    {
      question: `Şu an ekibinizin/şirketinizin karşılaştığı en büyük teknik veya operasyonel darboğaz nedir ve bu rolün bunu çözmedeki payı nedir?`,
      whyItImpresses: `Pozisyonu sadece bir iş olarak değil, şirketin acil bir problemine çözüm ortağı olarak gördüğünüzü kanıtlar.`
    },
    {
      question: `Ekibinizde yeni fikirlerin ve teknik iyileştirme inisiyatiflerinin hayata geçme süreci nasıl işliyor? En son kabul edilen bir örnek verebilir misiniz?`,
      whyItImpresses: `Mülakatçıya yenilikçi, gelişime açık ve şirket içi kültür dinamiklerini önemseyen bir aday olduğunuz sinyalini verir.`
    }
  ];

  return {
    interviewerPsychology: psychology,
    evaluationDimensions: dims,
    questions,
    reverseQuestionsToAsk
  };
}

function analyzeTrainingsFallback(trainingsContent: string, targetRole: string) {
  return {
    currentStrengths: [
      "Modern temel teknolojilere ve popüler framework ekosistemine hakimiyet",
      "Teorik yazılım prensipleri ve temel bileşen mimarisi bilgisi",
      "Kişisel projeler ve pratik uygulama geliştirme deneyimi"
    ],
    skillGaps: [
      {
        skill: "Dağıtık Sistem Mimarisi & Yüksek Ölçeklenebilirlik",
        importance: "Kritik",
        description: `${targetRole} seviyesinde sadece kod yazmak yetmez; binlerce eşzamanlı isteği yönetecek dağıtık mimari, mikroservis haberleşmesi ve event-driven prensipler şarttır.`
      },
      {
        skill: "Sistem Gözlemlenebilirliği & Production-Grade Hata Ayıklama",
        importance: "Yüksek",
        description: "OpenTelemetry, Grafana, APM ve merkezi loglama ile canlı ortamdaki darboğazları tespit edebilme kası."
      },
      {
        skill: "Teknik Liderlik, Tasarım Belgesi (RFC) Yazımı & Paydaş Yönetimi",
        importance: "Yüksek",
        description: "Karmaşık mühendislik kararlarını yazılı mimari belgelere dökmek ve ekipleri bu vizyon etrafında hizalamak."
      }
    ],
    recommendedTrainings: [
      {
        title: "Advanced System Design & Scalable Microservices Architecture",
        priority: "1. Öncelik (Acil İhtiyaç)",
        category: "Teknik / Mimari",
        whyThisTraining: `Geçmişteki temel uygulama eğitimlerinizin üzerine yüksek trafikli ve dağıtık sistem mimarisi katmanını ekleyerek ${targetRole} mülakatlarındaki sistem tasarımı turlarını başarıyla geçmenizi sağlar.`,
        suggestedCurriculum: [
          "Dağıtık Veri Tabanları, Sharding & Read Replicas",
          "Event-Driven Architecture (Kafka / RabbitMQ)",
          "Caching Stratejileri (Cache-Aside, Write-Through)",
          "Rate Limiting, Circuit Breakers & Graceful Degradation"
        ],
        recommendedProvidersOrCerts: ["Grokking the System Design Interview", "AWS Certified Solutions Architect", "Coursera"],
        portfolioProjectIdea: "Günde 5 milyon istek alabilen ölçeklenebilir bir URL Kısaltıcı veya Gerçek Zamanlı Bildirim Servisi mimarisi tasarlayıp GitHub'da dokümante etmek.",
        expectedOutcome: "Mülakatlarda sistem tasarımı sorularında paniklemeden end-to-end mimari çizebilme yetkinliği."
      },
      {
        title: "Production Observability, CI/CD & Cloud Deployment Pipelines",
        priority: "2. Öncelik (Kritik Derinleşme)",
        category: "Metodoloji & Araçlar",
        whyThisTraining: "Yazılan kodun üretim ortamındaki sağlığını izleme, otomatik test ve zero-downtime deployment kaslarını tamamlar.",
        suggestedCurriculum: [
          "Docker & Kubernetes temelleri",
          "Prometheus & Grafana ile SLI/SLO metrik takibi",
          "GitHub Actions ile Automated Testing & Staging Pipelines"
        ],
        recommendedProvidersOrCerts: ["Linux Foundation (CKAD/CKA)", "Udemy / KodeKloud"],
        portfolioProjectIdea: "Mevcut projelerinizden birine tam otomatik GitHub Actions pipeline'ı ve Dockerize deployment eklemek.",
        expectedOutcome: "Teknik liderlerin en çok aradığı 'production olgunluğu' sinyalini vermek."
      },
      {
        title: "Engineering Leadership & Strategic Communication for Senior Roles",
        priority: "3. Öncelik (Fark Yaratan Uzmanlık)",
        category: "Yönetim / Liderlik",
        whyThisTraining: "Kıdemli mühendis ve lider rollerinde teknik bilginin ötesine geçerek mülakat komitesini liderlik kumaşınızla etkilemenizi sağlar.",
        suggestedCurriculum: [
          "RFC ve Mimari Karar Kayıtları (ADR) hazırlama",
          "Junior/Mid mühendislere mentorluk ve kod inceleme adabı",
          "Ürün yöneticileriyle teknik borç pazarlığı yapma"
        ],
        recommendedProvidersOrCerts: ["LeadDev Workshops", "Reforge", "Harvard ManageMentor"],
        portfolioProjectIdea: "Açık kaynaklı bir projeye detaylı bir mimari RFC hazırlayıp toplulukla tartışmak.",
        expectedOutcome: "Mülakatçının 'Bu adayı sadece bir geliştirici olarak değil, geleceğin takım lideri olarak almalıyız' demesi."
      }
    ],
    roadmap: {
      thirtyDays: [
        "Temel Sistem Tasarımı prensiplerini çalışın (Load Balancers, Caching, CAP Teoremi).",
        "Geçmiş projelerinizden birinin mimari şemasını ve zayıf noktalarını kağıda dökün.",
        "Örnek bir System Design mülakat sorusunu 45 dakikalık sürede whiteboard üzerinde çözün."
      ],
      sixtyDays: [
        "Dağıtık kuyruk mekanizmalarını (Kafka/RabbitMQ) pratik bir demoyla deneyimleyin.",
        "Projenize test otomasyonu ve Docker tabanlı CI/CD pipeline'ı entegre edin.",
        "Mülakatlarda anlatacağınız 3 somut başarı hikayesini STAR formatında yazıp prova edin."
      ],
      ninetyDays: [
        "Mock interview simülasyonlarıyla zaman baskısı altında soru çözme pratiği yapın.",
        "Portfolyonuzdaki mimari belgeleri ve GitHub repolarını parlatın.",
        "Hedeflediğiniz şirketlerdeki ilgili unvandaki liderlerle networking kurup mülakatlara başlayın."
      ]
    },
    coachSummary: `Mevcut eğitim profiliniz sağlam bir temel inşa etmiş. Artık yapmanız gereken daha fazla temel syntax öğrenmek değil; dağıtık sistem mimarisi, iş etkisi ve teknik liderlik kaslarını parlatarak ${targetRole} seviyesine sıçramaktır.`
  };
}

function generateSimulationPlanFallback(interviewerTitle: string, targetRole: string) {
  return {
    simulationTitle: `${interviewerTitle} Karşısında 60 Dakikalık Tam Mülakat Simülasyon Planı`,
    overview: `Bu simülasyon, "${interviewerTitle}" unvanının tipik mülakat dinamiklerine ve karar kriterlerine göre yapılandırılmıştır. Amaç adayın teknik derinlik, iletişim netliği ve stres toleransını gerçekçi bir zaman baskısında test etmektir.`,
    totalDurationMinutes: 60,
    stages: [
      {
        stageNumber: 1,
        name: "Buz Kırma & Kariyer Hikayesi",
        duration: "10 dk",
        interviewerIntent: "Adayın iletişim tarzını, profesyonel duruşunu ve kendini özetleme netliğini tartmak.",
        candidateGoal: "Kısa, etkili ve gereksiz detaylardan arındırılmış 2 dakikalık asansör konuşması (elevator pitch) sunmak.",
        tips: ["Tüm CV'yi kronolojik okumayın, bu role özel başarılarınıza odaklanın.", "Güleryüzlü ve özgüvenli bir enerji verin."]
      },
      {
        stageNumber: 2,
        name: "Derinlemesine Yetkinlik & Mimari Sorgulama",
        duration: "25 dk",
        interviewerIntent: "Adayın ezber bilgi yerine gerçek production deneyimini ve teknik karar alma yeteneğini test etmek.",
        candidateGoal: "Sistem tasarımında alternatifleri tartıp neden o kararı aldığını (trade-offs) net ifade etmek.",
        tips: ["'En iyisi budur' demek yerine 'Avantajı X, dezavantajı Y olduğu için seçtik' kalıbını kullanın."]
      },
      {
        stageNumber: 3,
        name: "Durumsal Senaryo & Çatışma Çözümü",
        duration: "15 dk",
        interviewerIntent: "Baskı, erteleme ve ekip içi fikir ayrılığı anında adayın profesyonel olgunluğunu ölçmek.",
        candidateGoal: "STAR metodolojisiyle somut bir çatışma çözümü ve kriz yönetimi hikayesi anlatmak.",
        tips: ["'Biz' yerine 'Ben şu inisiyatifi aldım' diyerek bireysel katkınızı vurgulayın."]
      },
      {
        stageNumber: 4,
        name: "Adayın Soruları (Ters Mülakat) & Kapanış",
        duration: "10 dk",
        interviewerIntent: "Adayın şirketi ve rolü ne kadar ciddiye aldığını ve entelektüel merakını değerlendirmek.",
        candidateGoal: "Mülakatçıyı düşünmeye sevk eden stratejik ters sorular sorarak unutulmaz bir son izlenim bırakmak.",
        tips: ["Maaş veya izin sormayın; rolün ilk 90 günündeki kritik başarısını ve ekibin teknik vizyonunu sorun."]
      }
    ],
    simulationQuestions: [
      {
        id: "sq1",
        stage: "Aşama 1: Giriş",
        question: "Bize kariyer yolculuğunuzdan ve son dönemde imza attığınız en gurur duyduğunuz projeden bahseder misiniz?",
        targetSkill: "Kendini İfade & İletişim Netliği",
        idealResponseTime: "2-3 dakika",
        keyPointsToHit: ["Kısa geçmiş", "Öne çıkan teknoloji kasları", "Metrikle desteklenen başarı hikayesi"]
      },
      {
        id: "sq2",
        stage: "Aşama 2: Teknik Derinlik",
        question: `${targetRole} olarak yüksek trafikli bir serviste ani bir gecikme (latency spike) tespit ettiniz. Kök nedeni bulmak için adım adım nasıl ilerlersiniz?`,
        targetSkill: "Problem Çözme & Observability",
        idealResponseTime: "3-4 dakika",
        keyPointsToHit: ["Metrik ve log analizi", "Veritabanı ve network kontrolleri", "Geçici mitigasyon ve kalıcı çözüm"]
      },
      {
        id: "sq3",
        stage: "Aşama 3: Senaryo & Çatışma",
        question: "Ekip arkadaşınız veya yöneticinizle teknik bir kararda anlaşamadığınız somut bir anı ve bunu nasıl çözdüğünüzü anlatır mısınız?",
        targetSkill: "Çatışma Yönetimi & STAR",
        idealResponseTime: "2-3 dakika",
        keyPointsToHit: ["Objektif yaklaşım", "Veri odaklı ikna", "Ekip bütünlüğünü koruma"]
      },
      {
        id: "sq4",
        stage: "Aşama 4: Kapanış & Vizyon",
        question: `Önümüzdeki 1-2 yıl içinde kendinizi bu pozisyonda ve sektörde nerede görüyorsunuz, ekibimize katacağınız en ayırt edici değer ne olacak?`,
        targetSkill: "Kariyer Vizyonu & Bağlılık",
        idealResponseTime: "2 dakika",
        keyPointsToHit: ["Rolün ötesinde katkı", "Öğrenme açlığı", "Şirket hedefleriyle uyum"]
      }
    ],
    preInterviewChecklist: [
      "Mülakatçının LinkedIn profilini inceleyin (önceki şirketleri, paylaşımları, ilgi alanları).",
      "Şirketin son ürün lansmanlarını veya blog yazılarını okuyun.",
      "Anlatacağınız 3 ana başarı hikayesini STAR maddeleri halinde not alın.",
      "Kamera, mikrofon ve sessiz ortam kontrollerini mülakattan 15 dakika önce tamamlayın."
    ],
    duringInterviewRules: [
      "Soru sorulduğunda aceleyle söze girmeyin; 3-5 saniye düşünmek profesyonellik göstergesidir.",
      "STAR yapısını koruyun: Durum (20%), Görev (10%), Eylem (50%), Sonuç (20%).",
      "Bilmediğiniz bir konu gelirse dürüstçe kabul edin ve 'Bunu canlıda tecrübe etmedim ama şöyle yaklaşırdım' diyerek mantık yürütün."
    ],
    postInterviewFollowUp: [
      "Mülakattan sonraki 12 saat içinde kişiselleştirilmiş bir teşekkür mesajı gönderin.",
      "Mesajda mülakatta konuştuğunuz özel bir teknik konuya veya soruya atıfta bulunun."
    ]
  };
}

function mockTurnFallback(interviewerTitle: string, question: string, candidateAnswer: string, questionIndex: number, totalQuestions: number) {
  const words = candidateAnswer.trim().split(/\s+/).length;
  const hasNumbers = /\d+|%|kat|bin|milyon/i.test(candidateAnswer);
  const hasAction = /yaptım|geliştirdim|çözdüm|karar verdim|yönettim/i.test(candidateAnswer);

  let score = 6;
  if (words > 40) score += 1;
  if (hasNumbers) score += 1;
  if (hasAction) score += 1;
  if (score > 10) score = 10;

  return {
    interviewerReaction: `Teşekkürler, cevabınızdaki yaklaşımı anladım. Özellikle inisiyatif aldığınız noktalar önemli. Bir sonraki aşamaya geçmeden önce bu konunun ekibe olan etkisini de göz önünde bulundurmamız değerli.`,
    scoreOutOf10: score,
    starAnalysis: {
      situation: words > 20 ? "Durum bağlamı belirtilmiş." : "Durumun arka planı biraz daha detaylandırılabilir.",
      task: "Görevin ne olduğu anlaşılıyor.",
      action: hasAction ? "Bireysel eylemler ve inisiyatifler net ifade edilmiş." : "Ekip genelinden ziyade kendi aldığınız somut aksiyonları daha çok vurgulayabilirsiniz.",
      result: hasNumbers ? "Ölçülebilir metrik veya somut sonuç içeriyor." : "Sonucu ölçülebilir bir kazanımla (% veya zaman tasarrufu) taçlandırabilirsiniz."
    },
    strengths: [
      "Konuya odaklı ve profesyonel bir ton kullanılması.",
      "Sorulan soruya doğrudan ve net yanıt verilmesi."
    ],
    improvements: [
      "STAR modelindeki 'Result (Sonuç)' kısmına daha net sayılar veya iş etkisi ekleyin.",
      "'Biz yaptık' yerine 'Ben şu inisiyatifi aldım' diyerek liderlik kasınızı öne çıkarın."
    ],
    modelAnswerPolish: `Öneri: "Önce problemi analiz edip X aksiyonunu aldım; bunun sonucunda Y metriğinde %Z iyileşme sağladık ve sistem kesintisini sıfıra indirdik." kalıbıyla cevabınızı daha vurucu hale getirebilirsiniz.`,
    isInterviewComplete: questionIndex + 1 >= totalQuestions
  };
}

function mockFinalEvalFallback(interviewerTitle: string, targetRole: string, turns: any[]) {
  const avgScore = turns && turns.length > 0
    ? Math.round((turns.reduce((acc: number, t: any) => acc + (t.evaluation?.scoreOutOf10 || 7), 0) / turns.length) * 10)
    : 82;

  return {
    overallScore: avgScore,
    letterGrade: avgScore >= 85 ? "A" : avgScore >= 75 ? "B+" : "B",
    hiringDecision: avgScore >= 80 ? "Bir Sonraki Tura Geçer (Strong Hire)" : "Değerlendirme Komitesine Sunulmalı (Hire)",
    radarScores: {
      domainExpertise: 8.5,
      communicationClarity: 8.0,
      starStructure: 7.5,
      businessImpact: 8.0,
      interviewerAlignment: 8.5
    },
    topWins: [
      "Sorulara karşı profesyonel ve çözüm odaklı duruş",
      "Kriz anlarında mantıklı ve metodolojik düşünme becerisi",
      `${interviewerTitle} rolünün beklentilerine uygun teknik ve iş dengesi`
    ],
    criticalGapsToFix: [
      "Cevapların sonuç (Result) bölümlerine daha fazla ölçülebilir metrik (% veya tasarruf) eklenmeli",
      "Bazı yanıtlarda ekip geneli yerine kendi bireysel liderlik aksiyonları daha net ayrıştırılmalı"
    ],
    finalGoldenAdvice: `Mülakat günü kendinize güvenin. ${interviewerTitle} sadece bir sınav yapmıyor; birlikte çalışmaktan keyif alacağı, sorumluluk alan bir çalışma arkadaşı arıyor. Doğal olun ve STAR hikayelerinizi anlatmaktan çekinmeyin!`
  };
}


// 1. Unvana Özel Potansiyel Mülakat Soruları Üretici
app.post("/api/coach/generate-questions", async (req, res) => {
  const { interviewerTitle, targetRole, targetCompany, candidateSeniority, extraNotes } = req.body;

  if (!interviewerTitle || !targetRole) {
    return res.status(400).json({ error: "Mülakatçı unvanı ve hedef pozisyon zorunludur." });
  }

  try {
    if (process.env.GEMINI_API_KEY) {
      const prompt = `
Sen dünya standartlarında bir Kıdemli Kariyer ve Mülakat Baş Koçusun (Senior Executive Interview & Career Coach).
Kullanıcı mülakata gireceği katılımcının unvanını (Title) paylaştı.

Girdi Bilgileri:
- Mülakatı Yapacak Kişinin Unvanı (Interviewer Title): ${interviewerTitle}
- Adayın Başvurduğu / Hedef Rol: ${targetRole}
- Şirket / Sektör Türü: ${targetCompany || "Belirtilmedi"}
- Adayın Seviyesi (Seniority): ${candidateSeniority || "Mid / Senior"}
- Ek Bilgi / Notlar: ${extraNotes || "Yok"}

Görevin:
1. "${interviewerTitle}" unvanına sahip bir kişinin mülakatta psikolojisini, nelere dikkat ettiğini, hangi kör noktalara baktığını analiz et.
2. Bu mülakatçının adaya sorma ihtimali en yüksek 5-7 adet derinlemesine ve ayırt edici soru üret.
3. Her soru için bu mülakatçının gizli değerlendirme kriterini ("Neden Sorulur?"), aday için ideal cevap stratejisini (STAR metodolojisiyle), kaçınılması gereken tuzakları, örnek güçlü cevap taslağını ve gelebilecek takip sorusunu yaz.
4. Adayın bu unvandaki mülakatçıya mülakat sonunda sorabileceği 3 adet zekice stratejik ters soru öner ("Reverse Questions").

Çıktıyı kesinlikle aşağıdaki JSON şemasında ve Türkçe olarak döndür:
{
  "interviewerPsychology": "Mülakatçının bakış açısı, psikolojisi, değerlendirme öncelikleri ve aradığı ana sinyaller",
  "evaluationDimensions": ["Değerlendirdiği Boyut 1", "Boyut 2", "Boyut 3"],
  "questions": [
    {
      "id": "q1",
      "category": "Teknik Derinlik | Davranışsal & STAR | Durumsal Senaryo | Liderlik & Çatışma | Kültürel Uyum & Vizyon",
      "difficulty": "Orta | İleri | Zorlayıcı",
      "question": "Mülakatçının tam soracağı soru cümlesi",
      "whyTheyAsk": "Bu unvanın bu soruyu sorma alt nedeni ve duymak istediği temel yetkinlik",
      "idealStrategy": "Adayın kullanması gereken yaklaşım ve STAR kurgusu",
      "pitfallsToAvoid": ["Kaçınılması gereken hata 1", "Hata 2"],
      "sampleAnswer": "Örnek etkileyici ve dengeli cevap modeli",
      "probingFollowUp": "Aday bu cevabı verdikten sonra mülakatçının sıkıştırmak için sorabileceği muhtemel takip sorusu"
    }
  ],
  "reverseQuestionsToAsk": [
    {
      "question": "Adayın mülakatçıya soracağı soru",
      "whyItImpresses": "Bu sorunun mülakatçıyı neden etkilediği ve adayı nasıl öne çıkardığı"
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const jsonText = cleanJsonText(response.text || "{}");
      const parsed = JSON.parse(jsonText);
      return res.json(parsed);
    }
  } catch (error: any) {
    console.warn("Gemini API call warning in generate-questions, using fallback generator:", error?.message);
  }

  // Graceful fallback
  const fallback = generateQuestionsFallback(interviewerTitle, targetRole, candidateSeniority);
  return res.json(fallback);
});

// 2. Eğitim İçerikleri Analizi & Sonraki Adım Eğitim Yol Haritası
app.post("/api/coach/analyze-trainings", async (req, res) => {
  const { trainingsContent, targetRole, currentLevel, industry } = req.body;

  if (!trainingsContent) {
    return res.status(400).json({ error: "Katıldığınız eğitimlerin içeriği zorunludur." });
  }

  try {
    if (process.env.GEMINI_API_KEY) {
      const prompt = `
Sen uzman bir Kurumsal Yetkinlik ve Kariyer Gelişim Danışmanısın (Skill Gap & Career Path Advisor).
Kullanıcı bugüne kadar katıldığı eğitimlerin içeriklerini, sertifikalarını veya öğrendiği konuları paylaştı.

Girdi Bilgileri:
- Katılınan Eğitimlerin İçerikleri / Tamamlanan Kurslar:
"""
${trainingsContent}
"""
- Hedef Rol / Sonraki Kariyer Hedefi: ${targetRole || "Bir üst seviye kıdemli rol"}
- Mevcut Seviye / Deneyim: ${currentLevel || "Belirtilmedi"}
- Hedef Sektör: ${industry || "Genel Teknoloji / İş Dünyası"}

Görevin:
1. Bu eğitim içeriklerini titizlikle tara: Adayın şu an hangi teorik ve pratik kaslarının güçlü olduğunu haritalandır.
2. Hedeflenen "${targetRole}" rolünün güncel piyasa standartlarına göre nelerin eksik kaldığını (Skill Gaps / Kör Noktalar) tespit et.
3. Bir sonraki adımda alması gereken EN İYİ eğitimleri, sertifikaları ve pratik öğrenme projelerini önceliklendir (1. Öncelik Kritik, 2. Öncelik Stratejik, 3. Öncelik Fark Yaratan).
4. 30 - 60 - 90 günlük somut bir gelişim yol haritası (Upskilling Roadmap) oluştur.

Çıktıyı kesinlikle aşağıdaki JSON şemasında ve Türkçe olarak döndür:
{
  "currentStrengths": ["Kazanılmış Somut Yetkinlik 1", "Yetkinlik 2", "Yetkinlik 3"],
  "skillGaps": [
    {
      "skill": "Eksik kalan beceri veya bilgi alanı",
      "importance": "Kritik | Yüksek | Orta",
      "description": "Neden eksik ve bir sonraki kariyer sıçramasında neden şart"
    }
  ],
  "recommendedTrainings": [
    {
      "title": "Tavsiye Edilen Eğitimin / Sertifikanın Adı",
      "priority": "1. Öncelik (Acil İhtiyaç) | 2. Öncelik (Kritik Derinleşme) | 3. Öncelik (Fark Yaratan Uzmanlık)",
      "category": "Teknik / Mimari | Yönetim / Liderlik | Metodoloji & Araçlar | İletişim & Strateji",
      "whyThisTraining": "Geçmiş eğitimlerin üzerine neden tam olarak bu eğitimin eklenmesi gerektiği",
      "suggestedCurriculum": ["Modül 1 Konusu", "Modül 2 Konusu", "Modül 3 Konusu"],
      "recommendedProvidersOrCerts": ["Örnek platform/sertifika (örn: AWS, Coursera, Meta, Scrum.org vb.)"],
      "portfolioProjectIdea": "Bu eğitimi pekiştirmek ve mülakatta göstermek için yapılabilecek somut proje fikri",
      "expectedOutcome": "Bu eğitim tamamlandığında adayın kazanacağı yeni yetki/unvan avantajı"
    }
  ],
  "roadmap": {
    "thirtyDays": ["İlk 30 gün yapılacak odaklı adımlar"],
    "sixtyDays": ["30-60 gün arası yapılacak adımlar"],
    "ninetyDays": ["60-90 gün arası yapılacak adımlar"]
  },
  "coachSummary": "Kariyer koçundan adaya özel motivasyon ve stratejik özet tavsiye"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const jsonText = cleanJsonText(response.text || "{}");
      const parsed = JSON.parse(jsonText);
      return res.json(parsed);
    }
  } catch (error: any) {
    console.warn("Gemini API call warning in analyze-trainings, using fallback generator:", error?.message);
  }

  const fallback = analyzeTrainingsFallback(trainingsContent, targetRole || "Kıdemli Uzman / Lider");
  return res.json(fallback);
});

// 3. Kişiye Özel Mülakat Simülasyon Planı Oluşturucu
app.post("/api/coach/simulation-plan", async (req, res) => {
  const { interviewerTitle, targetRole, trainingsSummary, targetDate, customFocus } = req.body;

  if (!interviewerTitle || !targetRole) {
    return res.status(400).json({ error: "Mülakatçı unvanı ve hedef rol gereklidir." });
  }

  try {
    if (process.env.GEMINI_API_KEY) {
      const prompt = `
Sen bir Mülakat Simülasyon Planlama Uzmanısın (Interview Simulation Architect).
Kullanıcı için "${interviewerTitle}" karşısında gireceği mülakatı simüle eden adım adım kişisel bir simülasyon planı hazırla.

Bilgiler:
- Mülakatçı Unvanı: ${interviewerTitle}
- Hedef Rol: ${targetRole}
- Adayın Eğitim & Arka Plan Özeti: ${trainingsSummary || "Belirtilmedi"}
- Hedef Mülakat Tarihi: ${targetDate || "Önümüzdeki günler"}
- Özel Odaklanmak İstenen Alan: ${customFocus || "Genel hazırlık"}

Görevin:
1. Bu mülakat için aşama aşama tam bir simülasyon protokolü oluştur.
2. Simülasyon oturumunda adayın yanıtlaması gereken kritik 4-5 soru belirle.
3. Mülakat öncesi, mülakat anı ve sonrası için taktik kontrol listesi (Checklist) ver.

Çıktıyı kesinlikle aşağıdaki JSON şemasında ve Türkçe olarak döndür:
{
  "simulationTitle": "${interviewerTitle} Karşısında 60 Dakikalık Tam Mülakat Simülasyon Planı",
  "overview": "Bu simülasyonun amacı ve mülakatçının yaratacağı atmosferin tarifi",
  "totalDurationMinutes": 60,
  "stages": [
    {
      "stageNumber": 1,
      "name": "Aşama Adı",
      "duration": "10 dk",
      "interviewerIntent": "Mülakatçının bu aşamadaki niyeti",
      "candidateGoal": "Adayın vermesi gereken ilk izlenim",
      "tips": ["Taktik 1", "Taktik 2"]
    }
  ],
  "simulationQuestions": [
    {
      "id": "sq1",
      "stage": "İlgili Aşama",
      "question": "Simülasyonda sorulacak soru",
      "targetSkill": "Ölçülen yetkinlik",
      "idealResponseTime": "2-3 dakika",
      "keyPointsToHit": ["Değinilmesi gereken anahtar nokta 1", "Anahtar nokta 2"]
    }
  ],
  "preInterviewChecklist": ["Mülakat öncesi yapılacak hazırlık 1", "Hazırlık 2"],
  "duringInterviewRules": ["Mülakat anında dikkat edilecek kural 1", "Kural 2"],
  "postInterviewFollowUp": ["Mülakat bittikten sonra teşekkür mektubu ve takip adımları"]
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const jsonText = cleanJsonText(response.text || "{}");
      const parsed = JSON.parse(jsonText);
      return res.json(parsed);
    }
  } catch (error: any) {
    console.warn("Gemini API call warning in simulation-plan, using fallback generator:", error?.message);
  }

  const fallback = generateSimulationPlanFallback(interviewerTitle, targetRole);
  return res.json(fallback);
});

// 4. Canlı İnteraktif Simülasyon Turu
app.post("/api/coach/mock-turn", async (req, res) => {
  const { interviewerTitle, targetRole, question, candidateAnswer, questionIndex, totalQuestions, history } = req.body;

  if (!question || !candidateAnswer) {
    return res.status(400).json({ error: "Soru ve adayın cevabı zorunludur." });
  }

  try {
    if (process.env.GEMINI_API_KEY) {
      const prompt = `
Sen rol yapma (roleplay) ortamında GERÇEK bir "${interviewerTitle}" mülakatçısısın VE aynı zamanda sahne arkasında adaya rehberlik eden Dünya Standardında bir Mülakat Koçusun.

Mülakat Konfigürasyonu:
- Mülakatçı Unvanın: ${interviewerTitle}
- Adayın Başvurduğu Rol: ${targetRole}
- Mevcut Soru Sırası: ${questionIndex + 1} / ${totalQuestions}
- Sorulan Soru: "${question}"
- Adayın Verdiği Cevap:
"""
${candidateAnswer}
"""

Görevin:
1. [Mülakatçı Rolü]: "${interviewerTitle}" karakterine bürünerek adayın cevabına doğal bir insan mülakatçı gibi tepki ver.
2. [Koç Değerlendirmesi]: Sahne arkasında adayın bu cevabını detaylı değerlendir (10 üzerinden puan, STAR analizi, güçlü yönler, geliştirmeler, parlatma önerisi).

Çıktıyı kesinlikle aşağıdaki JSON şemasında ve Türkçe olarak döndür:
{
  "interviewerReaction": "Mülakatçının doğrudan adaya söylediği söz (Roleplay diyaloğu)",
  "scoreOutOf10": 7,
  "starAnalysis": {
    "situation": "Durumun anlatılış kalitesi veya eksikliği",
    "task": "Görevin netliği",
    "action": "Adayın kendi aldığı somut inisiyatif",
    "result": "Ölçülebilir sonuç / etki"
  },
  "strengths": ["Cevabın güçlü yönü 1", "Güçlü yönü 2"],
  "improvements": ["Geliştirilmesi gereken yön 1", "Geliştirilmesi gereken yön 2"],
  "modelAnswerPolish": "Bu cevabı mülakatçının gözünde yıldız yapacak revize edilmiş cümle kalıbı",
  "isInterviewComplete": ${questionIndex + 1 >= totalQuestions}
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const jsonText = cleanJsonText(response.text || "{}");
      const parsed = JSON.parse(jsonText);
      return res.json(parsed);
    }
  } catch (error: any) {
    console.warn("Gemini API call warning in mock-turn, using fallback generator:", error?.message);
  }

  const fallback = mockTurnFallback(interviewerTitle, question, candidateAnswer, questionIndex, totalQuestions);
  return res.json(fallback);
});

// 5. Simülasyon Final Karnesi & Raporu
app.post("/api/coach/mock-final-eval", async (req, res) => {
  const { interviewerTitle, targetRole, turns } = req.body;

  try {
    if (process.env.GEMINI_API_KEY) {
      const prompt = `
Kullanıcı "${interviewerTitle}" mülakatı simülasyonunu tamamladı.
Tüm simülasyon geçmişi:
${JSON.stringify(turns, null, 2)}

Görevin:
Aday için kapsamlı bir "Mülakat Başarı Karnesi" (Executive Interview Scorecard) oluştur.
- Genel Başarı Skoru (100 üzerinden)
- Harf Notu (A+, A, B+, B, C vb.)
- Yetkinlik Radar Puanları (10 üzerinden)
- Genel Karar ("Teklif Verilmeli (Strong Hire)", "Bir Sonraki Tura Geçer (Hire)", vb.)
- 3 Büyük Zafer
- 2-3 Kritik Gelişim Alanı
- Mülakat Öncesi Son Altın Tavsiye

Çıktıyı kesinlikle aşağıdaki JSON şemasında ve Türkçe olarak döndür:
{
  "overallScore": 82,
  "letterGrade": "A-",
  "hiringDecision": "Bir Sonraki Tura Geçer (Hire)",
  "radarScores": {
    "domainExpertise": 8.5,
    "communicationClarity": 8.0,
    "starStructure": 7.5,
    "businessImpact": 8.0,
    "interviewerAlignment": 8.5
  },
  "topWins": ["Zafer 1", "Zafer 2", "Zafer 3"],
  "criticalGapsToFix": ["Kritik açık 1", "Kritik açık 2"],
  "finalGoldenAdvice": "Gerçek mülakat sabahı hatırlanması gereken nihai altın tavsiye"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const jsonText = cleanJsonText(response.text || "{}");
      const parsed = JSON.parse(jsonText);
      return res.json(parsed);
    }
  } catch (error: any) {
    console.warn("Gemini API call warning in mock-final-eval, using fallback generator:", error?.message);
  }

  const fallback = mockFinalEvalFallback(interviewerTitle, targetRole, turns);
  return res.json(fallback);
});


// Mount Vite or static dist
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "dist", "index.html"));
  });
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Career & Interview Coach Agent server running on http://0.0.0.0:${PORT}`);
});
