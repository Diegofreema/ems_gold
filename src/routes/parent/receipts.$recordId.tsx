import { createFileRoute, notFound } from '@tanstack/react-router'
import { receipts } from '@/portals/parent/collections'
import { ReceiptView } from '@/portals/parent/features/receipts/receipt-view'

export const Route = createFileRoute('/parent/receipts/$recordId')({
  loader: ({ params }) => {
    const receipt = receipts.rows.find((row) => row.id === params.recordId)
    if (!receipt) throw notFound()
    return {
      receipt,
      heading: { title: receipt.receipt, crumb: 'Finance · Receipts' },
    }
  },
  component: Receipt,
})

function Receipt() {
  return <ReceiptView receipt={Route.useLoaderData().receipt} />
}
