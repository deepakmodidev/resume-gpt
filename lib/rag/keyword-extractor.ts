import natural from "natural";
import compromise from "compromise";
import { removeStopwords, eng } from "stopword";
import keywordExtractor from "keyword-extractor";

export interface KeywordAnalysis {
  keywords: string[];
  skills: string[];
  entities: string[];
  phrases: string[];
  importance: { [key: string]: number };
}

export class KeywordExtractor {
  private skillsDatabase: Set<string>;
  private industryKeywords: Map<string, string[]>;

  constructor() {
    // Comprehensive skills database
    this.skillsDatabase = new Set([
      // Programming Languages
      "javascript",
      "typescript",
      "python",
      "java",
      "c++",
      "c#",
      "php",
      "ruby",
      "go",
      "rust",
      "swift",
      "kotlin",
      "scala",
      "r",
      "matlab",
      "sql",
      "html",
      "css",
      "bash",
      "powershell",

      // Web Development Skills
      "web development",
      "frontend",
      "backend",
      "full-stack",
      "front-end",
      "back-end",
      "fullstack",
      "responsive design",
      "mobile-first",
      "cross-browser",
      "web applications",
      "websites",

      // Frameworks & Libraries
      "react",
      "angular",
      "vue",
      "svelte",
      "node.js",
      "express",
      "django",
      "flask",
      "spring",
      "laravel",
      "rails",
      "asp.net",
      "jquery",
      "bootstrap",
      "tailwind",
      "next.js",
      "nuxt.js",
      "express.js",
      "fastapi",
      "nestjs",
      "koa",
      "hapi",

      // Databases & Storage
      "mysql",
      "postgresql",
      "mongodb",
      "redis",
      "elasticsearch",
      "sqlite",
      "oracle",
      "cassandra",
      "database",
      "databases",
      "sql",
      "nosql",
      "database design",
      "data modeling",

      // APIs & Web Services
      "rest api",
      "rest",
      "restful",
      "graphql",
      "soap",
      "api",
      "apis",
      "web services",
      "microservices",
      "api design",
      "api development",
      "api integration",

      // Cloud & DevOps
      "aws",
      "azure",
      "gcp",
      "docker",
      "kubernetes",
      "jenkins",
      "gitlab",
      "github actions",
      "terraform",
      "ansible",
      "ci/cd",
      "devops",
      "serverless",
      "deployment",
      "vercel",
      "netlify",
      "heroku",
      "digital ocean",

      // Version Control & Collaboration
      "git",
      "github",
      "gitlab",
      "bitbucket",
      "version control",
      "source control",
      "code review",
      "pull requests",
      "branching",
      "merging",

      // Testing & Quality
      "testing",
      "unit testing",
      "integration testing",
      "test driven development",
      "tdd",
      "jest",
      "mocha",
      "cypress",
      "selenium",
      "debugging",
      "qa",
      "quality assurance",

      // Performance & Optimization
      "optimization",
      "performance",
      "scalability",
      "caching",
      "cdn",
      "lazy loading",
      "code splitting",
      "bundle optimization",
      "seo",
      "accessibility",

      // Data & AI
      "machine learning",
      "deep learning",
      "artificial intelligence",
      "data science",
      "analytics",
      "pandas",
      "numpy",
      "tensorflow",
      "pytorch",
      "scikit-learn",
      "tableau",
      "power bi",

      // Soft Skills
      "leadership",
      "communication",
      "teamwork",
      "collaboration",
      "problem solving",
      "analytical",
      "creative",
      "project management",
      "agile",
      "scrum",
      "strategic planning",
      "customer service",
      "adaptability",
      "attention to detail",
      "time management",
      "critical thinking",
      "innovation",
      "mentoring",
      "cross-functional",

      // Design & UX
      "ui design",
      "ux design",
      "user experience",
      "user interface",
      "figma",
      "sketch",
      "adobe creative suite",
      "photoshop",
      "wireframing",
      "prototyping",

      // Certifications
      "aws certified",
      "azure certified",
      "pmp",
      "cissp",
      "comptia",
      "google cloud",
      "certified scrum master",
      "itil",
      "six sigma",

      // Industry-specific
      "e-commerce",
      "fintech",
      "healthcare",
      "education",
      "saas",
      "startup",
      "enterprise",
      "b2b",
      "b2c",
      "mvp",
    ]);

    this.industryKeywords = new Map([
      [
        "technology",
        [
          "api",
          "rest",
          "graphql",
          "microservices",
          "architecture",
          "scalability",
          "performance",
        ],
      ],
      [
        "finance",
        [
          "financial modeling",
          "risk management",
          "compliance",
          "audit",
          "derivatives",
          "trading",
        ],
      ],
      [
        "marketing",
        [
          "seo",
          "sem",
          "social media",
          "content marketing",
          "digital marketing",
          "roi",
          "conversion",
        ],
      ],
      [
        "healthcare",
        [
          "hipaa",
          "patient care",
          "medical records",
          "clinical",
          "pharmaceutical",
          "regulatory",
        ],
      ],
      [
        "education",
        [
          "curriculum",
          "pedagogy",
          "assessment",
          "learning outcomes",
          "instructional design",
        ],
      ],
      [
        "retail",
        [
          "inventory",
          "supply chain",
          "pos",
          "customer experience",
          "merchandising",
          "sales",
        ],
      ],
    ]);
  }

