import './globals.css';
import { ActivityProvider } from '@/components/activity-context';
import { Shell } from '@/components/shell';

export const metadata = {
  title: { default: 'ActivaTrack | Gestión de actividades', template: '%s | ActivaTrack' },
  description: 'Organiza, registra y haz seguimiento a las actividades de tu equipo.',
  icons: { icon: '/icon.svg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <ActivityProvider>
          <Shell>{children}</Shell>
        </ActivityProvider>
      </body>
    </html>
  );
}
