import type {
  GeneratedCard,
  GeneratedEntity,
} from "metabase/api/ai-streaming/schemas";
import type { UnsavedCard } from "metabase-types/api";

import { serializedQuestion } from "./questions";

export function newMetabotConversation({ prompt }: { prompt: string }) {
  return `/metabot/new?q=${encodeURIComponent(prompt)}`;
}

export function generatedCard(card: GeneratedCard) {
  const unsavedCard: UnsavedCard = {
    dataset_query: card.query.query,
    display: card.display ?? "table",
    visualization_settings: {},
    displayIsLocked: card.display != null,
  };
  return serializedQuestion(unsavedCard, { includeDisplayIsLocked: true });
}

export function generatedEntity(entity: GeneratedEntity) {
  switch (entity.type) {
    case "card":
      return generatedCard(entity);
    case "dashboard":
      return entity.url;
  }
}
