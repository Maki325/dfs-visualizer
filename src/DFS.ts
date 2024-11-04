import GraphView from "./GraphView";
import type { Node } from "./types";

export default function runDFS(runDFS: HTMLButtonElement, graphView: GraphView) {
  runDFS.addEventListener('click', async () => {
    await graphView.render(0);
    const {ctx, nodeMap, mapInput: {map}} = graphView;
  
    const start = graphView.start.value;
    const end = graphView.end.value;
  
    let hasError = false;
    if(!nodeMap.has(start)) {
      graphView.start.classList.add('error');
      hasError = true;
    } else {
      graphView.start.classList.remove('error');
    }
    if(!nodeMap.has(end)) {
      graphView.end.classList.add('error');
      hasError = true;
    } else {
      graphView.end.classList.remove('error');
    }
  
    if(hasError) return;
  
    const stack: {last: string; current: string}[] = [{last: start, current: start}];
    const visited: Node[] = [];
  
    const path: string[] = [];
  
    while(stack.length !== 0) {
      const {current, last} = stack.pop()!;
      if(visited.some((node) => node.name === current)) continue;
      const dist = current === last ? 0 : map.get(last)!.find((node) => node.name === current)!.distance;
      visited.push({
        name: current,
        distance: (visited.find((node) => node.name === last)?.distance ?? 0) + dist,
      });
  
      if(path.includes(last)) {
        while(path.includes(last)) {
          path.pop();
        }
        path.push(last);
      }
      path.push(current);
  
      {
        const {x, y} = nodeMap.get(current)!;
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(x, y, GraphView.RADIUS, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
  
        ctx.font = "30px Comic Sans MS";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(current, x, y + 10);
      }
  
      stack.push(...map.get(current)!.sort((a, b) => b.distance - a.distance).map((node) => ({last: current, current: node.name})));
      if(end === current) break;
      if(await graphView.waitAndCheck()) return;
    }
  
    for(let i = 0; i < path.length;i++) {
      const node = path[i];
      const {x, y} = nodeMap.get(node)!;

      if(i !== 0) {
        const parent = path[i - 1];
        const {x: parentX, y: parentY} = nodeMap.get(parent)!;

        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(parentX, parentY);
        ctx.stroke();
        ctx.lineWidth = 1;

        ctx.strokeStyle = "black";
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(parentX, parentY, GraphView.RADIUS, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.font = "30px Comic Sans MS";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(parent, parentX, parentY + 10);
      }

      ctx.fillStyle = "green";
      ctx.beginPath();
      ctx.arc(x, y, GraphView.RADIUS, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
  
      ctx.font = "30px Comic Sans MS";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(node, x, y + 10);
  
      if(await graphView.waitAndCheck()) return;
    }
  });
}