  extractKeywords(
    text: string,
    options: {
      includeSkills?: boolean;
      includeEntities?: boolean;
      maxKeywords?: number;
    } = {},
  ): KeywordAnalysis {
    const {
      includeSkills = true,
      includeEntities = true,
      maxKeywords = 50,
    } = options;

    const cleanText = this.cleanText(text);

    const keywords = this.extractGeneralKeywords(cleanText, maxKeywords);
    const skills = includeSkills ? this.extractSkills(cleanText) : [];
    const entities = includeEntities ? this.extractEntities(text) : [];
    const phrases = this.extractPhrases(cleanText);
    const importance = this.calculateImportance(keywords, skills);

    return {
      keywords,
      skills,
      entities,
      phrases,
      importance,
    };
  }

  private cleanText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s.-]/g, " ") // Keep dots and hyphens for skills like "node.js" and "machine-learning"
      .replace(/\s+/g, " ")
      .trim();
  }

  private extractGeneralKeywords(text: string, maxKeywords: number): string[] {
    // Define stop words and irrelevant terms to filter out
    const STOP_WORDS = new Set([
      // Common job posting words that aren't skills
      "job",
      "title",
      "position",
      "role",
      "location",
      "remote",
      "city",
      "country",
      "state",
      "office",
      "work",
      "working",
      "hours",
      "time",
      "full",
      "part",
      "contract",
      "temporary",
      "permanent",
      "salary",
      "pay",
      "benefits",
      "company",
      "organization",
      "team",
      "member",
      "employee",
      "candidate",
      "applicant",
      "hiring",
      "recruitment",
      "about",
      "description",
      "overview",
      "summary",
      "responsibilities",
      "requirements",
      "qualifications",
      "skills",
      "experience",
      "years",
      "level",
      "senior",
      "junior",
      "entry",
      "mid",
      "lead",
      "manager",
      "director",
      "head",
      "chief",
      "executive",
      "assistant",
      "associate",
      "specialist",
      "coordinator",
      "analyst",
      "developer",
      "engineer",
      "designer",
      "architect",

      // Generic business terms
      "business",
      "industry",
      "sector",
      "market",
      "customer",
      "client",
      "service",
      "product",
      "solution",
      "project",
      "projects",
      "task",
      "tasks",
      "process",
      "processes",

      // Common action words
      "develop",
      "build",
      "create",
      "design",
      "implement",
      "maintain",
      "manage",
      "lead",
      "support",
      "help",
      "assist",
      "collaborate",
      "communicate",
      "coordinate",
      "organize",
      "plan",
      "execute",
      "deliver",
      "provide",
      "ensure",
      "improve",
      "optimize",
      "enhance",
      "troubleshoot",
      "debug",
      "test",
      "review",
      "analyze",
      "research",
      "learn",
      "understand",
      "solve",
      "problems",
      "problem",

      // Generic descriptors
      "good",
      "great",
      "excellent",
      "outstanding",
      "strong",
      "solid",
      "effective",
      "efficient",
      "successful",
      "proven",
      "experienced",
      "skilled",
      "talented",
      "qualified",
      "capable",
      "able",
      "fast",
      "quick",
      "new",
      "latest",
      "current",
      "modern",
      "innovative",
      "creative",
      "practical",
      "real",
      "world",
      "startup",
      "growing",
      "established",
      "leading",
      "top",

      // Time and quantity
      "day",
      "days",
      "week",
      "weeks",
      "month",
      "months",
      "year",
      "years",
      "daily",
      "weekly",
      "monthly",
      "multiple",
      "various",
      "different",
      "several",
      "many",
      "opportunity",
      "opportunities",
      "growth",
      "learning",
      "flexible",
      "internship",
      "full-time",
      "fast-growing",
    ]);

    // Use keyword-extractor library but filter results
    const extracted1 = keywordExtractor
      .extract(text, {
        language: "english",
        remove_digits: false,
        return_changed_case: true,
        remove_duplicates: true,
      })
      .filter((keyword) => {
        const lowerKeyword = keyword.toLowerCase();

        // Skip stop words
        if (STOP_WORDS.has(lowerKeyword)) return false;

        // Keep technical terms that are in our skills database
        if (this.skillsDatabase.has(lowerKeyword)) return true;

        // Keep words that look technical (contain numbers, dots, or meaningful hyphens)
        if (/\d/.test(keyword)) return true; // Contains numbers like "html5", "es6"
        if (/\w+\.\w+/.test(keyword)) return true; // Contains dots like "node.js"
        if (/\w+-\w+/.test(keyword) && keyword.length > 6) return true; // Meaningful hyphens

        // Keep capitalized acronyms
        if (/^[A-Z]{2,}$/.test(keyword)) return true; // Like "API", "REST"

        // Keep if it's a compound technical term
        if (keyword.length > 8 && /^[a-z]+$/i.test(keyword)) return true;

        return false;
      });

    // Method 2: TF-IDF using natural (also filtered)
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text) || [];
    const filtered = removeStopwords(tokens, eng).filter(
      (token) => !STOP_WORDS.has(token.toLowerCase()) && token.length > 2,
    );

    const tfidf = new natural.TfIdf();
    tfidf.addDocument(filtered);

    const tfidfKeywords: Array<{ term: string; score: number }> = [];
    tfidf.listTerms(0).forEach((item) => {
      if (item.term.length > 2 && !STOP_WORDS.has(item.term.toLowerCase())) {
        tfidfKeywords.push({ term: item.term, score: item.tfidf });
      }
    });

    // Combine and deduplicate
    const allKeywords = new Set([
      ...extracted1.slice(0, maxKeywords / 2),
      ...tfidfKeywords
        .sort((a, b) => b.score - a.score)
        .slice(0, maxKeywords / 2)
        .map((k) => k.term),
    ]);

    return Array.from(allKeywords).slice(0, maxKeywords);
  }

  private extractSkills(text: string): string[] {
    const skills: string[] = [];

    this.skillsDatabase.forEach((skill) => {
      // Create flexible regex that handles variations
      const skillPattern = skill
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // Escape special chars
        .replace(/\s+/g, "[\\s.-]*"); // Allow spaces, dots, hyphens

      const regex = new RegExp(`\\b${skillPattern}\\b`, "i");
      if (regex.test(text)) {
        skills.push(skill);
      }
    });

    // Also check for common variations
    const variations: { [key: string]: string[] } = {
      javascript: ["js", "ecmascript", "es6+", "es6"],
      typescript: ["ts"],
      "node.js": ["nodejs", "node"],
      "react.js": ["reactjs", "react"],
      "vue.js": ["vuejs", "vue"],
      "next.js": ["nextjs", "next"],
      "express.js": ["expressjs", "express"],
      "c++": ["cpp", "cplusplus"],
      "c#": ["csharp", "c sharp"],
      "machine learning": ["ml", "machine-learning"],
      "artificial intelligence": ["ai", "artificial-intelligence"],
      "user experience": ["ux", "ux design"],
      "user interface": ["ui", "ui design"],
      "web development": ["web dev", "frontend", "backend", "full-stack"],
      frontend: ["front-end", "client-side"],
      backend: ["back-end", "server-side"],
      "full-stack": ["fullstack", "full stack"],
      database: ["databases", "db"],
      "rest api": ["rest", "restful", "api"],
      "version control": ["git", "github", "source control"],
      "problem solving": ["problem-solving", "analytical thinking"],
      teamwork: ["collaboration", "team collaboration"],
      "responsive design": ["responsive", "mobile-first"],
      optimization: ["optimize", "performance tuning"],
      testing: ["unit testing", "test driven development"],
      deployment: ["deploy", "ci/cd", "devops"],
      scalability: ["scalable", "large-scale"],
      html5: ["html"],
      css3: ["css"],
      mongodb: ["mongo"],
      postgresql: ["postgres"],
      mysql: ["sql"],
      graphql: ["graph ql"],
      "tailwind css": ["tailwind"],
      bootstrap: ["bootstrap css"],
      aws: ["amazon web services"],
      gcp: ["google cloud platform"],
      azure: ["microsoft azure"],
    };

    Object.entries(variations).forEach(([main, vars]) => {
      if (!skills.includes(main)) {
        vars.forEach((variant) => {
          const regex = new RegExp(
            `\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
            "i",
          );
          if (regex.test(text)) {
            skills.push(main);
          }
        });
      }
    });

    return [...new Set(skills)];
  }

  private extractEntities(text: string): string[] {
    const doc = compromise(text);
    const entities: string[] = [];

    // Extract different types of entities
    entities.push(...doc.organizations().out("array"));
    entities.push(...doc.people().out("array"));
    entities.push(...doc.places().out("array"));

    // Extract potential company names (capitalized words)
    const companyPattern = /\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\b/g;
    const matches = text.match(companyPattern) || [];
    entities.push(...matches);

    return [...new Set(entities)]
      .filter((entity) => entity.length > 2)
      .slice(0, 20);
  }

  private extractPhrases(text: string): string[] {
    const doc = compromise(text);
    const phrases: string[] = [];

    // Extract noun phrases (potential skills/technologies)
    phrases.push(...doc.nouns().out("array"));

    // Extract adjective + noun combinations
    phrases.push(...doc.match("#Adjective #Noun").out("array"));

    // Extract technical phrases (word + word.extension)
    const techPhrases = text.match(/\b\w+\.\w+\b/g) || [];
    phrases.push(...techPhrases);

    return [...new Set(phrases)]
      .filter((phrase) => phrase.length > 3 && phrase.length < 30)
      .slice(0, 15);
  }

  private calculateImportance(
    keywords: string[],
    skills: string[],
  ): { [key: string]: number } {
    const importance: { [key: string]: number } = {};

    // Skills get higher importance
    skills.forEach((skill) => {
      importance[skill] = 0.9;
    });

    // Keywords get moderate importance
    keywords.forEach((keyword) => {
      if (!importance[keyword]) {
        importance[keyword] = 0.6;
      }
    });

    return importance;
  }

  calculateKeywordMatch(
    resumeKeywords: string[],
    jobKeywords: string[],
  ): {
    matchScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    criticalMissing: string[];
  } {
    const normalizeKeyword = (keyword: string) => keyword.toLowerCase().trim();

    // Create synonym and similarity mappings
    const synonyms: { [key: string]: string[] } = {
      "web development": [
        "frontend",
        "backend",
        "full-stack",
        "web applications",
        "websites",
      ],
      frontend: [
        "front-end",
        "ui development",
        "client-side",
        "web development",
      ],
      backend: [
        "back-end",
        "server-side",
        "api development",
        "web development",
      ],
      "full-stack": [
        "fullstack",
        "full stack",
        "web development",
        "frontend",
        "backend",
      ],
      javascript: ["js", "ecmascript", "web development", "frontend"],
      typescript: ["ts", "javascript", "web development"],
      react: ["reactjs", "react.js", "frontend", "javascript"],
      "node.js": ["nodejs", "node", "backend", "javascript"],
      "express.js": ["express", "expressjs", "backend", "node.js"],
      databases: ["database", "sql", "nosql", "mongodb", "mysql", "postgresql"],
      "rest api": ["rest", "api", "restful", "web services", "backend"],
      "version control": ["git", "github", "gitlab", "source control"],
      deployment: ["deploy", "devops", "ci/cd", "vercel", "aws"],
      "problem solving": [
        "problem-solving",
        "analytical",
        "troubleshooting",
        "debugging",
      ],
      teamwork: [
        "collaboration",
        "team player",
        "cooperative",
        "team collaboration",
      ],
      communication: ["verbal", "written", "presentation", "documentation"],
      responsive: [
        "mobile-friendly",
        "responsive design",
        "mobile",
        "cross-platform",
      ],
      optimization: ["optimize", "performance", "speed", "efficiency"],
      testing: ["test", "debugging", "qa", "quality assurance"],
      scalable: ["scalability", "performance", "architecture", "large-scale"],
    };

    const resumeSet = new Set(resumeKeywords.map(normalizeKeyword));
    const jobSet = new Set(jobKeywords.map(normalizeKeyword));

    const matched: string[] = [];
    const missing: string[] = [];

    // Enhanced matching logic
    for (const jobKeyword of jobSet) {
      let isMatched = false;

      // 1. Exact match
      if (resumeSet.has(jobKeyword)) {
        matched.push(jobKeyword);
        isMatched = true;
        continue;
      }

      // 2. Fuzzy/partial matching
      for (const resumeKeyword of resumeSet) {
        if (this.isFuzzyMatch(jobKeyword, resumeKeyword)) {
          matched.push(jobKeyword);
          isMatched = true;
          break;
        }
      }

      if (isMatched) continue;

      // 3. Synonym matching
      const jobSynonyms = synonyms[jobKeyword] || [];
      for (const synonym of jobSynonyms) {
        if (resumeSet.has(synonym)) {
          matched.push(jobKeyword);
          isMatched = true;
          break;
        }
      }

      if (isMatched) continue;

      // 4. Reverse synonym matching (check if resume keyword is synonym of job keyword)
      for (const resumeKeyword of resumeSet) {
        const resumeSynonyms = synonyms[resumeKeyword] || [];
        if (resumeSynonyms.includes(jobKeyword)) {
          matched.push(jobKeyword);
          isMatched = true;
          break;
        }
      }

      if (!isMatched) {
        missing.push(jobKeyword);
      }
    }

    // Identify critical missing keywords with better logic
    const criticalMissing = missing.filter(
      (keyword) =>
        this.skillsDatabase.has(keyword) ||
        keyword.includes("required") ||
        keyword.includes("must") ||
        keyword.includes("essential") ||
        // Prioritize technical skills and frameworks
        this.isTechnicalSkill(keyword),
    );

    // Weighted scoring - give more weight to technical skills matches
    let weightedScore = 0;
    let totalWeight = 0;

    for (const keyword of jobSet) {
      const weight = this.getKeywordWeight(keyword);
      totalWeight += weight;

      if (matched.includes(keyword)) {
        weightedScore += weight;
      }
    }

    const matchScore =
      totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;

    return {
      matchScore: Math.round(matchScore * 100) / 100,
      matchedKeywords: [...new Set(matched)],
      missingKeywords: [...new Set(missing)],
      criticalMissing: [...new Set(criticalMissing)],
    };
  }

  private isFuzzyMatch(keyword1: string, keyword2: string): boolean {
    // Check for partial matches and common variations
    const k1 = keyword1.toLowerCase();
    const k2 = keyword2.toLowerCase();

    // If one contains the other and they're both substantial
    if (k1.length > 3 && k2.length > 3) {
      if (k1.includes(k2) || k2.includes(k1)) {
        return true;
      }
    }

    // Check for common variations
    const variations: Array<[string, string]> = [
      ["javascript", "js"],
      ["typescript", "ts"],
      ["node.js", "nodejs"],
      ["react.js", "reactjs"],
      ["express.js", "expressjs"],
      ["front-end", "frontend"],
      ["back-end", "backend"],
      ["full-stack", "fullstack"],
      ["database", "databases"],
      ["api", "apis"],
      ["web app", "web application"],
      ["mobile", "responsive"],
    ];

    for (const [var1, var2] of variations) {
      if ((k1 === var1 && k2 === var2) || (k1 === var2 && k2 === var1)) {
        return true;
      }
    }

    return false;
  }

  private isTechnicalSkill(keyword: string): boolean {
    const technicalTerms = [
      "html",
      "css",
      "javascript",
      "typescript",
      "react",
      "node",
      "express",
      "database",
      "api",
      "git",
      "deployment",
      "testing",
      "optimization",
      "responsive",
      "scalable",
      "performance",
      "sql",
      "nosql",
      "mongodb",
      "mysql",
      "postgresql",
      "aws",
      "vercel",
      "ci/cd",
      "devops",
    ];

    return technicalTerms.some((term) => keyword.toLowerCase().includes(term));
  }

  private getKeywordWeight(keyword: string): number {
    // Technical skills get higher weight
    if (this.isTechnicalSkill(keyword) || this.skillsDatabase.has(keyword)) {
      return 1.5;
    }

    // Important soft skills
    const importantSoftSkills = [
      "problem solving",
      "teamwork",
      "communication",
      "leadership",
    ];
    if (
      importantSoftSkills.some((skill) => keyword.toLowerCase().includes(skill))
    ) {
      return 1.2;
    }

    // Regular keywords
    return 1.0;
  }

  // Get keywords for specific industry
  getIndustryKeywords(industry: string): string[] {
    return this.industryKeywords.get(industry.toLowerCase()) || [];
  }

  // Suggest where to add keywords in resume
  suggestKeywordPlacement(
    resumeText: string,
    missingKeywords: string[],
  ): Array<{
    keyword: string;
    section: string;
    suggestion: string;
  }> {
    const suggestions: Array<{
      keyword: string;
      section: string;
      suggestion: string;
    }> = [];

    missingKeywords.forEach((keyword) => {
      if (this.skillsDatabase.has(keyword)) {
        suggestions.push({
          keyword,
          section: "Skills",
          suggestion: `Add "${keyword}" to your technical skills section`,
        });
      } else if (keyword.includes("management") || keyword.includes("lead")) {
        suggestions.push({
          keyword,
          section: "Experience",
          suggestion: `Incorporate "${keyword}" into your work experience descriptions`,
        });
      } else {
        suggestions.push({
          keyword,
          section: "Summary",
          suggestion: `Consider mentioning "${keyword}" in your professional summary`,
        });
      }
    });

    return suggestions.slice(0, 10); // Limit to top 10 suggestions
  }
}
