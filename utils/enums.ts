// Alternative way to use enums
// TODO: Figure out why
export const agentList = [
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

export type zodApprovedAgentEnum = (typeof agentList)[number];

export const mapList = [
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

export type zodApprovedMapEnum = (typeof mapList)[number];
