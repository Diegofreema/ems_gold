import { createFileRoute } from '@tanstack/react-router';
import { CollectionPage } from '@/portals/student/components/collection-page';
import { tests } from '@/portals/student/collections/assessment';

export const Route = createFileRoute('/student/tests/')({
  staticData: { title: 'Tests', crumb: 'Assessment' },
  component: () => <CollectionPage definition={tests} />,
});
