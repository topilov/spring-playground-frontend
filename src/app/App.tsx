import { RouterProvider } from 'react-router-dom';

import './app.css';
import { appRouter } from './router';

export function App() {
  return <RouterProvider router={appRouter} />;
}
