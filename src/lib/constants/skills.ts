export const SKILL_CATEGORIES = {
    CREATIVE: "Creative & Design",
    TECHNICAL: "Development & Tech",
    OPERATIONS: "Operations & Admin",
    MARKETING: "Marketing & Content",
} as const;

export const STANDARDIZED_SKILLS = [
    // Creative
    { id: "video-editing", label: "Video Editing", category: SKILL_CATEGORIES.CREATIVE },
    { id: "graphic-design", label: "Graphic Design", category: SKILL_CATEGORIES.CREATIVE },
    { id: "motion-graphics", label: "Motion Graphics", category: SKILL_CATEGORIES.CREATIVE },
    { id: "figma", label: "Figma/UI Design", category: SKILL_CATEGORIES.CREATIVE },
    { id: "photoshop", label: "Adobe Photoshop", category: SKILL_CATEGORIES.CREATIVE },

    // Technical
    { id: "react", label: "React/Next.js", category: SKILL_CATEGORIES.TECHNICAL },
    { id: "webflow", label: "Webflow Development", category: SKILL_CATEGORIES.TECHNICAL },
    { id: "shopify-dev", label: "Shopify Development", category: SKILL_CATEGORIES.TECHNICAL },
    { id: "wordpress", label: "WordPress", category: SKILL_CATEGORIES.TECHNICAL },
    { id: "python", label: "Python/Scripting", category: SKILL_CATEGORIES.TECHNICAL },

    // Operations
    { id: "data-entry", label: "Data Entry", category: SKILL_CATEGORIES.OPERATIONS },
    { id: "research", label: "Web Research", category: SKILL_CATEGORIES.OPERATIONS },
    { id: "customer-support", label: "Customer Support", category: SKILL_CATEGORIES.OPERATIONS },
    { id: "project-management", label: "Project Management", category: SKILL_CATEGORIES.OPERATIONS },

    // Marketing
    { id: "copywriting", label: "Copywriting", category: SKILL_CATEGORIES.MARKETING },
    { id: "seo", label: "SEO", category: SKILL_CATEGORIES.MARKETING },
    { id: "social-media", label: "Social Media Mgmt", category: SKILL_CATEGORIES.MARKETING },
] as const;

export type SkillId = typeof STANDARDIZED_SKILLS[number]["id"];
