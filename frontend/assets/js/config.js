// ── API ───────────────────────────────────────────────────────────────────────

const API_BASE = "https://curriculum-bot-ranker.onrender.com";
const API_URL  = `${API_BASE}/candidates/`;

// ── Avatar Colors ─────────────────────────────────────────────────────────────

const avatarColors = [
  { bg: "#1e1d3a", color: "#a89ff8" },
  { bg: "#0d2a2a", color: "#5dcaa5" },
  { bg: "#2a1a1a", color: "#f0997b" },
  { bg: "#1a2014", color: "#97c459" },
  { bg: "#2a1a28", color: "#ed93b1" },
  { bg: "#1a1e2e", color: "#6ba3f5" },
  { bg: "#241a10", color: "#e0a060" },
  { bg: "#0f1e24", color: "#4ec9c9" },
];

// ── Ranking ───────────────────────────────────────────────────────────────────

const RANKING_MAP = {
  "ÓTIMO":   { badgeClass: "badge-high", label: "Ótimo"   },
  "BOM":     { badgeClass: "badge-mid",  label: "Bom"     },
  "REGULAR": { badgeClass: "badge-low",  label: "Regular" },
  "FRACO":   { badgeClass: "badge-weak", label: "Fraco"   },
};

// ── Vagas ─────────────────────────────────────────────────────────────────────

