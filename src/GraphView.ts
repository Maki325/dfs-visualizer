import MapInput from "./MapInput";

type NodeMap = Map<string, {x: number; y: number; key: string;}>;

export default class GraphView {
  static RADIUS = 40;
  static OFFSET = 100;

  public ctx: CanvasRenderingContext2D;
  public nodeMap: NodeMap = new Map();
  private idx = 0;

  constructor(
    public canvas: HTMLCanvasElement,
    public start: HTMLInputElement,
    public end: HTMLInputElement,
    public timestep: HTMLInputElement,
    public mapInput: MapInput,
  ) {
    this.onResize = this.onResize.bind(this);
    this.rebuild = this.rebuild.bind(this);
    this.render = this.render.bind(this);

    this.rebuild();

    this.ctx = this.canvas.getContext('2d')!;

    window.addEventListener('resize', this.onResize);
    this.mapInput.addListener(() => {
      this.rebuild();
      this.render();
    });
  }

  public getTimestep() {
    return parseInt(this.timestep.value, 10);
  }

  public async waitAndCheck(ms = this.getTimestep()) {
    const idx = this.idx;
    await new Promise((resolve) => setTimeout(resolve, ms));
    return idx !== this.idx;
  }

  private onResize() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.rebuild();
    this.render();
  }

  private rebuild() {
    const {nodeMap, mapInput: {map}} = this;
    nodeMap.clear();

    if(map.size === 0) return;

    type Item = {key: string; row: number;};
    const firstKey = map.keys().next().value;
    const queue: Item[] = [{key: firstKey, row: 0}];
    const visited = new Map<string, boolean>();
    const nodesPerRow = new Map<number, number>();

    const uniqueNodes = [];
    while(queue.length !== 0) {
      const {key, row} = queue.shift()!;
      if(visited.has(key)) continue;
      visited.set(key, true);
      const oldRow = nodesPerRow.get(row) ?? 0;
      nodesPerRow.set(row, oldRow + 1);

      uniqueNodes.push({key, row, i: oldRow});

      const added: string[] = [];
      for(const node of map.get(key)!) {
        const has = added.some((n) => map.get(n)!.some((n) => n.name === node.name));
        queue.push({
          key: node.name,
          row: row + 1 + (has ? 1 : 0),
        });
        added.push(node.name);
      }
    }

    let heighestY = 0;
    for(const {key, row, i} of uniqueNodes) {
      const y = (row + 1) * GraphView.OFFSET;
      const nodes = nodesPerRow.get(row)!;
      const x = this.canvas.width / (nodes + 1) * (i + 1);

      nodeMap.set(key, {x, y, key});
      if(y > heighestY) heighestY = y;
    }

    this.canvas.height = heighestY + GraphView.OFFSET;
    this.canvas.style.height = `${heighestY + GraphView.OFFSET}px`;
  }

  async render(msWait = this.getTimestep()) {
    this.idx++;
    const {ctx, nodeMap, mapInput: {map}} = this;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if(nodeMap.size === 0) return;

    const start = nodeMap.keys().next().value;
    const stack: {last: string; current: string; distance: number;}[] = [{last: start, current: start, distance: 0}];
    const visited: string[] = [];
    const lineVisited: {start: string; end: string; x: number; y: number;}[] = [];

    while(stack.length !== 0) {
      const {current, last, distance} = stack.pop()!;

      {
        const {x, y} = nodeMap.get(current)!;
        const {x: parentX, y: parentY} = nodeMap.get(last)!;

        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(parentX, parentY);
        ctx.stroke();

        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x, y, GraphView.RADIUS, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(parentX, parentY, GraphView.RADIUS, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.font = "30px Comic Sans MS";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(last, parentX, parentY + 10);

        ctx.fillText(current, x, y + 10);

        ctx.font = "15px Comic Sans MS";
        ctx.fillStyle = "red";

        const line = lineVisited.find(({start, end}) => (start === last && end === current) || (start === current && end === last));
        if(line) {
          ctx.fillText(
            `${distance}`,
            line.x,
            line.y,
          );
        } else {
          const len = Math.sqrt(Math.pow(parentX - x, 2) + Math.pow(parentY - y, 2));

          if(len < 101) {
            const lineX = (parentX + x) / 2 + 10;
            const lineY = (parentY + y) / 2 + 5;
            ctx.fillText(
              `${distance}`,
              lineX,
              lineY,
            );

            lineVisited.push({start: last, end: current, x: lineX, y: lineY});
          } else {
            const topX = parentX > parentX ? parentX : x;
            const topY = parentX > parentX ? parentY: y;
    
            const bottomX = parentX > parentX ? x : parentX;
            const bottomY = parentX > parentX ? y : parentY;
    
            const halfX = (topX + bottomX) / 2;
            const halfY = (topY + bottomY) / 2;

            const lineX = (halfX + bottomX) / 2;
            const lineY = (halfY + bottomY) / 2 - 5;

            ctx.fillText(
              `${distance}`,
              lineX,
              lineY,
            );
            
            lineVisited.push({start: last, end: current, x: lineX, y: lineY});
          }
        }
      }
      
      if(visited.includes(current)) continue;
      visited.push(current);

      stack.push(...map.get(current)!.sort((a, b) => b.distance - a.distance).map((node) => ({last: current, current: node.name, distance: node.distance})));

      if(msWait === 0 ? false : await this.waitAndCheck(msWait)) return;
    }
  }
}
