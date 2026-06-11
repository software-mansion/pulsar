import { describe, it, expect } from '@jest/globals';
import { buildPayloadFromFile, RestFile } from '../src/figma-design';

// Helper: a stored binding as the plugin writes it into sharedPluginData.
function binding(presetId: string, presetName: string, isCustom = false) {
  return {
    pulsar: {
      binding: JSON.stringify({
        presetId,
        presetName,
        isCustom,
        preset: {
          name: presetName,
          description: '',
          tags: isCustom ? ['Custom'] : [],
          duration: 1,
          discretePattern: [{ time: 0, amplitude: 1, frequency: 0.5 }],
          continuousPattern: { amplitude: [], frequency: [] },
        },
      }),
    },
  };
}

const box = (x: number, y: number, width: number, height: number) => ({ x, y, width, height });

describe('buildPayloadFromFile', () => {
  it('extracts bound elements, descendants, frames and a present node', () => {
    const file: RestFile = {
      document: {
        id: '0:0',
        name: 'Document',
        type: 'DOCUMENT',
        children: [
          {
            id: '0:1',
            name: 'Page 1',
            type: 'CANVAS',
            children: [
              {
                id: '1:1',
                name: 'Home',
                type: 'FRAME',
                absoluteBoundingBox: box(0, 0, 375, 812),
                children: [
                  {
                    id: '1:2',
                    name: 'CTA Button',
                    type: 'INSTANCE',
                    absoluteBoundingBox: box(20, 700, 335, 48),
                    sharedPluginData: binding('success', 'Success'),
                    children: [
                      {
                        id: '1:3',
                        name: 'Label',
                        type: 'TEXT',
                        absoluteBoundingBox: box(30, 712, 100, 24),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    const payload = buildPayloadFromFile('FILEKEY', file);

    expect(payload.fileKey).toBe('FILEKEY');
    // Present node is the first frame-like on the first page.
    expect(payload.nodeId).toBe('1:1');
    expect(payload.frame).toEqual({ x: 0, y: 0, w: 375, h: 812 });

    // One bound element with its frame + box.
    expect(payload.elements).toHaveLength(1);
    expect(payload.elements[0]).toMatchObject({
      id: '1:2',
      name: 'CTA Button',
      presetName: 'Success',
      frameId: '1:1',
      isCustom: false,
    });
    expect(payload.elements[0].box).toEqual({ x: 20, y: 700, w: 335, h: 48 });

    // The bound node and its descendant both resolve to the preset, and the
    // descendant's owner points back at the bound node.
    expect(payload.bindings['1:2']).toBeDefined();
    expect(payload.bindings['1:3']).toBeDefined();
    expect(payload.owner['1:3']).toBe('1:2');
    expect(payload.owner['1:2']).toBe('1:2');

    // Frame map keyed by the frame id.
    expect(payload.frames['1:1']).toEqual({ name: 'Home', box: { x: 0, y: 0, w: 375, h: 812 } });
  });

  it('marks custom presets and groups frameId by the outermost frame ancestor', () => {
    const file: RestFile = {
      document: {
        id: '0:0',
        name: 'Document',
        type: 'DOCUMENT',
        children: [
          {
            id: '0:1',
            name: 'Page 1',
            type: 'CANVAS',
            children: [
              {
                id: '2:1',
                name: 'Outer',
                type: 'FRAME',
                absoluteBoundingBox: box(0, 0, 400, 900),
                children: [
                  {
                    id: '2:2',
                    name: 'Inner',
                    type: 'FRAME',
                    absoluteBoundingBox: box(10, 10, 380, 880),
                    children: [
                      {
                        id: '2:3',
                        name: 'Buzz',
                        type: 'INSTANCE',
                        absoluteBoundingBox: box(20, 20, 100, 40),
                        sharedPluginData: binding('custom-1', 'My Buzz', true),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    const payload = buildPayloadFromFile('K', file);
    expect(payload.elements[0].isCustom).toBe(true);
    // Outermost frame-like ancestor wins (matches PRESENTED_NODE_CHANGED).
    expect(payload.elements[0].frameId).toBe('2:1');
    expect(payload.frames['2:1']).toBeDefined();
  });

  it('returns an empty payload (no elements) for a file with no bindings', () => {
    const file: RestFile = {
      document: {
        id: '0:0',
        name: 'Document',
        type: 'DOCUMENT',
        children: [
          {
            id: '0:1',
            name: 'Page 1',
            type: 'CANVAS',
            children: [
              { id: '3:1', name: 'Empty', type: 'FRAME', absoluteBoundingBox: box(0, 0, 10, 10) },
            ],
          },
        ],
      },
    };
    const payload = buildPayloadFromFile('K', file);
    expect(payload.elements).toEqual([]);
    expect(Object.keys(payload.bindings)).toEqual([]);
    // Still reports a present node so the embed can open.
    expect(payload.nodeId).toBe('3:1');
  });

  it('ignores malformed shared plugin data without throwing', () => {
    const file: RestFile = {
      document: {
        id: '0:0',
        name: 'Document',
        type: 'DOCUMENT',
        children: [
          {
            id: '0:1',
            name: 'Page 1',
            type: 'CANVAS',
            children: [
              {
                id: '4:1',
                name: 'Bad',
                type: 'FRAME',
                absoluteBoundingBox: box(0, 0, 10, 10),
                sharedPluginData: { pulsar: { binding: '{not json' } },
              },
            ],
          },
        ],
      },
    };
    const payload = buildPayloadFromFile('K', file);
    expect(payload.elements).toEqual([]);
  });
});
