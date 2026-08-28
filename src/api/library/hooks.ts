import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Id } from '../types'
import { libraryKeys } from './keys'
import { libraryService } from './service'
import type { BookBody, BookSearchParams, LendBookBody } from './types'

export function useBooks(params: BookSearchParams = {}) {
  return useQuery({
    queryKey: libraryKeys.books(params),
    queryFn: () => libraryService.books(params),
  })
}

export function useAddBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: BookBody) => libraryService.addBook(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: libraryKeys.all }),
  })
}

export function useUpdateBook(id: Id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: BookBody) => libraryService.updateBook(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: libraryKeys.all }),
  })
}

export function useBorrowedBooks() {
  return useQuery({
    queryKey: libraryKeys.borrowed(),
    queryFn: () => libraryService.borrowed(),
  })
}

/** Lending changes both the loan list and the copy's availability. */
export function useLendBook(id: Id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: LendBookBody) => libraryService.lend(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: libraryKeys.all }),
  })
}

export function useReturnBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: Id) => libraryService.returnBook(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: libraryKeys.all }),
  })
}
