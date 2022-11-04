export enum Agent {
  Brimstone = "BRIMSTONE",
  Viper = "VIPER",
  Omen = "OMEN",
  Killjoy = "KILLJOY",
  Cypher = "CYPHER",
  Sova = "SOVA",
  Sage = "SAGE",
  Phoenix = "PHOENIX",
  Jett = "JETT",
  Reyna = "REYNA",
  Raze = "RAZE",
  Breach = "BREACH",
  Skye = "SKYE",
  Yoru = "YORU",
  Astra = "ASTRA",
  Kayo = "KAYO",
  Chamber = "CHAMBER",
  Neon = "NEON",
  Fade = "FADE",
}

export const AgentArr: string[] = [
  "Brimstone",
  "Viper",
  "Omen",
  "killjoy",
  "Cypher",
  "Sova",
  "Sage",
  "Phoenix",
  "Jett",
  "Reyna",
  "raze",
  "Breach",
  "Skye",
  "Yoru",
  "Astra",
  "Kayo",
  "Chamber",
  "Neon",
  "Fade",
];

export enum Map {
  Bind = "BIND",
  Haven = "HAVEN",
  Split = "SPLIT",
  Ascent = "ASCENT",
  Icebox = "ICEBOX",
  Breeze = "BREEZ",
  Pearl = "PEARL",
  Fracture = "FRACTURE",
}

export const MapArr: string[] = [
  "BIND",
  "HAVEN",
  "SPLIT",
  "ASCENT",
  "ICEBOX",
  "BREEZE",
  "PEARL",
  "FRACTURE",
];

// helper function to help map over values in JSX componentes
export const TypedKeys = <T extends {}>(object: T): (keyof T)[] => {
  return Object.keys(object) as (keyof T)[];
};