const VAGAS = [
  // Tecnologia
  { label: "Dev Back-end",         keywords: ["python", "java", "node.js", "c#", ".net", "ruby", "php", "go", "rust", "api", "rest", "graphql", "microsserviços", "backend"] },
  { label: "Dev Front-end",        keywords: ["react", "vue", "angular", "javascript", "typescript", "html", "css", "next.js", "nuxt", "tailwind", "frontend"] },
  { label: "Dev Mobile",           keywords: ["flutter", "react native", "swift", "kotlin", "android", "ios", "mobile", "dart"] },
  { label: "DevOps / Infra",       keywords: ["docker", "kubernetes", "terraform", "aws", "azure", "gcp", "ci/cd", "github actions", "jenkins", "linux", "devops", "sre", "cloud"] },
  { label: "Dados / BI",           keywords: ["python", "sql", "airflow", "spark", "hadoop", "etl", "power bi", "tableau", "looker", "dbt", "bigquery", "redshift", "engenharia de dados", "analytics", "bi"] },
  { label: "Ciência de Dados",     keywords: ["machine learning", "deep learning", "scikit-learn", "tensorflow", "pytorch", "nlp", "estatística", "r", "data science", "inteligência artificial", "ia"] },
  { label: "UX / Design",          keywords: ["figma", "ux", "ui", "user research", "prototyping", "wireframe", "design system", "adobe xd", "sketch", "product design"] },
  { label: "QA / Testes",          keywords: ["qa", "testes", "selenium", "cypress", "jest", "qualidade", "automação de testes", "bdd", "tdd"] },
  { label: "Segurança (Cyber)",    keywords: ["segurança", "cybersecurity", "pentest", "soc", "siem", "firewall", "criptografia", "compliance", "iso 27001"] },
  { label: "Product Manager",      keywords: ["product", "pm", "roadmap", "scrum", "agile", "kanban", "jira", "okr", "discovery", "produto"] },

  // Negócios & Gestão
  { label: "Administração",        keywords: ["administração", "gestão", "processos", "planejamento", "erp", "sap", "excel", "rotinas administrativas"] },
  { label: "Financeiro",           keywords: ["finanças", "financeiro", "fluxo de caixa", "contas a pagar", "contas a receber", "conciliação", "tesouraria", "excel", "sap"] },
  { label: "Contabilidade",        keywords: ["contabilidade", "contador", "fiscal", "tributário", "dctf", "sped", "irpj", "csll", "balancete", "crc"] },
  { label: "Controladoria",        keywords: ["controladoria", "controller", "orçamento", "forecast", "budget", "demonstrações financeiras", "gaap", "ifrs"] },
  { label: "Recursos Humanos",     keywords: ["rh", "recursos humanos", "recrutamento", "seleção", "folha de pagamento", "dp", "treinamento", "hrbp", "people", "clt"] },
  { label: "Jurídico",             keywords: ["direito", "jurídico", "advogado", "contratos", "compliance", "trabalhista", "tributário", "societário", "oab"] },
  { label: "Marketing",            keywords: ["marketing", "seo", "google ads", "meta ads", "mídia paga", "redes sociais", "branding", "copywriting", "crm", "inbound"] },
  { label: "Vendas / Comercial",   keywords: ["vendas", "comercial", "crm", "salesforce", "prospecção", "b2b", "b2c", "sdr", "account executive", "inside sales"] },
  { label: "Projetos (PMO)",       keywords: ["pmo", "gerente de projetos", "pmp", "prince2", "scrum", "agile", "cronograma", "gestão de projetos", "ms project"] },
  { label: "Logística / Supply",   keywords: ["logística", "supply chain", "estoque", "wms", "erp", "transporte", "armazém", "compras", "procurement", "s&op"] },

  // Engenharia & Indústria
  { label: "Eng. Civil",           keywords: ["civil", "obras", "autocad", "revit", "estrutural", "topografia", "orçamento", "construção", "crea"] },
  { label: "Eng. Elétrica",        keywords: ["elétrica", "eletricidade", "automação", "clp", "plc", "inversores", "quadro elétrico", "projetos elétricos", "nr10", "crea"] },
  { label: "Eng. Mecânica",        keywords: ["mecânica", "solidworks", "autocad", "manutenção", "projetos mecânicos", "manufatura", "crea", "cnc"] },
  { label: "Eng. Química",         keywords: ["química", "processos", "refinaria", "petroquímica", "iso 9001", "laboratório", "crea"] },
  { label: "Eng. de Produção",     keywords: ["produção", "lean", "six sigma", "melhoria contínua", "kaizen", "5s", "pcp", "chão de fábrica"] },
  { label: "Manutenção",           keywords: ["manutenção", "preventiva", "corretiva", "preditiva", "eletromecânica", "pcm", "cmms", "totvs"] },
  { label: "Qualidade",            keywords: ["qualidade", "iso 9001", "abnt", "auditoria", "bpf", "fda", "anvisa", "seis sigma", "kaizen"] },

  // Saúde
  { label: "Médico",               keywords: ["medicina", "médico", "crm", "clínica", "hospital", "cid", "prescrição", "plantão"] },
  { label: "Enfermagem",           keywords: ["enfermagem", "enfermeiro", "coren", "uti", "assistência", "curativo", "triagem", "plantão"] },
  { label: "Farmácia",             keywords: ["farmácia", "farmacêutico", "crf", "dispensação", "manipulação", "anvisa", "bpf"] },
  { label: "Psicologia",           keywords: ["psicologia", "psicólogo", "crp", "terapia", "saúde mental", "avaliação psicológica"] },
  { label: "Fisioterapia",         keywords: ["fisioterapia", "fisioterapeuta", "crefito", "reabilitação", "ortopedia", "rpg"] },
  { label: "Nutrição",             keywords: ["nutrição", "nutricionista", "cfn", "dieta", "alimentação", "saúde"] },

  // Educação
  { label: "Professor",            keywords: ["professor", "docente", "pedagogia", "licenciatura", "ensino", "didática", "plano de aula"] },
  { label: "Coordenação Pedagóg.", keywords: ["coordenação", "pedagógico", "currículo", "bncc", "gestão escolar"] },

  // Outros
  { label: "Atendimento / CS",     keywords: ["atendimento", "suporte", "customer success", "cs", "helpdesk", "n1", "n2", "zendesk", "freshdesk", "satisfação"] },
  { label: "Arquitetura",          keywords: ["arquitetura", "arquiteto", "revit", "autocad", "bim", "cau", "projeto arquitetônico"] },
  { label: "Comunicação / PR",     keywords: ["comunicação", "relações públicas", "assessoria", "imprensa", "jornalismo", "press release"] },
];
