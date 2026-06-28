export const GOLD = "#f4af00";

export const SKILLS = [
  "Strategy", "Project Management", "UX/UI", "Brand", "Frontend", "Backend", "API", "AI", "Data", "QA", "Automation", "DevOps", "Marketing",
];

export const PRIORITIES = ["Critical", "High", "Medium", "Low"];
export const TASK_STATUSES = ["To Do", "In Progress", "Blocked", "Done"];

export const initialProject = {
  id: "project-lumen",
  name: "Lumen Logistics Intelligence Portal",
  client: "Lumen Logistics",
  clientTier: "Platinum",
  service: "ERP / Business Automation",
  priority: "High",
  complexity: "Complex",
  startDate: "2026-06-15",
  deadline: "2026-07-24",
  contractValue: 30000,
  fixedCosts: 1250,
  riskReservePercent: 8,
  notes: "Operations visibility portal with workflow automation, AI-assisted exception summaries, and client reporting.",
};

export const initialEmployees = [
  { id: "e-amina", name: "Amina Noor", role: "Project Manager", initials: "AN", skills: ["Strategy", "Project Management", "QA"], hourlyRate: 70, weeklyCapacity: 28, committedHours: 12, availability: "Available", seniority: 3 },
  { id: "e-musa", name: "Musa Khan", role: "Full-Stack Developer", initials: "MK", skills: ["Frontend", "Backend", "API", "DevOps"], hourlyRate: 85, weeklyCapacity: 32, committedHours: 18, availability: "Limited", seniority: 3 },
  { id: "e-hira", name: "Hira Khyzer", role: "AI Systems Lead", initials: "HK", skills: ["AI", "Data", "API", "Strategy"], hourlyRate: 110, weeklyCapacity: 28, committedHours: 10, availability: "Available", seniority: 3 },
  { id: "e-rani", name: "Rani Patel", role: "Product Designer", initials: "RP", skills: ["UX/UI", "Brand", "Frontend"], hourlyRate: 65, weeklyCapacity: 24, committedHours: 8, availability: "Available", seniority: 2 },
  { id: "e-nora", name: "Nora Lee", role: "QA Engineer", initials: "NL", skills: ["QA", "Automation", "Frontend"], hourlyRate: 55, weeklyCapacity: 25, committedHours: 13, availability: "Available", seniority: 2 },
  { id: "e-omar", name: "Omar Rahman", role: "Client Success Lead", initials: "OR", skills: ["Project Management", "Marketing", "Strategy"], hourlyRate: 60, weeklyCapacity: 22, committedHours: 16, availability: "Limited", seniority: 2 },
];

export const initialTasks = [
  { id: "t-discovery", title: "Operational discovery and workflow map", skills: ["Strategy", "Project Management"], estimatedHours: 10, priority: "Critical", status: "Done", dependencies: [], assigneeId: "e-amina", notes: "Client discovery completed." },
  { id: "t-architecture", title: "Platform architecture and data model", skills: ["Backend", "API", "Data"], estimatedHours: 16, priority: "Critical", status: "In Progress", dependencies: ["t-discovery"], assigneeId: "e-musa", notes: "Data model needs client sign-off." },
  { id: "t-design", title: "Dashboard UX and component system", skills: ["UX/UI", "Brand"], estimatedHours: 18, priority: "High", status: "To Do", dependencies: ["t-discovery"], assigneeId: "", notes: "Needs brand references." },
  { id: "t-integrations", title: "Warehouse and CRM API integrations", skills: ["Backend", "API", "Automation"], estimatedHours: 28, priority: "Critical", status: "Blocked", dependencies: ["t-architecture"], assigneeId: "", notes: "Awaiting sandbox credentials from client." },
  { id: "t-ai", title: "AI exception-summary workflow", skills: ["AI", "Data", "API"], estimatedHours: 22, priority: "High", status: "To Do", dependencies: ["t-architecture"], assigneeId: "", notes: "Requires approved operational dataset." },
  { id: "t-frontend", title: "Operations portal interface", skills: ["Frontend", "UX/UI"], estimatedHours: 32, priority: "High", status: "To Do", dependencies: ["t-design", "t-architecture"], assigneeId: "", notes: "Build reusable dashboard views." },
  { id: "t-qa", title: "Automation and acceptance test suite", skills: ["QA", "Automation"], estimatedHours: 20, priority: "High", status: "To Do", dependencies: ["t-integrations", "t-ai", "t-frontend"], assigneeId: "", notes: "Include regression checklist." },
  { id: "t-uat", title: "Client UAT and launch readiness", skills: ["Project Management", "QA"], estimatedHours: 12, priority: "Critical", status: "To Do", dependencies: ["t-qa"], assigneeId: "", notes: "Client acceptance and launch plan." },
  { id: "t-launch", title: "Production launch and post-launch monitoring", skills: ["DevOps", "Project Management"], estimatedHours: 10, priority: "Critical", status: "To Do", dependencies: ["t-uat"], assigneeId: "", notes: "Production release and 48-hour monitoring." },
];

export const initialScenario = {
  capacityMultiplier: 1,
  deadlineExtensionDays: 0,
  addContractor: false,
  contractorHours: 30,
  contractorRate: 125,
  contractorSkills: ["Backend", "API", "AI", "Automation", "QA"],
};

export function cloneInitialState() {
  return JSON.parse(JSON.stringify({ project: initialProject, employees: initialEmployees, tasks: initialTasks, scenario: initialScenario, savedPlans: [] }));
}
