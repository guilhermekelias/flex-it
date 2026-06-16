import { render } from 'preact';
import './index.css';
import { App } from './app';
import { registerServiceWorker } from './registerServiceWorker';

render(<App />, document.getElementById('app')!);
registerServiceWorker();
