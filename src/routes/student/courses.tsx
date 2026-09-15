import { createFileRoute } from '@tanstack/react-router';
import { freshenRegister } from '@/features/collections/freshen';
import { CollectionPage } from '@/portals/student/components/collection-page';
import { courses } from '@/portals/student/collections/learning';

export const Route = createFileRoute('/student/courses')({
  staticData: { title: 'My subjects', crumb: 'Learning' },
  // Opened, and asked for again: the set is on the device and stays
  // readable with no connection, but a page that never asks shows what
  // the school said whenever this device last happened to sync.
  loader: () => freshenRegister(courses),
  component: () => <CollectionPage definition={courses} />,
});
