import { createFileRoute } from '@tanstack/react-router';
import { registerCollections } from '@/db/collections/attendance';
import { pageSearch } from '@/lib/search';
import { RegisterPage } from '@/portals/teacher/features/attendance/register-page';

export const Route = createFileRoute('/teacher/attendance')({
  // Which class and which day the roll is being taken for — the coverage page
  // links a missing day straight to its register.
  validateSearch: pageSearch(['arm', 'date']),
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
  staticData: { title: 'Take attendance', crumb: 'Teaching' },
  component: RegisterPage,
});
