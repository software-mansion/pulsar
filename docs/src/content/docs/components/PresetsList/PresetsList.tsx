import style from './PresetsList.module.scss';
import infoIcon from '../../assets/new_assets/info.svg';
import { Filters } from '../Filters/Filters';
import { Preset } from '../Preset/Preset';
import { useState, useMemo, useEffect } from 'react';
import { TagsModal } from '../TagsModal/TagsModal';
import { TagsInfo } from './Tags';
import { PresetsConfig } from '../../assets/presets/PresetsConfig';
import { AndroidPresetsConfig, IOSPresetsConfig } from '../../assets/systemPresets/SystemPresetsConfig';
import { NoResult } from '../NoResult/NoResult';
import { ChartModal } from '../ChartModal/ChartModal';

const COMPACT_LAYOUT_KEY = 'presets_compact_layout';
const FAVOURITES_KEY = 'presets_favourites';
const SOUND_ENABLED_KEY = 'presets_sound_enabled';

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export function PresetsList() {
  const [showModal, setShowModal] = useState<'no' | 'tags' | 'chart'>('no');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSystemPresets, setSelectedSystemPresets] = useState<string[]>([]);
  const [compactLayout, setCompactLayout] = useState<boolean>(
    () => typeof window !== 'undefined' && localStorage.getItem(COMPACT_LAYOUT_KEY) === 'true'
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    () => typeof window === 'undefined' || localStorage.getItem(SOUND_ENABLED_KEY) !== 'false'
  );
  const [favourites, setFavourites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVOURITES_KEY);
      if (stored) setFavourites(new Set(JSON.parse(stored)));
    } catch {}
  }, []);
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);

  function handleCompactToggle(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.checked;
    setCompactLayout(value);
    localStorage.setItem(COMPACT_LAYOUT_KEY, String(value));
  }

  function handleSoundToggle(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.checked;
    setSoundEnabled(value);
    localStorage.setItem(SOUND_ENABLED_KEY, String(value));
    window.posthog?.capture(value ? 'preset_sound_enabled' : 'preset_sound_disabled');
  }

  function handleToggleFavourite(presetName: string) {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(presetName)) {
        next.delete(presetName);
        window.posthog?.capture('preset_unfavourited', { preset_name: presetName });
      } else {
        next.add(presetName);
        window.posthog?.capture('preset_favourited', { preset_name: presetName });
      }
      localStorage.setItem(FAVOURITES_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }

  const androidSystemPresetTagMap: Record<string, string> = {
    'Android Primitives': 'Primitive',
    'Android Effects': 'Effect',
    'Android Vendor': 'Vendor',
  };

  const activePresets = useMemo(() => {
    if (selectedSystemPresets.length > 0) {
      let result: typeof PresetsConfig = [];
      if (selectedSystemPresets.includes('iOS')) {
        result = [...result, ...IOSPresetsConfig];
      }
      const selectedAndroidTags = selectedSystemPresets
        .filter((s) => s in androidSystemPresetTagMap)
        .map((s) => androidSystemPresetTagMap[s]);
      if (selectedAndroidTags.length > 0) {
        const androidFiltered = AndroidPresetsConfig.filter((preset) =>
          selectedAndroidTags.some((tag) => preset.data.tags.includes(tag)),
        );
        result = [...result, ...androidFiltered];
      }
      return result;
    }
    return PresetsConfig;
  }, [selectedSystemPresets]);

  function handleSetSelectedTags(tags: string[] | ((tags: string[]) => string[])) {
    if (typeof tags === 'function') {
      setSelectedTags(tags);
    } else {
      setSelectedTags(tags);
      if (tags.length > 0) {
        window.posthog?.capture('preset_filter_applied', {
          selected_tags: tags,
          tag_count: tags.length,
        });
      }
    }
  }
  const selectedTagsByGroup = useMemo(() => {
    const grouped: Record<string, string[]> = {};

    selectedTags.forEach((tagName) => {
      TagsInfo.forEach((group) => {
        const tagExists = group.tags.some((tag) => tag.name === tagName);
        if (tagExists) {
          if (!grouped[group.groupName]) {
            grouped[group.groupName] = [];
          }
          grouped[group.groupName].push(tagName);
        }
      });
    });

    return grouped;
  }, [selectedTags]);

  const filteredPresets = useMemo(() => {
    let result = activePresets;

    if (selectedTags.length > 0) {
      result = result.filter((preset) => {
        const presetTagLabels = preset.data.tags;
        for (const groupName in selectedTagsByGroup) {
          const selectedTagsInGroup = selectedTagsByGroup[groupName];
          const hasTagFromGroup = selectedTagsInGroup.some((tagName) =>
            presetTagLabels.includes(tagName),
          );
          if (!hasTagFromGroup) return false;
        }
        return true;
      });
    }

    if (showFavouritesOnly) {
      result = result.filter((preset) => favourites.has(preset.data.name));
    }

    return result;
  }, [selectedTags, selectedTagsByGroup, activePresets, showFavouritesOnly, favourites]);

  return (
    <div className={['not-content', style.presets].join(' ')}>
      <div className={style.header}>
        <div className={style.title}>Presets</div>
        <div className={style.info}>
          <div className={style.inner} onClick={() => setShowModal('tags')}>
            <div>Learn more about tags</div>
            <img src={infoIcon.src} />
          </div>
          <div className={style.inner} onClick={() => setShowModal('chart')}>
            <div>Learn more about chart visualization</div>
            <img src={infoIcon.src} />
          </div>
        </div>
      </div>

      <Filters
        selectedTags={selectedTags}
        setSelectedTags={handleSetSelectedTags}
        selectedSystemPresets={selectedSystemPresets}
        setSelectedSystemPresets={setSelectedSystemPresets}
      />

      <div className={style.togglesRow}>
        <label className={style.compactToggle}>
          <input type="checkbox" checked={compactLayout} onChange={handleCompactToggle} />
          Compact list
        </label>
        <label className={style.compactToggle}>
          <input type="checkbox" checked={soundEnabled} onChange={handleSoundToggle} />
          Enable sound
        </label>
        <label className={style.compactToggle}>
          <input type="checkbox" checked={showFavouritesOnly} onChange={(e) => setShowFavouritesOnly(e.target.checked)} />
          Show favourites only
        </label>
      </div>

      {filteredPresets.length > 0 && (
        <div className={style.resultCount}>{filteredPresets.length} results</div>
      )}

      {filteredPresets.length === 0 && <NoResult />}

      {filteredPresets.map((preset) => (
        <Preset
          key={preset.data.name}
          {...preset}
          compact={compactLayout}
          soundEnabled={soundEnabled}
          isFavourite={favourites.has(preset.data.name)}
          onToggleFavourite={() => handleToggleFavourite(preset.data.name)}
        />
      ))}

      {showModal === 'tags' && <TagsModal onClose={() => setShowModal('no')} />}
      {showModal === 'chart' && <ChartModal onClose={() => setShowModal('no')} />}
    </div>
  );
}
