import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './krds/dark.generated.css';
import './krds/syntax.generated.css';
import './styles.css';
import './screens/screens.css';

createRoot(document.getElementById('root')).render(<App />);
