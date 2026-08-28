import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invoiceKeys } from '../invoices/keys'
import type { Id } from '../types'
import { feeKeys } from './keys'
import { feesService } from './service'
import type { AllocateFeeBody, FeeBody, FeeListParams } from './types'

export function useFees(params: FeeListParams = {}) {
  return useQuery({
    queryKey: feeKeys.list(params),
    queryFn: () => feesService.list(params),
  })
}

export function useFeeOptions() {
  return useQuery({
    queryKey: feeKeys.options(),
    queryFn: () => feesService.options(),
    staleTime: Infinity,
  })
}

export function useFee(id: Id | undefined) {
  return useQuery({
    queryKey: feeKeys.detail(id ?? ''),
    queryFn: () => feesService.get(id!),
    enabled: id !== undefined,
  })
}

export function useCreateFee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: FeeBody) => feesService.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: feeKeys.lists() }),
  })
}

export function useUpdateFee(id: Id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: FeeBody) => feesService.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: feeKeys.all }),
  })
}

export function useDeactivateFee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: Id) => feesService.deactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: feeKeys.all }),
  })
}

export function useActivateFee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: Id) => feesService.activate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: feeKeys.all }),
  })
}

/** Allocating raises invoices, so the invoice lists go stale too. */
export function useAllocateFee(id: Id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AllocateFeeBody) => feesService.allocate(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
    },
  })
}

export function useDeleteFee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, force }: { id: Id; force?: boolean }) => feesService.remove(id, force),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: feeKeys.all }),
  })
}
