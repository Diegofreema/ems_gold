import { createFileRoute } from '@tanstack/react-router';
import { pageSearch } from '@/lib/search';
import { RegisterPage } from '@/portals/teacher/features/attendance/register-page';

export const Route = createFileRoute('/teacher/attendance')({
  // Which class and which day the roll is being taken for — the coverage page
  // links a missing day straight to its register.
  validateSearch: pageSearch(['arm', 'date']),
  staticData: { title: 'Take attendance', crumb: 'Teaching' },
  component: RegisterPage,
});
