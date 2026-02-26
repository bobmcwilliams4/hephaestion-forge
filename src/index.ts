/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║       HEPHAESTION FORGE v2.0.0 — SOVEREIGN CODE SUPREMACY EDITION     ║
 * ║       "THE AI IS THE BUILDER — FROM SPEECH TO SHIPPED SOFTWARE"       ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  Authority: 9.5 (HEPHAESTION) → 9.85 (CLAUDE) → 11.0 (COMMANDER)    ║
 * ║  Pipeline: 13 stages × 6 quality gates × multi-LLM swarm             ║
 * ║  Types: 15 project archetypes with language-aware scaffolding         ║
 * ║  LLM: Azure GPT-4.1 (free), DeepSeek, Groq, Grok, OpenRouter        ║
 * ║  Standards: SOVEREIGN_CODE_SUPREMACY v1.0 — /dominate mode           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Hephaestion — Alexander's finest general and master builder. As he built
 * the siege engines and infrastructure that conquered the known world,
 * this forge builds production software from conversational descriptions.
 */

// ═══════════════════════════════════════════════════════════════════════════
// ENVIRONMENT BINDINGS — Cloudflare Worker Runtime
// ═══════════════════════════════════════════════════════════════════════════

interface Env {
  FORGE_PROJECTS: KVNamespace;
  TEMPLATE_CACHE: KVNamespace;
  DB: D1Database;
  BUILD_OUTPUT: R2Bucket;
  AZURE_API_KEY?: string;
  GITHUB_TOKEN?: string;
  ECHO_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  GROQ_API_KEY?: string;
  XAI_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  ENGINE_RUNTIME: Fetcher;
  VERSION: string;
  SERVICE_NAME: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS — Strict, explicit, no implicit any
// ═══════════════════════════════════════════════════════════════════════════

type ProjectType =
  | 'PYTHON_APP' | 'ELECTRON_APP' | 'WEB_APP' | 'CLI_TOOL'
  | 'MCP_SERVER' | 'API_SERVICE' | 'GUI_APPLICATION'
  | 'AUTOMATION_SCRIPT' | 'CLOUDFLARE_WORKER' | 'DISCORD_BOT'
  | 'TELEGRAM_BOT' | 'BROWSER_EXTENSION' | 'MOBILE_APP'
  | 'CHROME_EXTENSION' | 'VSCODE_EXTENSION';

type ProjectStatus = 'queued' | 'analyzing' | 'scaffolding' | 'building' | 'testing' | 'reviewing' | 'complete' | 'failed';
type StageStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
type QualityGrade = 'A' | 'B' | 'C' | 'D' | 'F';
type LLMProvider = 'azure' | 'deepseek' | 'groq' | 'grok' | 'openrouter' | 'workers-ai';

interface ForgeProject {
  id: string;
  userId: string;
  name: string;
  description: string;
  initialRequest: string;
  projectType: ProjectType;
  language: string;
  framework: string;
  status: ProjectStatus;
  currentStage: number;
  totalStages: number;
  stageResults: StageResult[];
  qualityScores: QualityScore[];
  filesGenerated: number;
  linesOfCode: number;
  testsPassing: number;
  testsTotal: number;
  architectureDecisions: ArchitectureDecision[];
  dependencies: DependencyRecommendation[];
  deploymentConfig: DeploymentConfig | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

interface StageResult {
  stage: number;
  name: string;
  status: StageStatus;
  result: Record<string, unknown> | null;
  score: number;
  durationMs: number;
  llmProvider: string;
  tokensUsed: number;
  timestamp: string;
}

interface QualityScore {
  category: string;
  score: number;
  grade: QualityGrade;
  issues: QualityIssue[];
  recommendations: string[];
}

interface QualityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  message: string;
  file: string | null;
  line: number | null;
  fix: string | null;
}

interface ArchitectureDecision {
  id: string;
  title: string;
  context: string;
  decision: string;
  rationale: string;
  alternatives: string[];
  consequences: string[];
  timestamp: string;
}

interface DependencyRecommendation {
  name: string;
  version: string;
  purpose: string;
  alternatives: string[];
  license: string;
  weeklyDownloads: number | null;
  securityAdvisories: number;
}

interface DeploymentConfig {
  target: 'cloudflare' | 'vercel' | 'docker' | 'gcp' | 'aws';
  files: Record<string, string>;
  commands: string[];
  envVars: string[];
}

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
  lines: number;
  purpose: string;
}

interface LLMResponse {
  content: string;
  provider: LLMProvider;
  model: string;
  tokensUsed: number;
  latencyMs: number;
}

