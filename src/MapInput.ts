import type { NeighbourMap } from "./types";

const DEFAULT_MAP: NeighbourMap = new Map([
  [
    'A',
    [
      { name: 'S', distance: 3 },
      { name: 'B', distance: 4 },
      { name: 'D', distance: 5 },
    ],
  ],
  [
    'B',
    [
      { name: 'C', distance: 2 },
      { name: 'A', distance: 4 },
      { name: 'D', distance: 6 },
    ],
  ],
  [
    'C',
    [
      { name: 'B', distance: 2 },
    ],
  ],
  [
    'D',
    [
      { name: 'E', distance: 2 },
      { name: 'A', distance: 5 },
      { name: 'B', distance: 6 },
      { name: 'S', distance: 10 },
    ],
  ],
  [
    'E',
    [
      { name: 'D', distance: 2 },
      { name: 'F', distance: 4 },
    ],
  ],
  [
    'F',
    [
      { name: 'G', distance: 3 },
      { name: 'E', distance: 4 },
    ],
  ],
  [
    'G',
    [
      { name: 'F', distance: 3 },
    ],
  ],
  [
    'S',
    [
      { name: 'A', distance: 3 },
      { name: 'D', distance: 10 },
    ],
  ],
]);

export function mapToText(map: NeighbourMap) {
  let text = '';
  for(const [key, value] of map) {
    text += `${key}: ${value.map((node) => `${node.name}(${node.distance})`).join(', ')}\n`;
  }
  return text;
}

export function textToMap(text: string): NeighbourMap {
  const map: NeighbourMap = new Map();

  for(const line of text.split('\n').map(line => line.trim())) {
    if(!line) continue;
    const parts = line.split(':').map((str) => str.trim());
    const key = parts[0];

    const connections = parts[1].split(',').map((str) => str.trim()).map((conn) => {
      const [name, count] = conn.split('(').map((str) => str.trim());

      return {
        name,
        distance: parseInt(count.replace(')', '').trim()),
      };
    })
    .sort((a, b) => a.distance - b.distance);

    map.set(key, connections);
  }

  return map;
}

type Listener = (map: NeighbourMap) => void;

export default class MapInput {
  private _map: NeighbourMap;
  private listeners: Listener[] = [];

  constructor(private input: HTMLTextAreaElement, private save: HTMLButtonElement) {
    this._map = new Map(DEFAULT_MAP);
    this.input.value = mapToText(this.map);

    this.save.addEventListener('click', () => {
      this.map = textToMap(this.input.value);
    });
  }

  set map(newMap: NeighbourMap) {
    this._map = newMap;
    this.input.value = mapToText(this._map);
    this.listeners.forEach((listener) => listener(this._map));
  }

  get map() {
    return this._map;
  }

  addListener(listener: (map: NeighbourMap) => void) {
    this.listeners.push(listener);
  }

  removeListener(listener: (map: NeighbourMap) => void) {
    this.listeners.splice(this.listeners.indexOf(listener), 1);
  }
}
