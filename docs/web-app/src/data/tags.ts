import { TagsInfo } from '../../../src/content/docs/components/PresetsList/Tags';

/**
 * Tag copy is shared with the docs presets playground so the two never drift.
 */
export { TagsInfo };

export type TagGroup = (typeof TagsInfo)[number];

export function groupsForTags(availableTags: Set<string>): TagGroup[] {
  return TagsInfo.map((group) => ({
    ...group,
    tags: group.tags.filter((tag) => availableTags.has(tag.name)),
  })).filter((group) => group.tags.length > 0);
}
