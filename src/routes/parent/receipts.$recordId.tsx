import { createFileRoute, notFound } from '@tanstack/react-router'
import { receipts } from '@/portals/parent/collections'
import { ReceiptView } from '@/portals/parent/features/receipts/receipt-view'

export const Route = createFileRoute('/parent/receipts/$recordId')({
  loader: ({ params }) => {
    const receipt = receipts.rows?.find((row) => row.id === params.recordId)
    if (!receipt) throw notFound()
    return {
      receipt,
      heading: { title: receipt.receipt, crumb: 'Finance · Receipts' },
    }
  },
  component: Receipt,
})

/*
 * `useLoaderData()` is briefly undefined when this route is already mounted and
 * the next navigation's loader throws `notFound()` — React renders the
 * component once more before the not-found boundary takes over. Bailing out of
 * that render keeps the 404 clean instead of crashing into the error boundary.
 */
function Receipt() {
  const loaded = Route.useLoaderData()
  if (!loaded) return null
  return <ReceiptView receipt={loaded.receipt} />
}
