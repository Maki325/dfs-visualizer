import runDFS from './DFS';
import GraphView from './GraphView';
import MapInput from './MapInput';
import runShortestDFS from './ShortestDFS';
import './style.css';

const mapInput = new MapInput(
  document.getElementById('input')! as HTMLTextAreaElement,
  document.getElementById('save')! as HTMLButtonElement,
);

const canvas = document.getElementById('app')! as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const graphView = new GraphView(
  canvas,
  document.getElementById('start')! as HTMLInputElement,
  document.getElementById('end')! as HTMLInputElement,
  document.getElementById('timestep')! as HTMLInputElement,
  mapInput,
);
graphView.render();

runDFS(document.getElementById('runDFS')! as HTMLButtonElement, graphView);
runShortestDFS(document.getElementById('runShortestDFS')! as HTMLButtonElement, graphView);
