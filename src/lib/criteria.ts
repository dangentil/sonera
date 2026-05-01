export type CriterionKey =
  | "lyrics"
  | "personal_impact"
  | "musical_richness"
  | "authenticity"
  | "production"
  | "track_dynamics"
  | "mix_master"
  | "historical_weight"
  | "branding_storytelling"
  | "musicianship"
  | "bangers"
  | "emotion"
  | "creativity";

export interface Criterion {
  key: CriterionKey;
  name: string;
  weight: number;
  description: string;
}

export const CRITERIA: Criterion[] = [
  { key: "lyrics", name: "Letras", weight: 3, description: "Qualidade lírica, profundidade e coerência" },
  { key: "personal_impact", name: "Impacto Pessoal", weight: 3, description: "O quanto o álbum te marcou" },
  { key: "musical_richness", name: "Riqueza Musical", weight: 3, description: "Diversidade e complexidade musical" },
  { key: "authenticity", name: "Autenticidade", weight: 2, description: "Originalidade e identidade genuína" },
  { key: "production", name: "Produção / Arranjo", weight: 3, description: "Qualidade da produção e arranjos" },
  { key: "track_dynamics", name: "Dinâmica das Faixas", weight: 2, description: "Fluxo e progressão entre faixas" },
  { key: "mix_master", name: "Mix / Master", weight: 2, description: "Qualidade do tratamento do áudio" },
  { key: "historical_weight", name: "Peso Histórico", weight: 2, description: "Relevância na história da música" },
  { key: "branding_storytelling", name: "Branding / Storytelling", weight: 1, description: "Narrativa visual e conceitual" },
  { key: "musicianship", name: "Qualidade Técnica", weight: 2, description: "Habilidade dos músicos envolvidos" },
  { key: "bangers", name: "Bangers", weight: 2, description: "Quantidade de hits certeiros" },
  { key: "emotion", name: "Emoção", weight: 3, description: "Capacidade de despertar emoções" },
  { key: "creativity", name: "Criatividade", weight: 3, description: "Inovação e experimentação" },
];

export const TOTAL_WEIGHT = CRITERIA.reduce((s, c) => s + c.weight, 0);

export function weightedScore(scores: Partial<Record<CriterionKey, number>>): number {
  const sum = CRITERIA.reduce((s, c) => s + (scores[c.key] ?? 0) * c.weight, 0);
  return sum / TOTAL_WEIGHT;
}