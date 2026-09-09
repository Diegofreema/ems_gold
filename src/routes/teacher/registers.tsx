import { createFileRoute } from '@tanstack/react-router';
import { registerCollections } from '@/db/collections/attendance';
import { CoveragePage } from '@/portals/teacher/features/attendance/coverage-page';

export const Route = createFileRoute('/teacher/registers')({
  /**
   * The arms, the school's words for a mark and the days themselves, readied
   * before the page draws. Started rather than awaited and its failure
   * swallowed: a device that already holds them opens on them, and one that
   * does not says so on the page rather than in an error boundary.
   */
  loader: () => {
    for (const collection of registerCollections) {
      void collection.preload().catch(() => undefined);
    }
  },
  staticData: { title: 'Registers taken', crumb: 'Teaching' },
  component: CoveragePage,
});
