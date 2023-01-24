// Alternative way to use enums
// TODO: Figure out why
export const agentZodYes = [
  "BRIMSTONE",
  "VIPER",
  "OMEN",
  "KILLJOY",
  "CYPHER",
  "SOVA",
  "SAGE",
  "PHOENIX",
  "JETT",
  "REYNA",
  "RAZE",
  "BREACH",
  "SKYE",
  "YORU",
  "ASTRA",
  "KAYO",
  "CHAMBER",
  "NEON",
  "FADE",
  "HARBOR",
] as const;

export type zodApprovedAgentEnum = (typeof agentZodYes)[number];

export const mapZodYes = [
  "ASCENT",
  "BIND",
  "BREEZE",
  "FRACTURE",
  "HAVEN",
  "ICEBOX",
  "LOTUS",
  "PEARL",
  "SPLIT",
] as const;

export type zodApprovedMapEnum = (typeof mapZodYes)[number];
