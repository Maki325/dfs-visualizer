import GraphView from "./GraphView";

export default function runShortestDFS(runShortestDFS: HTMLButtonElement, graphView: GraphView) {
  runShortestDFS.addEventListener('click', async () => {
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

    const stack: {last: string | null; current: string; distance: number}[] = [
      {last: null, current: start, distance: 0},
    ];
    const visited: {
      name: string;
      distance: number;
      parent: string | null;
    }[] = [];

    while(stack.length !== 0) {
      const {current, last, distance} = stack.pop()!;
      const node = visited.find((node) => node.name === current);
      if(node && node.distance < distance) continue;
      if(node) {
        node.distance = distance;
        node.parent = last;
      } else {
        visited.push({
          name: current,
          distance,
          parent: last,
        });
      }

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

      stack.push(
        ...map.get(current)!
        .sort((a, b) => b.distance - a.distance)
        .map((node) => ({last: current, current: node.name, distance: distance + node.distance}))
      );
      if(await graphView.waitAndCheck()) return;
    }

    const path: {current: string; parent: string | null;}[] = [];

    let key: string | null = end;
    while(true) {
      if(key === null) break;
      const node = visited.find((node) => node.name === key)!;
      path.unshift({current: node.name, parent: node.parent});
      key = node.parent;
    }

    for(const {current, parent} of path) {
      const {x, y} = nodeMap.get(current)!;

      if(parent) {
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
      ctx.fillText(current, x, y + 10);


      if(await graphView.waitAndCheck()) return;
    }
  });
}