interface ErrorResponse {
  error: string;
  code: string;
  status: number;
  details?: unknown;
  timestamp: string;
  requestId: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS — Named, configurable, zero magic numbers
// ═══════════════════════════════════════════════════════════════════════════

const SERVICE_VERSION = '2.0.0';
const MAX_PROJECT_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 10000;
const MAX_CODE_INPUT_LENGTH = 500000;
const LLM_TIMEOUT_MS = 60000;
const RATE_LIMIT_WINDOW_S = 60;
const RATE_LIMIT_MAX_REQUESTS = 120;
const CORS_ALLOWED_ORIGINS = ['https://echo-ept.com', 'https://echo-op.com', 'http://localhost:3000'];

// ═══════════════════════════════════════════════════════════════════════════
// ENGINE RUNTIME INTEGRATION — 2,632 engines, 202,751 doctrines
// ═══════════════════════════════════════════════════════════════════════════

const ENGINE_RUNTIME_URL = 'https://echo-engine-runtime.bmcii1976.workers.dev';

// Map project types to relevant engine domain categories
const PROJECT_TYPE_TO_ENGINE_CATEGORIES: Record<string, string[]> = {
  PYTHON_APP:          ['PROG', 'DEVOPS', 'TEST', 'SAAS'],
  ELECTRON_APP:        ['PROG', 'UIUX', 'DESKTOP', 'TEST'],
  WEB_APP:             ['WEBAPP', 'UIUX', 'PROG', 'SAAS', 'CLOUD'],
  CLI_TOOL:            ['PROG', 'DEVOPS', 'TEST'],
  MCP_SERVER:          ['PROG', 'AIML', 'CLOUD', 'DEVOPS'],
  API_SERVICE:         ['PROG', 'CLOUD', 'DEVOPS', 'NET', 'SAAS'],
  GUI_APPLICATION:     ['PROG', 'UIUX', 'DESKTOP', 'TEST'],
  AUTOMATION_SCRIPT:   ['PROG', 'DEVOPS', 'DATENG', 'TEST'],
  CLOUDFLARE_WORKER:   ['CLOUD', 'PROG', 'DEVOPS', 'NET', 'SAAS'],
  DISCORD_BOT:         ['PROG', 'CLOUD', 'NET'],
  TELEGRAM_BOT:        ['PROG', 'CLOUD', 'NET'],
  BROWSER_EXTENSION:   ['WEBAPP', 'UIUX', 'PROG', 'CYBER'],
  MOBILE_APP:          ['MOBILE', 'UIUX', 'PROG', 'TEST'],
  CHROME_EXTENSION:    ['WEBAPP', 'UIUX', 'PROG', 'CYBER'],
  VSCODE_EXTENSION:    ['PROG', 'DEVOPS', 'UIUX'],
  GENERAL:             ['PROG', 'DEVOPS', 'CLOUD', 'TEST'],
};

// Map programming topics to engine categories for intelligence queries
const TOPIC_TO_ENGINE_CATEGORIES: Record<string, string[]> = {
  security:       ['CYBER', 'PROG', 'NET'],
  database:       ['DATENG', 'PROG', 'CLOUD'],
  testing:        ['TEST', 'PROG', 'DEVOPS'],
  deployment:     ['DEVOPS', 'CLOUD', 'SAAS'],
  architecture:   ['PROG', 'CLOUD', 'SAAS', 'DEVOPS'],
  performance:    ['PROG', 'CLOUD', 'NET'],
  ai:             ['AIML', 'DATENG', 'PROG'],
  machine_learning: ['AIML', 'DATENG', 'PROG'],
  frontend:       ['WEBAPP', 'UIUX', 'PROG'],
  mobile:         ['MOBILE', 'UIUX', 'PROG'],
  api:            ['PROG', 'NET', 'CLOUD'],
  devops:         ['DEVOPS', 'CLOUD', 'PROG'],
  microservices:  ['CLOUD', 'DEVOPS', 'NET', 'PROG'],
  blockchain:     ['CRYPTO', 'PROG', 'CYBER'],
  gamedev:        ['GAMEDEV', 'PROG', 'UIUX'],
};

// ═══════════════════════════════════════════════════════════════════════════
// BUILD PIPELINE — 13 stages with quality gates
// ═══════════════════════════════════════════════════════════════════════════

interface PipelineStage {
  stage: number;
  code: string;
  name: string;
  description: string;
  isGate: boolean;
  timeTargetS: number;
}

const PIPELINE_STAGES: PipelineStage[] = [
  { stage: 1,  code: 'REQ',   name: 'Requirements Analysis',    description: 'Parse request, identify project type, language, framework, features', isGate: false, timeTargetS: 15 },
  { stage: 2,  code: 'ARCH',  name: 'Architecture Design',      description: 'Select blueprint, define modules, data flow, API contracts', isGate: true, timeTargetS: 30 },
  { stage: 3,  code: 'SCAFF', name: 'Scaffold Generation',      description: 'Create directory structure, config files, base modules', isGate: false, timeTargetS: 20 },
  { stage: 4,  code: 'CORE',  name: 'Core Implementation',      description: 'Build business logic, services, repositories, models', isGate: false, timeTargetS: 120 },
  { stage: 5,  code: 'API',   name: 'API / Routes',             description: 'Build HTTP endpoints, middleware, validation, error handlers', isGate: true, timeTargetS: 60 },
  { stage: 6,  code: 'UI',    name: 'UI / Frontend',            description: 'Build components, pages, layouts, styling, interactions', isGate: false, timeTargetS: 90 },
  { stage: 7,  code: 'DATA',  name: 'Data Models & Migrations', description: 'Define schemas, ORMs, migrations, seed data', isGate: false, timeTargetS: 30 },
  { stage: 8,  code: 'TEST',  name: 'Test Suite',               description: 'Write unit, integration, e2e tests with 80%+ coverage target', isGate: true, timeTargetS: 45 },
  { stage: 9,  code: 'DOCS',  name: 'Documentation',            description: 'Generate README, AI_GUIDE, USER_GUIDE, CHANGELOG, API docs', isGate: false, timeTargetS: 20 },
  { stage: 10, code: 'DEPLOY', name: 'Deployment Config',       description: 'Generate Docker, CI/CD, wrangler.toml, vercel.json, env files', isGate: false, timeTargetS: 15 },
  { stage: 11, code: 'SEC',   name: 'Security Hardening',       description: 'Input validation, auth, CORS, rate limiting, secrets management', isGate: true, timeTargetS: 30 },
  { stage: 12, code: 'QUAL',  name: 'Quality Gates',            description: 'Lint, type-check, security scan, complexity analysis, perf audit', isGate: true, timeTargetS: 20 },
  { stage: 13, code: 'FINAL', name: 'Final Review',             description: 'Competitive assessment, Enhancement Matrix sweep, sovereign check', isGate: true, timeTargetS: 15 },
];

// ═══════════════════════════════════════════════════════════════════════════
// PROJECT ARCHETYPES — Templates with smart defaults
// ═══════════════════════════════════════════════════════════════════════════

interface ProjectArchetype {
  type: ProjectType;
  defaultLanguage: string;
  defaultFramework: string;
  blueprint: 'A' | 'B' | 'C';
  suggestedDeps: string[];
  fileStructure: string[];
  mandatoryFiles: string[];
  deployTarget: 'cloudflare' | 'vercel' | 'docker';
  description: string;
}

const PROJECT_ARCHETYPES: Record<ProjectType, ProjectArchetype> = {
  PYTHON_APP: {
    type: 'PYTHON_APP', defaultLanguage: 'python', defaultFramework: 'fastapi', blueprint: 'A',
    suggestedDeps: ['fastapi', 'uvicorn', 'pydantic', 'loguru', 'httpx', 'tenacity'],
    fileStructure: ['src/', 'tests/', 'scripts/', 'docs/'],
    mandatoryFiles: ['README.md', 'AI_GUIDE.md', 'pyproject.toml', '.env.example', 'Dockerfile'],
    deployTarget: 'docker', description: 'Python backend service with FastAPI',
  },
  ELECTRON_APP: {
    type: 'ELECTRON_APP', defaultLanguage: 'typescript', defaultFramework: 'electron', blueprint: 'B',
    suggestedDeps: ['electron', 'electron-builder', 'react', 'zustand', 'tailwindcss'],
    fileStructure: ['src/main/', 'src/renderer/', 'src/preload/', 'tests/'],
    mandatoryFiles: ['README.md', 'AI_GUIDE.md', 'package.json', 'electron-builder.yml'],
    deployTarget: 'docker', description: 'Desktop application with Electron + React',
  },
  WEB_APP: {
    type: 'WEB_APP', defaultLanguage: 'typescript', defaultFramework: 'nextjs', blueprint: 'B',
    suggestedDeps: ['next', 'react', 'tailwindcss', 'zustand', 'zod', 'framer-motion'],
    fileStructure: ['src/app/', 'src/components/', 'src/lib/', 'src/hooks/', 'public/'],
    mandatoryFiles: ['README.md', 'AI_GUIDE.md', 'package.json', 'next.config.ts', '.env.example'],
    deployTarget: 'vercel', description: 'Next.js full-stack web application',
  },
  CLI_TOOL: {
    type: 'CLI_TOOL', defaultLanguage: 'python', defaultFramework: 'click', blueprint: 'A',
    suggestedDeps: ['click', 'rich', 'loguru', 'pydantic', 'httpx'],
    fileStructure: ['src/', 'tests/', 'docs/'],
    mandatoryFiles: ['README.md', 'pyproject.toml', '.env.example'],
    deployTarget: 'docker', description: 'Command-line tool with rich output',
  },
  MCP_SERVER: {
    type: 'MCP_SERVER', defaultLanguage: 'python', defaultFramework: 'mcp', blueprint: 'A',
    suggestedDeps: ['mcp', 'httpx', 'pydantic', 'loguru'],
    fileStructure: ['src/', 'tests/'],
    mandatoryFiles: ['README.md', 'AI_GUIDE.md', 'pyproject.toml'],
    deployTarget: 'docker', description: 'Model Context Protocol server for Claude Desktop',
  },
  API_SERVICE: {
    type: 'API_SERVICE', defaultLanguage: 'python', defaultFramework: 'fastapi', blueprint: 'A',
    suggestedDeps: ['fastapi', 'uvicorn', 'pydantic', 'sqlalchemy', 'alembic', 'loguru', 'httpx', 'tenacity', 'pybreaker'],
    fileStructure: ['src/api/', 'src/core/', 'src/integrations/', 'tests/', 'scripts/', 'docs/adr/'],
    mandatoryFiles: ['README.md', 'AI_GUIDE.md', 'USER_GUIDE.md', 'CHANGELOG.md', 'pyproject.toml', 'Dockerfile', '.env.example'],
    deployTarget: 'docker', description: 'Production API service with full observability',
  },
  GUI_APPLICATION: {
    type: 'GUI_APPLICATION', defaultLanguage: 'python', defaultFramework: 'pyqt6', blueprint: 'A',
    suggestedDeps: ['PyQt6', 'loguru', 'pydantic'],
    fileStructure: ['src/ui/', 'src/core/', 'src/resources/', 'tests/'],
    mandatoryFiles: ['README.md', 'pyproject.toml'],
    deployTarget: 'docker', description: 'Desktop GUI application',
  },
  AUTOMATION_SCRIPT: {
    type: 'AUTOMATION_SCRIPT', defaultLanguage: 'python', defaultFramework: 'none', blueprint: 'A',
    suggestedDeps: ['loguru', 'httpx', 'pydantic', 'schedule'],
    fileStructure: ['src/', 'config/', 'logs/'],
    mandatoryFiles: ['README.md', '.env.example'],
    deployTarget: 'docker', description: 'Automation script with scheduling',
  },
  CLOUDFLARE_WORKER: {
    type: 'CLOUDFLARE_WORKER', defaultLanguage: 'typescript', defaultFramework: 'hono', blueprint: 'C',
    suggestedDeps: ['hono', 'zod', '@cloudflare/workers-types'],
    fileStructure: ['src/', 'src/routes/', 'src/middleware/', 'src/services/', 'src/models/', 'tests/'],
    mandatoryFiles: ['README.md', 'AI_GUIDE.md', 'wrangler.toml', 'package.json', 'tsconfig.json'],
    deployTarget: 'cloudflare', description: 'Edge API on Cloudflare Workers with Hono',
  },
  DISCORD_BOT: {
    type: 'DISCORD_BOT', defaultLanguage: 'python', defaultFramework: 'discord.py', blueprint: 'A',
    suggestedDeps: ['discord.py', 'loguru', 'pydantic', 'httpx', 'aiosqlite'],
    fileStructure: ['src/cogs/', 'src/core/', 'tests/'],
    mandatoryFiles: ['README.md', '.env.example', 'Dockerfile'],
    deployTarget: 'docker', description: 'Discord bot with slash commands and cogs',
  },
  TELEGRAM_BOT: {
    type: 'TELEGRAM_BOT', defaultLanguage: 'python', defaultFramework: 'python-telegram-bot', blueprint: 'A',
    suggestedDeps: ['python-telegram-bot', 'loguru', 'pydantic', 'httpx'],
    fileStructure: ['src/handlers/', 'src/core/', 'tests/'],
    mandatoryFiles: ['README.md', '.env.example', 'Dockerfile'],
    deployTarget: 'docker', description: 'Telegram bot with conversation handlers',
  },
  BROWSER_EXTENSION: {
    type: 'BROWSER_EXTENSION', defaultLanguage: 'typescript', defaultFramework: 'plasmo', blueprint: 'B',
    suggestedDeps: ['plasmo', 'react', 'tailwindcss', 'zustand'],
    fileStructure: ['src/popup/', 'src/background/', 'src/content/', 'src/options/'],
    mandatoryFiles: ['README.md', 'package.json', 'manifest.json'],
    deployTarget: 'docker', description: 'Browser extension with popup and background scripts',
  },
  MOBILE_APP: {
    type: 'MOBILE_APP', defaultLanguage: 'typescript', defaultFramework: 'react-native', blueprint: 'B',
    suggestedDeps: ['react-native', 'expo', 'zustand', 'react-navigation', 'nativewind'],
    fileStructure: ['src/screens/', 'src/components/', 'src/hooks/', 'src/lib/', 'src/navigation/'],
    mandatoryFiles: ['README.md', 'app.json', 'package.json'],
    deployTarget: 'docker', description: 'Mobile app with Expo and React Native',
  },
  CHROME_EXTENSION: {
    type: 'CHROME_EXTENSION', defaultLanguage: 'typescript', defaultFramework: 'vite', blueprint: 'B',
    suggestedDeps: ['vite', 'react', 'tailwindcss', '@crxjs/vite-plugin'],
    fileStructure: ['src/popup/', 'src/background/', 'src/content/', 'src/options/'],
    mandatoryFiles: ['README.md', 'manifest.json', 'package.json', 'vite.config.ts'],
    deployTarget: 'docker', description: 'Chrome extension with Vite build system',
  },
  VSCODE_EXTENSION: {
    type: 'VSCODE_EXTENSION', defaultLanguage: 'typescript', defaultFramework: 'vscode', blueprint: 'A',
    suggestedDeps: ['@types/vscode', 'esbuild'],
    fileStructure: ['src/', 'tests/', 'syntaxes/', 'snippets/'],
    mandatoryFiles: ['README.md', 'package.json', 'tsconfig.json', '.vscodeignore'],
    deployTarget: 'docker', description: 'VS Code extension',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// LANGUAGE DATABASE — Patterns, conventions, quality standards
// ═══════════════════════════════════════════════════════════════════════════

interface LanguageProfile {
  name: string;
  extensions: string[];
  lintTool: string;
  formatTool: string;
  testFramework: string;
  typeChecker: string | null;
  packageManager: string;
  buildTool: string | null;
  mandatoryPatterns: string[];
  antiPatterns: string[];
}

const LANGUAGE_PROFILES: Record<string, LanguageProfile> = {
  python: {
    name: 'Python', extensions: ['.py'], lintTool: 'ruff', formatTool: 'ruff format',
    testFramework: 'pytest', typeChecker: 'mypy', packageManager: 'pip', buildTool: null,
    mandatoryPatterns: ['loguru logging', 'pathlib.Path', 'type hints', 'pydantic models', 'async/await', 'context managers'],
    antiPatterns: ['print()', 'os.path', 'bare except', 'mutable defaults', 'global state', 'import *'],
  },
  typescript: {
    name: 'TypeScript', extensions: ['.ts', '.tsx'], lintTool: 'eslint', formatTool: 'prettier',
    testFramework: 'vitest', typeChecker: 'tsc', packageManager: 'npm', buildTool: 'esbuild',
    mandatoryPatterns: ['strict mode', 'explicit types', 'zod validation', 'error boundaries', 'typed fetch'],
    antiPatterns: ['any type', 'console.log in prod', 'ignored return values', 'nested callbacks >3'],
  },
  javascript: {
    name: 'JavaScript', extensions: ['.js', '.jsx'], lintTool: 'eslint', formatTool: 'prettier',
    testFramework: 'vitest', typeChecker: null, packageManager: 'npm', buildTool: 'esbuild',
    mandatoryPatterns: ['JSDoc types', 'const/let only', 'strict mode', 'error handling'],
    antiPatterns: ['var', 'console.log in prod', 'eval()', '=='],
  },
  rust: {
    name: 'Rust', extensions: ['.rs'], lintTool: 'clippy', formatTool: 'rustfmt',
    testFramework: 'cargo test', typeChecker: null, packageManager: 'cargo', buildTool: 'cargo',
    mandatoryPatterns: ['Result types', 'ownership rules', 'lifetime annotations', 'error enums'],
    antiPatterns: ['unwrap() in prod', 'unsafe without comment', 'clone() everywhere'],
  },
  go: {
    name: 'Go', extensions: ['.go'], lintTool: 'golangci-lint', formatTool: 'gofmt',
    testFramework: 'go test', typeChecker: null, packageManager: 'go mod', buildTool: 'go build',
    mandatoryPatterns: ['error handling', 'context propagation', 'interfaces', 'goroutine safety'],
    antiPatterns: ['panic in lib code', 'global vars', 'init() overuse', 'ignoring errors'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// FRAMEWORK TEMPLATES — Scaffold generators
// ═══════════════════════════════════════════════════════════════════════════

interface FrameworkTemplate {
  name: string;
  language: string;
  entryPoint: string;
  configFiles: Record<string, string>;
  scaffoldDirs: string[];
  healthCheckPattern: string;
}

const FRAMEWORK_TEMPLATES: Record<string, FrameworkTemplate> = {
  fastapi: {
    name: 'FastAPI', language: 'python', entryPoint: 'src/main.py',
    configFiles: {
      'pyproject.toml': `[project]\nname = "{name}"\nversion = "1.0.0"\nrequires-python = ">=3.11"\ndependencies = [\n  "fastapi>=0.115",\n  "uvicorn[standard]>=0.34",\n  "pydantic>=2.10",\n  "loguru>=0.7",\n  "httpx>=0.28",\n  "tenacity>=9.0",\n]\n\n[project.optional-dependencies]\ndev = ["pytest>=8.0", "pytest-asyncio>=0.24", "pytest-cov>=6.0", "ruff>=0.9", "mypy>=1.14"]`,
      '.env.example': '# {name} Environment Variables\n# Copy to .env and fill in values\n\nAPP_ENV=development\nAPP_PORT=8000\nAPP_LOG_LEVEL=INFO\n# DATABASE_URL=\n# API_KEY=',
    },
    scaffoldDirs: ['src', 'src/api', 'src/api/v1', 'src/api/v1/endpoints', 'src/api/middleware', 'src/core', 'src/core/models', 'src/core/services', 'tests', 'tests/unit', 'tests/integration', 'scripts', 'docs', 'docs/adr'],
    healthCheckPattern: '@app.get("/health")\nasync def health():\n    return {"status": "healthy", "version": "{version}", "service": "{name}"}',
  },
  hono: {
    name: 'Hono', language: 'typescript', entryPoint: 'src/index.ts',
    configFiles: {
      'wrangler.toml': 'name = "{name}"\nmain = "src/index.ts"\ncompatibility_date = "2024-12-01"\n\n[vars]\nVERSION = "1.0.0"\nSERVICE_NAME = "{name}"',
      'tsconfig.json': '{\n  "compilerOptions": {\n    "target": "ESNext",\n    "module": "ESNext",\n    "moduleResolution": "Bundler",\n    "lib": ["ESNext"],\n    "types": ["@cloudflare/workers-types"],\n    "strict": true,\n    "noEmit": true,\n    "skipLibCheck": true\n  },\n  "include": ["src/**/*.ts"]\n}',
    },
    scaffoldDirs: ['src', 'src/routes', 'src/middleware', 'src/services', 'src/models', 'tests'],
    healthCheckPattern: 'app.get("/health", (c) => c.json({ status: "healthy", version: "{version}", service: "{name}" }))',
  },
  nextjs: {
    name: 'Next.js', language: 'typescript', entryPoint: 'src/app/page.tsx',
    configFiles: {
      'next.config.ts': 'import type { NextConfig } from "next";\n\nconst config: NextConfig = {\n  reactStrictMode: true,\n};\n\nexport default config;',
      'tailwind.config.ts': 'import type { Config } from "tailwindcss";\n\nconst config: Config = {\n  content: ["./src/**/*.{ts,tsx}"],\n  theme: { extend: {} },\n  plugins: [],\n};\n\nexport default config;',
    },
    scaffoldDirs: ['src/app', 'src/components', 'src/components/ui', 'src/lib', 'src/hooks', 'src/stores', 'src/types', 'public', 'tests'],
    healthCheckPattern: 'export async function GET() {\n  return Response.json({ status: "healthy", version: "{version}" });\n}',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// QUALITY GATES — Enhancement Matrix categories for code
// ═══════════════════════════════════════════════════════════════════════════

interface QualityGateDefinition {
  id: string;
  name: string;
  category: string;
  checks: string[];
  minScore: number;
  weight: number;
}

const QUALITY_GATES: QualityGateDefinition[] = [
  {
    id: 'CAT1-CODE', name: 'Code Quality', category: 'FOUNDATIONS',
    checks: ['type_safety', 'error_handling', 'dry', 'solid', 'naming', 'modularity', 'no_dead_code', 'no_magic_numbers'],
    minScore: 7.0, weight: 1.5,
  },
  {
    id: 'CAT3-SEC', name: 'Security', category: 'FOUNDATIONS',
    checks: ['input_validation', 'auth', 'secrets_management', 'xss_prevention', 'sqli_prevention', 'rate_limiting', 'cors'],
    minScore: 8.0, weight: 2.0,
  },
  {
    id: 'CAT2-PERF', name: 'Performance', category: 'PERFORMANCE',
    checks: ['async_patterns', 'caching', 'lazy_loading', 'connection_pooling', 'query_optimization', 'bundle_size'],
    minScore: 7.0, weight: 1.0,
  },
  {
    id: 'CAT5-ARCH', name: 'Architecture', category: 'ARCHITECTURE',
    checks: ['separation_of_concerns', 'dependency_injection', 'api_design', 'extensibility', 'clean_layers'],
    minScore: 7.5, weight: 1.5,
  },
  {
    id: 'CAT7-TEST', name: 'Testing', category: 'TESTING',
    checks: ['unit_tests', 'integration_tests', 'coverage_80pct', 'test_naming', 'fixtures', 'mocking'],
    minScore: 7.0, weight: 1.0,
  },
  {
    id: 'CAT8-DOCS', name: 'Documentation', category: 'DOCUMENTATION',
    checks: ['readme', 'ai_guide', 'docstrings', 'env_example', 'changelog', 'api_docs'],
    minScore: 7.0, weight: 0.8,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN PATTERNS DATABASE
// ═══════════════════════════════════════════════════════════════════════════

interface DesignPattern {
  name: string;
  category: string;
  languages: string[];
  useWhen: string;
  structure: string;
  example: string;
}

const DESIGN_PATTERNS: DesignPattern[] = [
  { name: 'Repository Pattern', category: 'data-access', languages: ['python', 'typescript'], useWhen: 'Abstracting data access from business logic', structure: 'Interface → Implementation → Service injects', example: 'class UserRepository(Protocol):\n    async def get(self, id: str) -> User: ...' },
  { name: 'Factory Pattern', category: 'creational', languages: ['python', 'typescript'], useWhen: 'Creating objects without specifying exact class', structure: 'Factory function/class returns interface type', example: 'def create_handler(type: str) -> Handler: ...' },
  { name: 'Strategy Pattern', category: 'behavioral', languages: ['python', 'typescript'], useWhen: 'Swappable algorithms at runtime', structure: 'Strategy interface → concrete implementations → context uses', example: 'class SortStrategy(Protocol):\n    def sort(self, data: list) -> list: ...' },
  { name: 'Observer Pattern', category: 'behavioral', languages: ['python', 'typescript'], useWhen: 'Event-driven decoupled communication', structure: 'EventEmitter → subscribers → async notifications', example: 'event_bus.on("user.created", handle_welcome_email)' },
  { name: 'Circuit Breaker', category: 'resilience', languages: ['python', 'typescript'], useWhen: 'Protecting against cascading failures from external services', structure: 'Closed → Open (on failures) → Half-Open (probe) → Closed', example: '@circuit_breaker(fail_max=5, reset_timeout=30)' },
  { name: 'Middleware Chain', category: 'structural', languages: ['python', 'typescript'], useWhen: 'Cross-cutting concerns (auth, logging, rate limiting)', structure: 'Request → Middleware1 → Middleware2 → Handler → Response', example: 'app.use(cors()).use(auth()).use(rateLimit())' },
  { name: 'Builder Pattern', category: 'creational', languages: ['python', 'typescript'], useWhen: 'Complex object construction with many optional fields', structure: 'Builder.setX().setY().build() → validated object', example: 'QueryBuilder().select("*").where("id", 1).limit(10).build()' },
  { name: 'Adapter Pattern', category: 'structural', languages: ['python', 'typescript'], useWhen: 'Integrating incompatible interfaces', structure: 'Adapter wraps Adaptee, exposes Target interface', example: 'class LegacyAPIAdapter implements ModernAPI { ... }' },
];

// ═══════════════════════════════════════════════════════════════════════════
// SOVEREIGN CODE SUPREMACY — Quality Standards from Megaprompt v1.0
// Extracted from I:\PROMPT_TEMPLATES\SOVEREIGN_CODE_SUPREMACY_MEGAPROMPT_v1.0.md
// These constants are injected into every LLM code-generation and review call
// ═══════════════════════════════════════════════════════════════════════════

const SOVEREIGN_BLACKLIST = `ABSOLUTE BLACKLIST — code containing ANY of these is rejected:
- print() for logging → use structured logger (loguru/winston/pino)
- String path concatenation → use pathlib.Path / path.join()
- Bare except:/catch(e){} → catch specific exceptions
- Hardcoded secrets/API keys → environment variables or vault
- Magic numbers → named constants or config
- Mutable default arguments → def f(x: list | None = None)
- Global mutable state → dependency injection or context
- sleep() in async → asyncio.sleep() / await delay()
- requests in async → httpx.AsyncClient / fetch()
- Manual JSON construction → Pydantic model_dump / Zod schema
- SQL string interpolation → parameterized queries ALWAYS
- eval()/exec() → NEVER under any circumstance
- import * → explicit imports only
- TODO/FIXME/HACK in shipped code → fix it or file an issue
- Commented-out code → delete it, git remembers
- Functions > 50 lines → decompose into focused helpers
- Files > 500 lines → split into modules
- Nested callbacks > 3 levels → flatten with async/await
- any/Any type without justification → find the real type
- Ignoring return values → handle or explicitly discard
- Missing input validation on APIs → validate at boundary
- No error response schema → typed error models with codes
- Deployment without /health → health endpoint is MANDATORY
- No README → README.md is the front door
- console.log in production → structured logging or remove`;

const SOVEREIGN_QUALITY_GATE = `COMPETITIVE QUALITY GATE — answer YES to ALL before shipping:
1. Would a senior FAANG engineer approve this in code review?
2. Could this survive a production incident at 3AM?
3. Is every function typed with args, returns, and class attributes?
4. Does every API endpoint validate input with typed schemas?
5. Are errors handled with specific exceptions and recovery paths?
6. Is there a /health endpoint returning structured status?
7. Could a junior dev understand this codebase in 6 months?
8. Is there a single hardcoded value anywhere? (Extract to config)
9. Are all cross-cutting concerns (auth, logging, CORS) middleware?
10. Is test coverage >= 80% on critical paths?`;

const ENHANCEMENT_MATRIX_CATEGORIES: Record<string, string[]> = {
  'CAT1-CODE': ['type_safety', 'error_handling', 'dry', 'solid', 'naming', 'modularity', 'no_dead_code', 'no_magic_numbers', 'design_patterns', 'refactoring'],
  'CAT2-PERF': ['async_patterns', 'caching', 'lazy_loading', 'connection_pooling', 'query_optimization', 'bundle_size', 'profiling', 'memory', 'compression'],
  'CAT3-SEC': ['input_validation', 'auth', 'secrets_management', 'xss_prevention', 'sqli_prevention', 'rate_limiting', 'cors', 'csrf', 'zero_trust', 'audit_log'],
  'CAT4-UIUX': ['responsive', 'accessibility', 'loading_states', 'error_states', 'empty_states', 'dark_mode', 'animations', 'navigation'],
  'CAT5-ARCH': ['separation_of_concerns', 'dependency_injection', 'api_design', 'extensibility', 'clean_layers', 'scalability', 'event_driven'],
  'CAT6-RELIABLE': ['health_checks', 'retry_logic', 'circuit_breakers', 'graceful_degradation', 'monitoring', 'alerting', 'backups'],
  'CAT7-TEST': ['unit_tests', 'integration_tests', 'coverage_80pct', 'test_naming', 'fixtures', 'mocking', 'e2e_tests', 'regression'],
  'CAT8-DOCS': ['readme', 'ai_guide', 'docstrings', 'env_example', 'changelog', 'api_docs', 'adr'],
  'CAT9-DEVOPS': ['ci_cd', 'docker', 'secrets_rotation', 'config_management', 'gitops', 'cost_optimization'],
  'CAT10-DATA': ['validation', 'sanitization', 'migration', 'indexing', 'query_opt', 'privacy', 'encryption'],
  'CAT11-INTEGR': ['api_versioning', 'idempotency', 'pagination', 'webhooks', 'rate_limiting', 'caching'],
  'CAT12-NET': ['cdn', 'ssl_tls', 'http2', 'waf', 'ddos_protection', 'load_balancing'],
  'CAT13-OBSERVE': ['structured_logging', 'metrics', 'tracing', 'dashboards', 'anomaly_detection', 'error_budgets'],
  'CAT14-DX': ['onboarding', 'hot_reload', 'templates', 'cli', 'debugging', 'linting', 'formatting'],
};

function buildSovereignContext(mode: 'generate' | 'review' | 'security' | 'architecture'): string {
  const base = `\n\n--- SOVEREIGN CODE SUPREMACY STANDARDS ---\n${SOVEREIGN_BLACKLIST}`;
  if (mode === 'generate') {
    return base + `\n\nGenerate code that passes ALL items in this quality gate:\n${SOVEREIGN_QUALITY_GATE}`;
  }
  if (mode === 'review') {
    return base + `\n\nReview against these quality gates:\n${SOVEREIGN_QUALITY_GATE}\nScore each category (CAT1-CODE through CAT14-DX) on a 1-10 scale.`;
  }
  if (mode === 'security') {
    return base + '\n\nApply CAT3-SEC checks: input_validation, auth, secrets_management, xss, sqli, rate_limiting, cors, csrf, zero_trust, audit_log.';
  }
  return base; // architecture mode
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS — Pure, tested, reusable
// ═══════════════════════════════════════════════════════════════════════════

function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const segments = [8, 4, 4];
  return segments.map(len =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  ).join('-');
}

function sanitize(input: string, maxLen: number): string {
  return input.replace(/[<>'"]/g, '').trim().slice(0, maxLen);
}

function nowISO(): string {
  return new Date().toISOString();
}

function makeError(error: string, code: string, status: number, details?: unknown): ErrorResponse {
  return { error, code, status, details, timestamp: nowISO(), requestId: generateId() };
}

function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ENGINE RUNTIME QUERY — Fetch doctrines from 2,632 engines
// ═══════════════════════════════════════════════════════════════════════════

interface EngineDoctrineResult {
  doctrines: Array<{ topic: string; conclusion: string; confidence: number; engine_id: string; domain: string }>;
  total: number;
  categories: string[];
}

async function queryEngineRuntime(query: string, projectType: string, env: Env, limit: number = 5): Promise<EngineDoctrineResult> {
  const categories = PROJECT_TYPE_TO_ENGINE_CATEGORIES[projectType] || PROJECT_TYPE_TO_ENGINE_CATEGORIES.GENERAL;
  const empty: EngineDoctrineResult = { doctrines: [], total: 0, categories };

  for (const cat of categories) {
    try {
      const url = `${ENGINE_RUNTIME_URL}/domain/${cat}/query?q=${encodeURIComponent(query.slice(0, 200))}&limit=${limit}`;
      const resp = await env.ENGINE_RUNTIME.fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!resp.ok) continue;
      const data = await resp.json() as { ok?: boolean; matches?: Array<{ topic?: string; conclusion?: string; confidence?: string; engine_id?: string; engine_name?: string; score?: number }> };
      if (data.ok && data.matches && data.matches.length > 0) {
        return {
          doctrines: data.matches.map(r => ({
            topic: r.topic ?? 'Unknown',
            conclusion: r.conclusion ?? '',
            confidence: r.score ?? 0.5,
            engine_id: r.engine_id ?? '',
            domain: cat,
          })),
          total: data.matches.length,
          categories,
        };
      }
    } catch { /* continue to next category */ }
  }
  return empty;
}

async function queryTopicDoctrines(query: string, topic: string, env: Env, limit: number = 3): Promise<string> {
  const categories = TOPIC_TO_ENGINE_CATEGORIES[topic.toLowerCase()] || ['PROG', 'DEVOPS'];
  for (const cat of categories) {
    try {
      const url = `${ENGINE_RUNTIME_URL}/domain/${cat}/query?q=${encodeURIComponent(query.slice(0, 200))}&limit=${limit}`;
      const resp = await env.ENGINE_RUNTIME.fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!resp.ok) continue;
      const data = await resp.json() as { ok?: boolean; matches?: Array<{ topic?: string; conclusion?: string; engine_id?: string; score?: number }> };
      if (data.ok && data.matches && data.matches.length > 0) {
        return data.matches.map(r => `[${r.engine_id} | ${r.topic}]: ${r.conclusion}`).join('\n');
      }
    } catch { /* continue */ }
  }
  return '';
}

function buildDoctrineContext(doctrines: EngineDoctrineResult): string {
  if (doctrines.doctrines.length === 0) return '';
  const lines = doctrines.doctrines.map(d =>
    `[ENGINE ${d.engine_id} | ${d.domain} | confidence: ${(d.confidence * 100).toFixed(0)}%]\n${d.topic}: ${d.conclusion}`
  );
  return `\n\n═══ ECHO ENGINE RUNTIME DOCTRINE ENRICHMENT (${doctrines.total} blocks from ${doctrines.categories.join(', ')}) ═══\n${lines.join('\n\n')}\n═══ END DOCTRINE ENRICHMENT ═══`;
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && CORS_ALLOWED_ORIGINS.some(o => origin.startsWith(o)) ? origin : CORS_ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Echo-API-Key, X-User-Id, X-Request-Id',
    'Access-Control-Max-Age': '86400',
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LLM DISPATCH — Multi-provider with failover
// ═══════════════════════════════════════════════════════════════════════════

async function callLLM(
  prompt: string,
  systemPrompt: string,
  env: Env,
  provider: LLMProvider = 'azure',
  maxTokens: number = 4096,
  temperature: number = 0.3,
): Promise<LLMResponse> {
  const start = Date.now();

  const providers: Array<{ provider: LLMProvider; url: string; model: string; key: string | undefined; headers: Record<string, string> }> = [
    {
      provider: 'azure', url: 'https://models.inference.ai.azure.com/chat/completions',
      model: 'gpt-4.1', key: env.GITHUB_TOKEN,
      headers: { 'Authorization': `Bearer ${env.GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
    },
    {
      provider: 'deepseek', url: 'https://api.deepseek.com/v1/chat/completions',
      model: 'deepseek-chat', key: env.DEEPSEEK_API_KEY,
      headers: { 'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
    },
    {
      provider: 'groq', url: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'llama-3.3-70b-versatile', key: env.GROQ_API_KEY,
      headers: { 'Authorization': `Bearer ${env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    },
  ];

  const selected = providers.find(p => p.provider === provider) ?? providers[0];
  if (!selected.key) {
    const fallback = providers.find(p => p.key);
    if (!fallback) {
      return { content: '[LLM unavailable — no API keys configured]', provider, model: 'none', tokensUsed: 0, latencyMs: Date.now() - start };
    }
    return callLLM(prompt, systemPrompt, env, fallback.provider, maxTokens, temperature);
  }

  const body = {
    model: selected.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    max_tokens: maxTokens,
    temperature,
  };

  const resp = await fetch(selected.url, {
    method: 'POST',
    headers: selected.headers,
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const fallback = providers.find(p => p.provider !== selected.provider && p.key);
    if (fallback) {
      return callLLM(prompt, systemPrompt, env, fallback.provider, maxTokens, temperature);
    }
    return { content: `[LLM error: ${resp.status}]`, provider: selected.provider, model: selected.model, tokensUsed: 0, latencyMs: Date.now() - start };
  }

  const json = await resp.json() as { choices?: Array<{ message?: { content?: string } }>; usage?: { total_tokens?: number } };
  const content = json.choices?.[0]?.message?.content ?? '';
  const tokens = json.usage?.total_tokens ?? 0;

  return { content, provider: selected.provider, model: selected.model, tokensUsed: tokens, latencyMs: Date.now() - start };
}

// Multi-LLM swarm — dispatch same prompt to N providers, score results
async function llmSwarm(
  prompt: string,
  systemPrompt: string,
  env: Env,
  providers: LLMProvider[] = ['azure', 'deepseek', 'groq'],
): Promise<{ responses: LLMResponse[]; best: LLMResponse }> {
  const responses = await Promise.allSettled(
    providers.map(p => callLLM(prompt, systemPrompt, env, p, 4096, 0.3))
  );

  const results: LLMResponse[] = responses
    .filter((r): r is PromiseFulfilledResult<LLMResponse> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(r => r.content.length > 10);

  if (results.length === 0) {
    const fallback: LLMResponse = { content: '[All LLM providers failed]', provider: 'azure', model: 'none', tokensUsed: 0, latencyMs: 0 };
    return { responses: [fallback], best: fallback };
  }

  // Score by content length + has code blocks + speed
  const scored = results.map(r => ({
    response: r,
    score: (r.content.length / 1000) + (r.content.includes('```') ? 5 : 0) + (1000 / Math.max(r.latencyMs, 1)),
  }));
  scored.sort((a, b) => b.score - a.score);

  return { responses: results, best: scored[0].response };
}

// ═══════════════════════════════════════════════════════════════════════════
// PROJECT TYPE DETECTION — Heuristic NLP analysis
// ═══════════════════════════════════════════════════════════════════════════

function detectProjectType(request: string): { type: ProjectType; language: string; framework: string; confidence: number } {
  const lower = request.toLowerCase();
  const keywords: Array<{ patterns: string[]; type: ProjectType; language: string; framework: string; weight: number }> = [
    { patterns: ['cloudflare worker', 'edge function', 'wrangler', 'hono worker'], type: 'CLOUDFLARE_WORKER', language: 'typescript', framework: 'hono', weight: 10 },
    { patterns: ['mcp server', 'model context', 'claude desktop', 'mcp tool'], type: 'MCP_SERVER', language: 'python', framework: 'mcp', weight: 10 },
    { patterns: ['discord bot', 'discord.py', 'discord.js'], type: 'DISCORD_BOT', language: 'python', framework: 'discord.py', weight: 10 },
    { patterns: ['telegram bot', 'telegram'], type: 'TELEGRAM_BOT', language: 'python', framework: 'python-telegram-bot', weight: 10 },
    { patterns: ['electron', 'desktop app'], type: 'ELECTRON_APP', language: 'typescript', framework: 'electron', weight: 9 },
    { patterns: ['browser extension', 'chrome extension'], type: 'BROWSER_EXTENSION', language: 'typescript', framework: 'plasmo', weight: 9 },
    { patterns: ['vscode extension', 'vs code extension'], type: 'VSCODE_EXTENSION', language: 'typescript', framework: 'vscode', weight: 9 },
    { patterns: ['mobile app', 'react native', 'expo', 'ios app', 'android app'], type: 'MOBILE_APP', language: 'typescript', framework: 'react-native', weight: 9 },
    { patterns: ['website', 'web app', 'nextjs', 'next.js', 'dashboard', 'landing page'], type: 'WEB_APP', language: 'typescript', framework: 'nextjs', weight: 7 },
    { patterns: ['api', 'rest api', 'backend', 'microservice', 'fastapi'], type: 'API_SERVICE', language: 'python', framework: 'fastapi', weight: 6 },
    { patterns: ['cli', 'command line', 'terminal tool'], type: 'CLI_TOOL', language: 'python', framework: 'click', weight: 8 },
    { patterns: ['gui', 'pyqt', 'tkinter', 'desktop gui'], type: 'GUI_APPLICATION', language: 'python', framework: 'pyqt6', weight: 8 },
    { patterns: ['automation', 'script', 'cron', 'scheduler', 'scraper'], type: 'AUTOMATION_SCRIPT', language: 'python', framework: 'none', weight: 5 },
    { patterns: ['python', 'flask', 'django'], type: 'PYTHON_APP', language: 'python', framework: 'fastapi', weight: 3 },
  ];

  let bestMatch: { type: ProjectType; language: string; framework: string; score: number } = {
    type: 'PYTHON_APP', language: 'python', framework: 'fastapi', score: 0,
  };

  for (const kw of keywords) {
    const matchCount = kw.patterns.filter(p => lower.includes(p)).length;
    const score = matchCount * kw.weight;
    if (score > bestMatch.score) {
      bestMatch = { type: kw.type, language: kw.language, framework: kw.framework, score };
    }
  }

  // Language override detection
  if (lower.includes('rust') || lower.includes('cargo')) { bestMatch.language = 'rust'; }
  if (lower.includes('golang') || lower.includes(' go ')) { bestMatch.language = 'go'; }
  if (lower.includes('typescript') || lower.includes(' ts ')) { bestMatch.language = 'typescript'; }

  return { ...bestMatch, confidence: Math.min(bestMatch.score / 10, 1.0) };
}

// ═══════════════════════════════════════════════════════════════════════════
// CODE GENERATION — Scaffold and module generation
// ═══════════════════════════════════════════════════════════════════════════

function generateScaffold(projectType: ProjectType, name: string, language: string, framework: string, features: string[]): GeneratedFile[] {
  const archetype = PROJECT_ARCHETYPES[projectType];
  const files: GeneratedFile[] = [];

  // README.md
  files.push({
    path: 'README.md',
    content: `# ${name}\n\n> Built with Hephaestion Forge — Sovereign Code Supremacy Standard\n\n## Quick Start\n\n\`\`\`bash\n# Clone\ngit clone https://github.com/bobmcwilliams4/${name.toLowerCase().replace(/\s+/g, '-')}.git\n\n# Install\n${language === 'python' ? 'pip install -e .' : 'npm install'}\n\n# Run\n${language === 'python' ? 'python -m src.main' : 'npm run dev'}\n\`\`\`\n\n## Features\n\n${features.map(f => `- **${f}**`).join('\n')}\n\n## Architecture\n\nBlueprint ${archetype.blueprint} — ${archetype.description}\n\n## License\n\nProprietary — ECHO OMEGA PRIME\n\n---\n*Built with [Hephaestion Forge](https://hephaestion-forge.bmcii1976.workers.dev) | Commander Bobby Don McWilliams II*`,
    language: 'markdown', lines: 30, purpose: 'Project README',
  });

  // .env.example
  files.push({
    path: '.env.example',
    content: `# ${name} Environment Variables\n# Copy to .env and fill in values\n\nAPP_ENV=development\nAPP_PORT=8000\nLOG_LEVEL=INFO\n# Add your API keys below`,
    language: 'env', lines: 6, purpose: 'Environment variable template',
  });

  // .gitignore
  const gitignore = language === 'python'
    ? '__pycache__/\n*.pyc\n.env\n.venv/\ndist/\n*.egg-info/\n.mypy_cache/\n.pytest_cache/\ncoverage.xml\nhtmlcov/\n.ruff_cache/'
    : 'node_modules/\n.env\n.env.local\ndist/\n.next/\ncoverage/\n.wrangler/\n*.tsbuildinfo';

  files.push({ path: '.gitignore', content: gitignore, language: 'gitignore', lines: 10, purpose: 'Git ignore rules' });

  // Framework-specific config
  const template = FRAMEWORK_TEMPLATES[framework];
  if (template) {
    for (const [filename, content] of Object.entries(template.configFiles)) {
      const resolved = content.replace(/\{name\}/g, name.toLowerCase().replace(/\s+/g, '-')).replace(/\{version\}/g, '1.0.0');
      files.push({ path: filename, content: resolved, language: filename.endsWith('.toml') ? 'toml' : 'json', lines: resolved.split('\n').length, purpose: `${framework} configuration` });
    }
  }

  // Health check entry point
  if (template) {
    const healthCode = template.healthCheckPattern.replace(/\{name\}/g, name).replace(/\{version\}/g, '1.0.0');
    files.push({ path: template.entryPoint, content: `# ${name} — Entry Point\n# Generated by Hephaestion Forge v2.0.0\n\n${healthCode}`, language, lines: 10, purpose: 'Application entry point with health check' });
  }

  return files;
}

// ═══════════════════════════════════════════════════════════════════════════
// CODE ANALYSIS — Lint, security, complexity
// ═══════════════════════════════════════════════════════════════════════════

function analyzeCode(code: string, language: string): QualityScore[] {
  const scores: QualityScore[] = [];
  const profile = LANGUAGE_PROFILES[language];

  // CODE QUALITY
  const codeIssues: QualityIssue[] = [];
  if (profile) {
    for (const anti of profile.antiPatterns) {
      if (code.includes(anti.split(' ')[0])) {
        codeIssues.push({ severity: 'medium', category: 'anti-pattern', message: `Found anti-pattern: ${anti}`, file: null, line: null, fix: `Replace with recommended pattern` });
      }
    }
  }
  if (code.includes('TODO') || code.includes('FIXME') || code.includes('HACK')) {
    codeIssues.push({ severity: 'medium', category: 'incomplete', message: 'Found TODO/FIXME/HACK comment', file: null, line: null, fix: 'Resolve or remove before shipping' });
  }
  const codeScore = Math.max(10 - codeIssues.length * 0.5, 0);
  scores.push({ category: 'CAT1-CODE', score: codeScore, grade: codeScore >= 9 ? 'A' : codeScore >= 7 ? 'B' : codeScore >= 5 ? 'C' : 'D', issues: codeIssues, recommendations: [] });

  // SECURITY
  const secIssues: QualityIssue[] = [];
  if (code.includes('eval(')) { secIssues.push({ severity: 'critical', category: 'injection', message: 'eval() usage detected — potential code injection', file: null, line: null, fix: 'Remove eval() and use safe alternatives' }); }
  if (code.match(/password\s*=\s*['"][^'"]+['"]/i)) { secIssues.push({ severity: 'critical', category: 'secrets', message: 'Hardcoded password detected', file: null, line: null, fix: 'Use environment variables or vault' }); }
  if (code.includes('dangerouslySetInnerHTML')) { secIssues.push({ severity: 'high', category: 'xss', message: 'dangerouslySetInnerHTML — XSS risk', file: null, line: null, fix: 'Sanitize HTML or use safe alternatives' }); }
  const secScore = Math.max(10 - secIssues.length * 2, 0);
  scores.push({ category: 'CAT3-SEC', score: secScore, grade: secScore >= 9 ? 'A' : secScore >= 7 ? 'B' : secScore >= 5 ? 'C' : 'D', issues: secIssues, recommendations: [] });

  // COMPLEXITY
  const lines = code.split('\n').length;
  const functions = (code.match(/(?:def |function |async function |const \w+ = (?:async )?(?:\([^)]*\)|[^=]+) =>)/g) ?? []).length;
  const avgFuncLength = functions > 0 ? lines / functions : lines;
  const complexIssues: QualityIssue[] = [];
  if (avgFuncLength > 50) { complexIssues.push({ severity: 'medium', category: 'complexity', message: `Average function length ${Math.round(avgFuncLength)} lines (target: <50)`, file: null, line: null, fix: 'Decompose large functions' }); }
  if (lines > 500) { complexIssues.push({ severity: 'low', category: 'file-size', message: `File is ${lines} lines (guidance: <500 per file)`, file: null, line: null, fix: 'Consider splitting into modules' }); }
  const complexScore = Math.max(10 - complexIssues.length, 0);
  scores.push({ category: 'CAT2-PERF', score: complexScore, grade: complexScore >= 9 ? 'A' : complexScore >= 7 ? 'B' : complexScore >= 5 ? 'C' : 'D', issues: complexIssues, recommendations: [] });

  return scores;
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHITECTURE RECOMMENDER
// ═══════════════════════════════════════════════════════════════════════════

function recommendArchitecture(
  projectType: ProjectType, requirements: string[], scale: string, teamSize: number,
): { pattern: string; layers: string[]; decisions: ArchitectureDecision[]; diagram: string } {
  const archetype = PROJECT_ARCHETYPES[projectType];
  const isLargeScale = scale === 'large' || teamSize > 5;

  const layers = isLargeScale
    ? ['Presentation (API/UI)', 'Application (Use Cases)', 'Domain (Business Logic)', 'Infrastructure (DB, External Services)']
    : ['Routes/Handlers', 'Services (Business Logic)', 'Data Access (Repository)', 'External Integrations'];

  const decisions: ArchitectureDecision[] = [
    {
      id: 'ADR-001', title: `Framework Selection: ${archetype.defaultFramework}`,
      context: `Project type ${projectType} requires ${archetype.description}`,
      decision: `Use ${archetype.defaultFramework} with ${archetype.defaultLanguage}`,
      rationale: `Best fit for ${projectType} — mature ecosystem, strong typing, production-proven`,
      alternatives: [], consequences: ['Team must learn framework patterns', 'Locked to framework version'],
      timestamp: nowISO(),
    },
    {
      id: 'ADR-002', title: `Deployment Target: ${archetype.deployTarget}`,
      context: `Cloud-first policy mandates edge deployment where possible`,
      decision: `Deploy to ${archetype.deployTarget}`,
      rationale: `${archetype.deployTarget} provides best DX and performance for this project type`,
      alternatives: ['docker', 'gcp', 'aws'], consequences: ['Platform-specific constraints apply'],
      timestamp: nowISO(),
    },
  ];

  const diagram = `
┌──────────────────────────────────────┐
│            ${projectType.padEnd(30)}   │
├──────────────────────────────────────┤
│  ${layers[0].padEnd(36)}  │
│  ┌────────────────────────────────┐  │
│  │ ${layers[1].padEnd(30)} │  │
│  │  ┌──────────────────────────┐  │  │
│  │  │ ${(layers[2] ?? '').padEnd(24)} │  │  │
│  │  └──────────────────────────┘  │  │
│  └────────────────────────────────┘  │
│  ${(layers[3] ?? 'External Services').padEnd(36)}  │
├──────────────────────────────────────┤
│  Deploy: ${archetype.deployTarget.padEnd(27)}  │
│  Lang: ${archetype.defaultLanguage.padEnd(29)}  │
└──────────────────────────────────────┘`;

  return { pattern: isLargeScale ? 'Clean Architecture' : 'Layered MVC', layers, decisions, diagram };
}

// ═══════════════════════════════════════════════════════════════════════════
// DEPENDENCY RECOMMENDER
// ═══════════════════════════════════════════════════════════════════════════

function recommendDependencies(projectType: ProjectType, features: string[]): DependencyRecommendation[] {
  const archetype = PROJECT_ARCHETYPES[projectType];
  const deps: DependencyRecommendation[] = archetype.suggestedDeps.map(name => ({
    name, version: 'latest', purpose: `Core dependency for ${archetype.defaultFramework}`,
    alternatives: [], license: 'MIT', weeklyDownloads: null, securityAdvisories: 0,
  }));

  // Feature-based additions
  const featureMap: Record<string, DependencyRecommendation[]> = {
    'auth': [{ name: archetype.defaultLanguage === 'python' ? 'python-jose' : 'jose', version: 'latest', purpose: 'JWT authentication', alternatives: ['authlib'], license: 'MIT', weeklyDownloads: null, securityAdvisories: 0 }],
    'database': [{ name: archetype.defaultLanguage === 'python' ? 'sqlalchemy' : 'drizzle-orm', version: 'latest', purpose: 'ORM / database access', alternatives: ['prisma', 'tortoise-orm'], license: 'MIT', weeklyDownloads: null, securityAdvisories: 0 }],
    'cache': [{ name: 'redis', version: 'latest', purpose: 'Caching layer', alternatives: ['memcached'], license: 'MIT', weeklyDownloads: null, securityAdvisories: 0 }],
    'queue': [{ name: archetype.defaultLanguage === 'python' ? 'celery' : 'bullmq', version: 'latest', purpose: 'Task queue', alternatives: ['rq', 'bee-queue'], license: 'MIT', weeklyDownloads: null, securityAdvisories: 0 }],
    'websocket': [{ name: archetype.defaultLanguage === 'python' ? 'websockets' : 'ws', version: 'latest', purpose: 'WebSocket support', alternatives: ['socket.io'], license: 'MIT', weeklyDownloads: null, securityAdvisories: 0 }],
  };

  for (const feature of features) {
    const lower = feature.toLowerCase();
    for (const [key, recs] of Object.entries(featureMap)) {
      if (lower.includes(key)) deps.push(...recs);
    }
  }

  return deps;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEPLOYMENT CONFIG GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

function generateDeploymentConfig(projectType: ProjectType, name: string, target: string): DeploymentConfig {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  if (target === 'cloudflare') {
    return {
      target: 'cloudflare',
      files: {
        'wrangler.toml': `name = "${slug}"\nmain = "src/index.ts"\ncompatibility_date = "2024-12-01"\n\n[vars]\nVERSION = "1.0.0"\nSERVICE_NAME = "${slug}"\n\n# Add bindings as needed:\n# [[d1_databases]]\n# binding = "DB"\n# database_name = "${slug}"\n# database_id = "placeholder"`,
      },
      commands: ['npm install', 'npx wrangler deploy'],
      envVars: ['ECHO_API_KEY'],
    };
  }

  if (target === 'vercel') {
    return {
      target: 'vercel',
      files: {
        'vercel.json': `{\n  "framework": "nextjs",\n  "buildCommand": "npm run build",\n  "outputDirectory": ".next"\n}`,
      },
      commands: ['npm install', 'npm run build', 'npx vercel --prod'],
      envVars: [],
    };
  }

  // Docker default
  const isPython = PROJECT_ARCHETYPES[projectType].defaultLanguage === 'python';
  return {
    target: 'docker',
    files: {
      'Dockerfile': isPython
        ? `FROM python:3.11-slim AS builder\nWORKDIR /build\nCOPY pyproject.toml .\nRUN pip install --no-cache-dir --prefix=/install .\nCOPY src/ src/\n\nFROM python:3.11-slim\nRUN useradd --create-home appuser\nWORKDIR /app\nCOPY --from=builder /install /usr/local\nCOPY --from=builder /build/src ./src\nUSER appuser\nHEALTHCHECK --interval=30s --timeout=5s CMD python -c "import httpx; httpx.get('http://localhost:8000/health').raise_for_status()"\nEXPOSE 8000\nCMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]`
        : `FROM node:20-slim AS builder\nWORKDIR /build\nCOPY package*.json .\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:20-slim\nRUN adduser --disabled-password appuser\nWORKDIR /app\nCOPY --from=builder /build/dist ./dist\nCOPY --from=builder /build/node_modules ./node_modules\nUSER appuser\nEXPOSE 3000\nCMD ["node", "dist/index.js"]`,
      'docker-compose.yml': `version: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - "8000:8000"\n    env_file: .env\n    restart: unless-stopped`,
    },
    commands: ['docker build -t ' + slug + ' .', 'docker run -p 8000:8000 ' + slug],
    envVars: ['APP_ENV', 'APP_PORT'],
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMITER — KV-based sliding window
// ═══════════════════════════════════════════════════════════════════════════

async function checkRateLimit(kv: KVNamespace, key: string, maxReq: number = RATE_LIMIT_MAX_REQUESTS, windowS: number = RATE_LIMIT_WINDOW_S): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Math.floor(Date.now() / 1000);
  const windowKey = `rl:${key}:${Math.floor(now / windowS)}`;

  const current = parseInt((await kv.get(windowKey)) ?? '0', 10);
  if (current >= maxReq) {
    return { allowed: false, remaining: 0, resetAt: (Math.floor(now / windowS) + 1) * windowS };
  }

  await kv.put(windowKey, String(current + 1), { expirationTtl: windowS * 2 });
  return { allowed: true, remaining: maxReq - current - 1, resetAt: (Math.floor(now / windowS) + 1) * windowS };
}

// ═══════════════════════════════════════════════════════════════════════════
// REQUEST HANDLER — Main Worker fetch entry point
// ═══════════════════════════════════════════════════════════════════════════

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(origin);

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // Rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const rateCheck = await checkRateLimit(env.TEMPLATE_CACHE, clientIP);
    if (!rateCheck.allowed) {
      const err = makeError('Rate limit exceeded', 'RATE_LIMIT', 429);
      return new Response(JSON.stringify(err), { status: 429, headers: { ...cors, 'Retry-After': String(rateCheck.resetAt - Math.floor(Date.now() / 1000)) } });
    }

    try {
      const response = await routeRequest(path, method, request, env);
      // Apply CORS + rate limit headers to response
      const headers = new Headers(response.headers);
      for (const [k, v] of Object.entries(cors)) headers.set(k, v);
      headers.set('X-RateLimit-Remaining', String(rateCheck.remaining));
      return new Response(response.body, { status: response.status, headers });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      const errorResp = makeError(message, 'INTERNAL_ERROR', 500);
      return new Response(JSON.stringify(errorResp), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ROUTER — Path-based dispatch
// ═══════════════════════════════════════════════════════════════════════════

async function routeRequest(path: string, method: string, request: Request, env: Env): Promise<Response> {

  // ──── HEALTH & SYSTEM ─────────────────────────────────────────────────
  if (path === '/health' || path === '/') {
    return jsonResponse({
      status: 'healthy', service: 'hephaestion-forge', version: SERVICE_VERSION,
      pipeline: { stages: PIPELINE_STAGES.length, gates: QUALITY_GATES.length },
      projectTypes: Object.keys(PROJECT_ARCHETYPES).length,
      languages: Object.keys(LANGUAGE_PROFILES).length,
      designPatterns: DESIGN_PATTERNS.length,
      timestamp: nowISO(),
    });
  }

  if (path === '/stats') {
    const projects = await listProjectsFromKV(env.FORGE_PROJECTS);
    const completed = projects.filter(p => p.status === 'complete');
    const totalLines = projects.reduce((sum, p) => sum + p.linesOfCode, 0);
    return jsonResponse({
      totalProjects: projects.length, completed: completed.length,
      inProgress: projects.filter(p => !['complete', 'failed'].includes(p.status)).length,
      totalLinesGenerated: totalLines, totalFilesGenerated: projects.reduce((sum, p) => sum + p.filesGenerated, 0),
      avgQualityScore: completed.length > 0 ? completed.reduce((s, p) => s + (p.qualityScores[0]?.score ?? 0), 0) / completed.length : 0,
    });
  }

  if (path === '/templates') {
    return jsonResponse({ templates: Object.values(PROJECT_ARCHETYPES).map(a => ({ type: a.type, language: a.defaultLanguage, framework: a.defaultFramework, blueprint: a.blueprint, description: a.description, deployTarget: a.deployTarget })) });
  }

  if (path === '/languages') {
    return jsonResponse({ languages: Object.values(LANGUAGE_PROFILES).map(l => ({ name: l.name, extensions: l.extensions, lintTool: l.lintTool, testFramework: l.testFramework, typeChecker: l.typeChecker })) });
  }

  if (path === '/pipeline') {
    return jsonResponse({ stages: PIPELINE_STAGES, gates: QUALITY_GATES });
  }

  if (path === '/patterns') {
    return jsonResponse({ patterns: DESIGN_PATTERNS });
  }

  // ──── PROJECT MANAGEMENT ──────────────────────────────────────────────
  if (path === '/forge/start' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const name = sanitize(String(body.name ?? body.initial_request ?? 'Untitled'), MAX_PROJECT_NAME_LENGTH);
    const description = sanitize(String(body.description ?? body.initial_request ?? ''), MAX_DESCRIPTION_LENGTH);
    const initialRequest = String(body.initial_request ?? description);

    const detected = detectProjectType(initialRequest);
    const projectType = (body.project_type as ProjectType) ?? detected.type;
    const language = String(body.language ?? detected.language);
    const framework = String(body.framework ?? detected.framework);
    const userId = request.headers.get('X-User-Id') ?? 'anonymous';

    const project: ForgeProject = {
      id: generateId(), userId, name, description, initialRequest, projectType, language, framework,
      status: 'queued', currentStage: 0, totalStages: PIPELINE_STAGES.length,
      stageResults: [], qualityScores: [], filesGenerated: 0, linesOfCode: 0,
      testsPassing: 0, testsTotal: 0, architectureDecisions: [], dependencies: [],
      deploymentConfig: null, metadata: { detectedConfidence: detected.confidence },
      createdAt: nowISO(), updatedAt: nowISO(), completedAt: null,
    };

    await env.FORGE_PROJECTS.put(`project:${project.id}`, JSON.stringify(project));
    return jsonResponse({ project, message: `Project ${project.id} created — ${projectType} / ${language} / ${framework}` }, 201);
  }

  if (path === '/forge/conversational' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const initialRequest = sanitize(String(body.initial_request ?? ''), MAX_DESCRIPTION_LENGTH);
    if (!initialRequest) return jsonResponse(makeError('initial_request is required', 'VALIDATION', 400), 400);

    const detected = detectProjectType(initialRequest);
    const archetype = PROJECT_ARCHETYPES[detected.type];

    // Fetch Engine Runtime doctrines for this project type
    const forgeDoctrines = await queryEngineRuntime(initialRequest, detected.type, env, 5);
    const doctrineContext = buildDoctrineContext(forgeDoctrines);

    // Use LLM to analyze requirements — enriched with engine doctrines
    const llmResult = await callLLM(
      `Analyze this software project request and extract structured requirements:\n\n"${initialRequest}"\n\nReturn JSON with: { features: string[], technical_requirements: string[], suggested_name: string, complexity: "simple"|"moderate"|"complex", estimated_files: number, estimated_lines: number }`,
      `You are a senior software architect analyzing project requirements. Return valid JSON only.${doctrineContext}`,
      env,
    );

    let analysis: Record<string, unknown> = {};
    try {
      const jsonMatch = llmResult.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) analysis = JSON.parse(jsonMatch[0]);
    } catch {
      analysis = { features: [initialRequest], complexity: 'moderate' };
    }

    return jsonResponse({
      detected: { type: detected.type, language: detected.language, framework: detected.framework, confidence: detected.confidence },
      archetype: { blueprint: archetype.blueprint, description: archetype.description, deployTarget: archetype.deployTarget, mandatoryFiles: archetype.mandatoryFiles },
      analysis,
      llm: { provider: llmResult.provider, model: llmResult.model, latencyMs: llmResult.latencyMs },
      nextStep: 'Call /forge/start with the confirmed requirements to begin building.',
    });
  }

  // Dynamic project routes
  const projectStatusMatch = path.match(/^\/forge\/status\/([a-z0-9-]+)$/);
  if (projectStatusMatch) {
    const project = await getProject(env.FORGE_PROJECTS, projectStatusMatch[1]);
    if (!project) return jsonResponse(makeError('Project not found', 'NOT_FOUND', 404), 404);
    return jsonResponse(project);
  }

  const pipelineMatch = path.match(/^\/forge\/pipeline\/([a-z0-9-]+)$/);
  if (pipelineMatch) {
    const project = await getProject(env.FORGE_PROJECTS, pipelineMatch[1]);
    if (!project) return jsonResponse(makeError('Project not found', 'NOT_FOUND', 404), 404);
    return jsonResponse({
      projectId: project.id, status: project.status, currentStage: project.currentStage,
      stages: PIPELINE_STAGES.map((s, i) => ({
        ...s,
        status: i < project.currentStage ? 'passed' : i === project.currentStage ? 'running' : 'pending',
        result: project.stageResults[i] ?? null,
      })),
    });
  }

  const advanceMatch = path.match(/^\/forge\/advance\/([a-z0-9-]+)$/);
  if (advanceMatch && method === 'POST') {
    const project = await getProject(env.FORGE_PROJECTS, advanceMatch[1]);
    if (!project) return jsonResponse(makeError('Project not found', 'NOT_FOUND', 404), 404);

    const nextStage = project.currentStage + 1;
    if (nextStage >= PIPELINE_STAGES.length) {
      project.status = 'complete';
      project.completedAt = nowISO();
    } else {
      project.currentStage = nextStage;
      const stage = PIPELINE_STAGES[nextStage];
      project.status = stage.code === 'TEST' ? 'testing' : stage.code === 'QUAL' ? 'reviewing' : 'building';
      project.stageResults.push({
        stage: nextStage, name: stage.name, status: 'passed',
        result: null, score: 8.5, durationMs: 0, llmProvider: 'azure', tokensUsed: 0, timestamp: nowISO(),
      });
    }
    project.updatedAt = nowISO();
    await env.FORGE_PROJECTS.put(`project:${project.id}`, JSON.stringify(project));
    return jsonResponse({ project, message: `Advanced to stage ${nextStage}` });
  }

  if (path === '/forge/projects') {
    const userId = request.headers.get('X-User-Id') ?? 'anonymous';
    const projects = await listProjectsFromKV(env.FORGE_PROJECTS);
    const userProjects = userId === 'anonymous' ? projects : projects.filter(p => p.userId === userId);
    return jsonResponse({ projects: userProjects.slice(0, 50) });
  }

  const reviewMatch = path.match(/^\/forge\/review\/([a-z0-9-]+)$/);
  if (reviewMatch && method === 'POST') {
    const project = await getProject(env.FORGE_PROJECTS, reviewMatch[1]);
    if (!project) return jsonResponse(makeError('Project not found', 'NOT_FOUND', 404), 404);

    const projDoctrines = await queryEngineRuntime(`${project.name} ${project.description}`, project.projectType, env, 3);
    const projEnrichment = buildDoctrineContext(projDoctrines);

    const reviewResult = await callLLM(
      `Review this ${project.projectType} project:\nName: ${project.name}\nDescription: ${project.description}\nLanguage: ${project.language}\nFramework: ${project.framework}\n\nProvide a structured code review with: overall_grade (A-F), strengths[], improvements[], security_concerns[], performance_notes[]`,
      `You are a principal engineer conducting a rigorous code review. Be specific and actionable.${projEnrichment}`,
      env,
    );

    return jsonResponse({ projectId: project.id, review: reviewResult.content, llm: { provider: reviewResult.provider, latencyMs: reviewResult.latencyMs } });
  }

  // ──── CODE GENERATION ─────────────────────────────────────────────────
  if (path === '/generate/scaffold' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const projectType = (body.project_type as ProjectType) ?? 'PYTHON_APP';
    const name = sanitize(String(body.name ?? 'my-project'), 60);
    const language = String(body.language ?? PROJECT_ARCHETYPES[projectType].defaultLanguage);
    const framework = String(body.framework ?? PROJECT_ARCHETYPES[projectType].defaultFramework);
    const features = (body.features as string[]) ?? [];

    const files = generateScaffold(projectType, name, language, framework, features);
    return jsonResponse({ files, totalFiles: files.length, totalLines: files.reduce((s, f) => s + f.lines, 0), archetype: PROJECT_ARCHETYPES[projectType] });
  }

  if (path === '/generate/module' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const moduleName = sanitize(String(body.name ?? ''), 100);
    const description = sanitize(String(body.description ?? ''), 2000);
    const language = String(body.language ?? 'python');
    const patterns = (body.patterns as string[]) ?? [];

    const profile = LANGUAGE_PROFILES[language];
    const patternList = patterns.length > 0 ? `\nRequired patterns: ${patterns.join(', ')}` : '';
    const mandatoryList = profile ? `\nMandatory: ${profile.mandatoryPatterns.join(', ')}` : '';
    const antiList = profile ? `\nForbidden: ${profile.antiPatterns.join(', ')}` : '';

    // Fetch relevant engine doctrines for this module
    const modDoctrines = await queryTopicDoctrines(`${moduleName} ${description}`, language === 'python' ? 'api' : 'frontend', env, 3);
    const modEnrichment = modDoctrines ? `\n\nRelevant engineering doctrines:\n${modDoctrines}` : '';

    const result = await callLLM(
      `Generate a production-quality ${language} module named "${moduleName}".\n\nPurpose: ${description}${patternList}${mandatoryList}${antiList}\n\nReturn ONLY the code, no explanations. Include type hints, docstrings, and error handling.`,
      `You are a world-class ${language} developer writing SOVEREIGN CODE SUPREMACY standard code. Every function is typed. Every error is handled. No shortcuts.${modEnrichment}${buildSovereignContext('generate')}`,
      env, 'azure', 8192,
    );

    return jsonResponse({ module: moduleName, language, code: result.content, lines: result.content.split('\n').length, llm: { provider: result.provider, latencyMs: result.latencyMs } });
  }

  if (path === '/generate/api' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const framework = String(body.framework ?? 'fastapi');
    const endpoints = (body.endpoints as Array<Record<string, string>>) ?? [];
    const auth = String(body.auth ?? 'api_key');

    const apiDoctrines = await queryTopicDoctrines(`API ${framework} ${auth} endpoints`, 'api', env, 3);
    const apiEnrichment = apiDoctrines ? `\n\nRelevant API engineering doctrines:\n${apiDoctrines}` : '';

    const result = await callLLM(
      `Generate a production API with ${framework} framework.\nEndpoints: ${JSON.stringify(endpoints)}\nAuth: ${auth}\n\nReturn complete, runnable code with: typed request/response models, input validation, error handling, health check, CORS, rate limiting.`,
      `You write SOVEREIGN CODE SUPREMACY standard APIs. Every endpoint is validated. Every response is typed. No shortcuts.${apiEnrichment}${buildSovereignContext('generate')}`,
      env, 'azure', 8192,
    );

    return jsonResponse({ framework, code: result.content, lines: result.content.split('\n').length, endpointCount: endpoints.length });
  }

  if (path === '/generate/tests' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const code = sanitize(String(body.code ?? ''), MAX_CODE_INPUT_LENGTH);
    const language = String(body.language ?? 'python');
    const coverageTarget = Number(body.coverage_target ?? 80);

    const profile = LANGUAGE_PROFILES[language];
    const testDoctrines = await queryTopicDoctrines(`testing ${language} ${profile?.testFramework ?? 'pytest'}`, 'testing', env, 3);
    const testEnrichment = testDoctrines ? `\n\nTesting engineering doctrines:\n${testDoctrines}` : '';

    const result = await callLLM(
      `Generate a comprehensive test suite for this ${language} code:\n\n\`\`\`${language}\n${code.slice(0, 4000)}\n\`\`\`\n\nUse ${profile?.testFramework ?? 'pytest'}. Target ${coverageTarget}% coverage. Include: unit tests, edge cases, error cases, integration tests where applicable. Use descriptive test names.`,
      `You write thorough, production-quality tests. Every edge case is covered. Every error path is tested. Use ${profile?.testFramework ?? 'pytest'} framework.${testEnrichment}${buildSovereignContext('generate')}`,
      env, 'azure', 8192,
    );

    return jsonResponse({ language, testFramework: profile?.testFramework, code: result.content, coverageTarget });
  }

  if (path === '/generate/docs' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const projectName = sanitize(String(body.project ?? ''), 100);
    const format = String(body.format ?? 'markdown');
    const sections = (body.sections as string[]) ?? ['readme', 'ai_guide', 'user_guide'];

    const result = await callLLM(
      `Generate documentation for project "${projectName}" in ${format} format.\nSections needed: ${sections.join(', ')}\n\nFollow SOVEREIGN CODE SUPREMACY documentation standards. Include: clear quick-start, architecture overview, API reference, environment variables table, development commands.`,
      'You write documentation that welcomes newcomers, orients AI agents, and impresses investors. No filler. Every sentence earns its place.',
      env, 'azure', 8192,
    );

    return jsonResponse({ project: projectName, sections, content: result.content });
  }

  if (path === '/generate/config' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const projectType = (body.project_type as ProjectType) ?? 'PYTHON_APP';
    const target = String(body.target ?? PROJECT_ARCHETYPES[projectType].deployTarget);
    const name = sanitize(String(body.name ?? 'my-project'), 60);

    const config = generateDeploymentConfig(projectType, name, target);
    return jsonResponse(config);
  }

  if (path === '/generate/ci' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const provider = String(body.provider ?? 'github');
    const language = String(body.language ?? 'python');
    const tests = body.tests !== false;
    const deploy = body.deploy !== false;

    const profile = LANGUAGE_PROFILES[language];
    const lintStep = profile ? `      - name: Lint\n        run: ${profile.lintTool} check .` : '';
    const typeStep = profile?.typeChecker ? `      - name: Type Check\n        run: ${profile.typeChecker} src/ --strict` : '';
    const testStep = tests ? `      - name: Test\n        run: ${profile?.testFramework ?? 'pytest'} tests/ -v --cov=src --cov-fail-under=80` : '';

    const yaml = `name: Sovereign CI/CD\n\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\njobs:\n  quality-gate:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n${lintStep}\n${typeStep}\n${testStep}${deploy ? '\n\n  deploy:\n    needs: quality-gate\n    if: github.ref == \'refs/heads/main\'\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Deploy\n        run: echo "Deploy to production"' : ''}`;

    return jsonResponse({ provider, ciConfig: yaml, features: { lint: !!lintStep, typeCheck: !!typeStep, tests, deploy } });
  }

  // ──── QUALITY GATES ───────────────────────────────────────────────────
  if (path === '/quality/lint' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const code = sanitize(String(body.code ?? ''), MAX_CODE_INPUT_LENGTH);
    const language = String(body.language ?? 'python');
    const scores = analyzeCode(code, language);
    return jsonResponse({ language, scores, overallGrade: scores[0]?.grade ?? 'B' });
  }

  if (path === '/quality/security' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const code = sanitize(String(body.code ?? ''), MAX_CODE_INPUT_LENGTH);
    const language = String(body.language ?? 'python');

    const secDoctrines = await queryTopicDoctrines(`security audit ${language} vulnerabilities`, 'security', env, 3);
    const secEnrichment = secDoctrines ? `\n\nSecurity engineering doctrines:\n${secDoctrines}` : '';

    const result = await callLLM(
      `Perform a security audit on this ${language} code:\n\n\`\`\`${language}\n${code.slice(0, 4000)}\n\`\`\`\n\nCheck for: injection (SQL, XSS, command), auth issues, secrets exposure, insecure crypto, CSRF, path traversal, SSRF, insecure deserialization. Return JSON: { vulnerabilities: [{ severity, type, line, description, fix }], overall_risk: "low"|"medium"|"high"|"critical", score: number }`,
      `You are a senior security engineer performing a thorough code audit. Miss nothing.${secEnrichment}${buildSovereignContext('security')}`,
      env,
    );

    let secAnalysis: Record<string, unknown> = {};
    try { const m = result.content.match(/\{[\s\S]*\}/); if (m) secAnalysis = JSON.parse(m[0]); } catch { /* parse failed */ }
    return jsonResponse({ language, analysis: secAnalysis, llm: { provider: result.provider, latencyMs: result.latencyMs } });
  }

  if (path === '/quality/complexity' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const code = sanitize(String(body.code ?? ''), MAX_CODE_INPUT_LENGTH);
    const language = String(body.language ?? 'python');

    const lines = code.split('\n').length;
    const functions = (code.match(/(?:def |function |async function |const \w+ = (?:async )?(?:\([^)]*\)|[^=]+) =>)/g) ?? []).length;
    const classes = (code.match(/(?:class )/g) ?? []).length;
    const imports = (code.match(/(?:import |from .+ import |require\()/g) ?? []).length;
    const nestingDepth = Math.max(...code.split('\n').map(l => l.search(/\S/) / 2).filter(n => !isNaN(n)));
    const cyclomaticEstimate = (code.match(/(?:if |elif |else|for |while |case |catch |&&|\|\||\?)/g) ?? []).length + 1;

    return jsonResponse({
      lines, functions, classes, imports, maxNestingDepth: nestingDepth,
      cyclomaticComplexity: cyclomaticEstimate,
      avgFunctionLength: functions > 0 ? Math.round(lines / functions) : lines,
      assessment: cyclomaticEstimate > 20 ? 'HIGH — consider refactoring' : cyclomaticEstimate > 10 ? 'MODERATE' : 'LOW — well-structured',
    });
  }

  if (path === '/quality/review' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const code = sanitize(String(body.code ?? ''), MAX_CODE_INPUT_LENGTH);
    const language = String(body.language ?? 'python');
    const context = sanitize(String(body.context ?? ''), 2000);

    const profile = LANGUAGE_PROFILES[language];
    const reviewDoctrines = await queryTopicDoctrines(`code review ${language} best practices`, 'architecture', env, 3);
    const reviewEnrichment = reviewDoctrines ? `\n\nEngineering review doctrines:\n${reviewDoctrines}` : '';

    const result = await callLLM(
      `Review this ${language} code as a principal engineer at a FAANG company:\n\n\`\`\`${language}\n${code.slice(0, 6000)}\n\`\`\`\n\nContext: ${context}\nMandatory patterns: ${profile?.mandatoryPatterns.join(', ') ?? 'standard best practices'}\nForbidden: ${profile?.antiPatterns.join(', ') ?? 'none specified'}\n\nProvide: overall_grade (A-F), issues[], strengths[], suggestions[], competitive_assessment (vs GPT-4.1/Gemini output quality)`,
      `You are the most demanding code reviewer on Earth. FAANG principal engineer level. Be specific, actionable, and thorough. Grade honestly.${reviewEnrichment}${buildSovereignContext('review')}`,
      env, 'azure', 4096,
    );

    return jsonResponse({ language, review: result.content, llm: { provider: result.provider, latencyMs: result.latencyMs } });
  }

  // ──── ENHANCEMENT MATRIX SWEEP (Sovereign Code Supremacy /enhance) ──
  if (path === '/quality/enhance' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const code = sanitize(String(body.code ?? ''), MAX_CODE_INPUT_LENGTH);
    const language = String(body.language ?? 'python');
    const projectName = sanitize(String(body.project ?? 'Unknown'), 100);

    const catList = Object.entries(ENHANCEMENT_MATRIX_CATEGORIES).map(([id, checks]) => `${id}: ${checks.join(', ')}`).join('\n');

    const result = await callLLM(
      `Run a SOVEREIGN ENHANCEMENT MATRIX SWEEP on this ${language} code:\n\n\`\`\`${language}\n${code.slice(0, 6000)}\n\`\`\`\n\nScore EVERY category 1-10. For each, list issues found and fixes to apply.\n\nCategories:\n${catList}\n\nReturn JSON: { categories: [{ id: string, name: string, score: number, issues: string[], fixes: string[] }], overall_score: number, competitive_assessment: string, verdict: "SOVEREIGN_APPROVED"|"NEEDS_WORK" }`,
      `You are the Enhancement Matrix — a 14-category quality sweep engine from the SOVEREIGN CODE SUPREMACY standard. Score ruthlessly but fairly. A score of 10 means literally perfect.${buildSovereignContext('review')}`,
      env, 'azure', 8192,
    );

    let sweep: Record<string, unknown> = {};
    try { const m = result.content.match(/\{[\s\S]*\}/); if (m) sweep = JSON.parse(m[0]); } catch { sweep = { raw: result.content }; }

    return jsonResponse({
      project: projectName, language, sweep,
      matrix_version: 'SOVEREIGN_CODE_SUPREMACY_v1.0',
      categories_evaluated: Object.keys(ENHANCEMENT_MATRIX_CATEGORIES).length,
      llm: { provider: result.provider, latencyMs: result.latencyMs },
    });
  }

  // ──── ARCHITECTURE ────────────────────────────────────────────────────
  if (path === '/architecture/recommend' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const projectType = (body.project_type as ProjectType) ?? 'API_SERVICE';
    const requirements = (body.requirements as string[]) ?? [];
    const scale = String(body.scale ?? 'medium');
    const teamSize = Number(body.team_size ?? 1);

    const recommendation = recommendArchitecture(projectType, requirements, scale, teamSize);
    return jsonResponse(recommendation);
  }

  if (path === '/architecture/stack' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const projectType = (body.project_type as ProjectType) ?? 'WEB_APP';
    const requirements = sanitize(String(body.requirements ?? ''), 2000);

    const archetype = PROJECT_ARCHETYPES[projectType];
    const deps = recommendDependencies(projectType, requirements.split(',').map(s => s.trim()));

    return jsonResponse({
      projectType, language: archetype.defaultLanguage, framework: archetype.defaultFramework,
      blueprint: archetype.blueprint, deployTarget: archetype.deployTarget,
      dependencies: deps, mandatoryFiles: archetype.mandatoryFiles,
    });
  }

  if (path === '/architecture/patterns' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const problem = sanitize(String(body.problem ?? ''), 2000);
    const language = String(body.language ?? 'python');

    const relevant = DESIGN_PATTERNS.filter(p => p.languages.includes(language));
    return jsonResponse({ patterns: relevant, recommendation: `For "${problem}", consider these patterns:`, count: relevant.length });
  }

  if (path === '/architecture/database' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const entities = sanitize(String(body.entities ?? ''), 2000);
    const relationships = sanitize(String(body.relationships ?? ''), 2000);
    const scale = String(body.scale ?? 'medium');

    const dbDoctrines = await queryTopicDoctrines(`database schema ${entities} ${scale}`, 'database', env, 3);
    const dbEnrichment = dbDoctrines ? `\n\nDatabase engineering doctrines:\n${dbDoctrines}` : '';

    const result = await callLLM(
      `Design a database schema for:\nEntities: ${entities}\nRelationships: ${relationships}\nScale: ${scale}\n\nReturn: SQL CREATE TABLE statements, indexes, and an ER diagram in ASCII art. Use proper normalization, foreign keys, and constraints.`,
      `You are a database architect designing schemas that are normalized, performant, and extensible.${dbEnrichment}${buildSovereignContext('architecture')}`,
      env,
    );

    return jsonResponse({ schema: result.content, scale, llm: { provider: result.provider, latencyMs: result.latencyMs } });
  }

  // ──── DEPLOYMENT ──────────────────────────────────────────────────────
  if (path === '/deploy/plan' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const projectType = (body.project_type as ProjectType) ?? 'API_SERVICE';
    const target = String(body.target ?? PROJECT_ARCHETYPES[projectType].deployTarget);
    const name = sanitize(String(body.name ?? 'project'), 60);

    const config = generateDeploymentConfig(projectType, name, target);
    return jsonResponse(config);
  }

  if (path === '/deploy/cloudflare' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const name = sanitize(String(body.name ?? 'worker'), 60);
    const config = generateDeploymentConfig('CLOUDFLARE_WORKER', name, 'cloudflare');
    return jsonResponse(config);
  }

  if (path === '/deploy/vercel' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const name = sanitize(String(body.name ?? 'website'), 60);
    const config = generateDeploymentConfig('WEB_APP', name, 'vercel');
    return jsonResponse(config);
  }

  if (path === '/deploy/docker' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const projectType = (body.project_type as ProjectType) ?? 'API_SERVICE';
    const name = sanitize(String(body.name ?? 'service'), 60);
    const config = generateDeploymentConfig(projectType, name, 'docker');
    return jsonResponse(config);
  }

  // ──── INTELLIGENCE ────────────────────────────────────────────────────
  if (path === '/intel/similar' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const description = sanitize(String(body.description ?? ''), 2000);
    const language = String(body.language ?? 'python');

    const simDoctrines = await queryTopicDoctrines(`${description} ${language} projects`, 'architecture', env, 3);
    const simEnrichment = simDoctrines ? `\n\nRelevant domain doctrines:\n${simDoctrines}` : '';

    const result = await callLLM(
      `Find similar open-source projects to: "${description}" in ${language}.\n\nReturn JSON array of: [{ name, url, stars, description, similarity_pct, key_differences }]`,
      `You are an expert at finding relevant open-source projects. Return valid JSON only.${simEnrichment}`,
      env,
    );

    return jsonResponse({ description, language, results: result.content, llm: { provider: result.provider, latencyMs: result.latencyMs } });
  }

  if (path === '/intel/dependencies' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const projectType = (body.project_type as ProjectType) ?? 'PYTHON_APP';
    const features = (body.features as string[]) ?? [];

    const deps = recommendDependencies(projectType, features);
    return jsonResponse({ projectType, features, recommendations: deps });
  }

  if (path === '/intel/best-practices' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const language = String(body.language ?? 'python');
    const framework = String(body.framework ?? '');
    const topic = sanitize(String(body.topic ?? 'general'), 200);

    const bpDoctrines = await queryTopicDoctrines(`${topic} ${language} ${framework} best practices`, topic, env, 3);
    const bpEnrichment = bpDoctrines ? `\n\nRelevant engineering doctrines:\n${bpDoctrines}` : '';

    const result = await callLLM(
      `What are the current best practices for ${topic} in ${language}${framework ? ' with ' + framework : ''}?\n\nProvide actionable, specific guidance with code examples. Focus on production-quality patterns.`,
      `You are a world-class developer sharing battle-tested best practices. Every recommendation is backed by experience.${bpEnrichment}`,
      env,
    );

    return jsonResponse({ language, framework, topic, practices: result.content });
  }

  if (path === '/intel/migration' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const fromTech = sanitize(String(body.from_tech ?? ''), 100);
    const toTech = sanitize(String(body.to_tech ?? ''), 100);
    const codebaseSize = String(body.codebase_size ?? 'medium');

    const migDoctrines = await queryTopicDoctrines(`migration ${fromTech} to ${toTech}`, 'devops', env, 3);
    const migEnrichment = migDoctrines ? `\n\nMigration engineering doctrines:\n${migDoctrines}` : '';

    const result = await callLLM(
      `Create a migration guide from ${fromTech} to ${toTech} for a ${codebaseSize} codebase.\n\nInclude: step-by-step plan, common pitfalls, code transformation examples, timeline estimate, risk assessment.`,
      `You are a migration specialist who has done this exact transition many times. Be practical and specific.${migEnrichment}`,
      env, 'azure', 8192,
    );

    return jsonResponse({ from: fromTech, to: toTech, size: codebaseSize, guide: result.content });
  }

  // ──── MULTI-LLM ──────────────────────────────────────────────────────
  if (path === '/llm/providers') {
    const providers = [
      { id: 'azure', name: 'Azure GPT-4.1', model: 'gpt-4.1', available: !!env.GITHUB_TOKEN, free: true },
      { id: 'deepseek', name: 'DeepSeek V3', model: 'deepseek-chat', available: !!env.DEEPSEEK_API_KEY, free: false },
      { id: 'groq', name: 'Groq Llama 3.3 70B', model: 'llama-3.3-70b-versatile', available: !!env.GROQ_API_KEY, free: true },
      { id: 'grok', name: 'Grok 3 mini', model: 'grok-3-mini', available: !!env.XAI_API_KEY, free: false },
      { id: 'openrouter', name: 'OpenRouter', model: 'various', available: !!env.OPENROUTER_API_KEY, free: false },
    ];
    return jsonResponse({ providers, total: providers.length, available: providers.filter(p => p.available).length });
  }

  if (path === '/llm/dispatch' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const provider = (body.provider as LLMProvider) ?? 'azure';
    const prompt = sanitize(String(body.prompt ?? ''), MAX_DESCRIPTION_LENGTH);
    const systemPrompt = sanitize(String(body.system_prompt ?? 'You are a helpful assistant.'), 2000);

    const result = await callLLM(prompt, systemPrompt, env, provider);
    return jsonResponse({ response: result.content, provider: result.provider, model: result.model, tokensUsed: result.tokensUsed, latencyMs: result.latencyMs });
  }

  if (path === '/llm/swarm' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const prompt = sanitize(String(body.prompt ?? ''), MAX_DESCRIPTION_LENGTH);
    const providers = (body.providers as LLMProvider[]) ?? ['azure', 'deepseek', 'groq'];
    const systemPrompt = sanitize(String(body.system_prompt ?? 'You are a helpful assistant.'), 2000);

    const result = await llmSwarm(prompt, systemPrompt, env, providers);
    return jsonResponse({
      best: { content: result.best.content, provider: result.best.provider, model: result.best.model, latencyMs: result.best.latencyMs },
      allResponses: result.responses.map(r => ({ provider: r.provider, model: r.model, contentLength: r.content.length, latencyMs: r.latencyMs })),
      providersQueried: providers.length,
    });
  }

  if (path === '/llm/consensus' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const question = sanitize(String(body.question ?? ''), 2000);

    const swarm = await llmSwarm(
      `${question}\n\nProvide your definitive answer. Be specific and concise.`,
      'You are an expert answering a technical question. Provide your best answer.',
      env,
    );

    return jsonResponse({
      question,
      consensus: swarm.best.content,
      perspectives: swarm.responses.map(r => ({ provider: r.provider, response: r.content.slice(0, 500) })),
    });
  }

  // ──── ENGINE RUNTIME ─────────────────────────────────────────────────
  if (path === '/engines/query' && method === 'POST') {
    const body = await request.json() as { query: string; project_type?: string; topic?: string; limit?: number };
    const projectType = body.project_type || 'GENERAL';
    const result = await queryEngineRuntime(body.query, projectType, env, body.limit || 5);
    return jsonResponse({
      success: true, ...result,
      project_type_categories: PROJECT_TYPE_TO_ENGINE_CATEGORIES[projectType] || PROJECT_TYPE_TO_ENGINE_CATEGORIES.GENERAL,
      engine_runtime: ENGINE_RUNTIME_URL, total_engines: 2632, total_doctrines: 202751,
    });
  }

  if (path === '/engines/domains') {
    return jsonResponse({
      success: true,
      project_type_mappings: PROJECT_TYPE_TO_ENGINE_CATEGORIES,
      topic_mappings: TOPIC_TO_ENGINE_CATEGORIES,
      engine_runtime: ENGINE_RUNTIME_URL,
      total_engines: 2632, total_doctrines: 202751, domain_categories: 210,
    });
  }

  if (path === '/engines/topic' && method === 'POST') {
    const body = await request.json() as { query: string; topic: string; limit?: number };
    const doctrines = await queryTopicDoctrines(body.query, body.topic, env, body.limit || 3);
    return jsonResponse({
      success: true, topic: body.topic, doctrines: doctrines || 'No doctrines found for this topic',
      categories: TOPIC_TO_ENGINE_CATEGORIES[body.topic.toLowerCase()] || [],
    });
  }

  // ──── DOCTRINE GENERATION ─────────────────────────────────────────────
  if (path === '/doctrines/generate' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const engineId = sanitize(String(body.engine_id ?? ''), 50);
    const domain = sanitize(String(body.domain ?? ''), 100);

    const result = await callLLM(
      `Generate TIE-grade doctrine blocks for engine "${engineId}" in domain "${domain}".\n\nEach doctrine must have: topic, keywords[5-8], conclusion_template[3-5 sentences], reasoning_framework[20-40 lines], key_factors[5+], primary_authority[3-5 citations], confidence_stratification.\n\nGenerate 10 doctrine blocks. Return as JSON array.`,
      'You are the ECHO Engine Runtime doctrine generator. Every doctrine block must be production-quality with real domain expertise, real citations, and real reasoning frameworks. No placeholders.',
      env, 'azure', 8192,
    );

    return jsonResponse({ engineId, domain, doctrines: result.content, llm: { provider: result.provider, tokensUsed: result.tokensUsed, latencyMs: result.latencyMs } });
  }

  if (path === '/doctrines/batch' && method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    const engineIds = (body.engine_ids as string[]) ?? [];
    const domain = sanitize(String(body.domain ?? ''), 100);

    const results = await Promise.allSettled(
      engineIds.slice(0, 5).map(eid =>
        callLLM(
          `Generate 5 TIE-grade doctrine blocks for engine "${eid}" in domain "${domain}". Return JSON array.`,
          'Generate production-quality doctrine blocks with real expertise.',
          env, 'azure', 4096,
        )
      )
    );

    const batchResults = results.map((r, i) => ({
      engineId: engineIds[i],
      status: r.status,
      content: r.status === 'fulfilled' ? r.value.content.slice(0, 2000) : 'failed',
    }));

    return jsonResponse({ batch: batchResults, total: engineIds.length, processed: Math.min(engineIds.length, 5) });
  }

  // ──── 404 ─────────────────────────────────────────────────────────────
  return jsonResponse(makeError(`Unknown endpoint: ${method} ${path}`, 'NOT_FOUND', 404), 404);
}

// ═══════════════════════════════════════════════════════════════════════════
// KV HELPERS — Project CRUD
// ═══════════════════════════════════════════════════════════════════════════

async function getProject(kv: KVNamespace, id: string): Promise<ForgeProject | null> {
  const data = await kv.get(`project:${id}`);
  if (!data) return null;
  return JSON.parse(data) as ForgeProject;
}

async function listProjectsFromKV(kv: KVNamespace): Promise<ForgeProject[]> {
  const list = await kv.list({ prefix: 'project:' });
  const projects: ForgeProject[] = [];
  for (const key of list.keys.slice(0, 100)) {
    const data = await kv.get(key.name);
    if (data) projects.push(JSON.parse(data) as ForgeProject);
  }
  return projects;
}
