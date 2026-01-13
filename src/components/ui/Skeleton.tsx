'use client'

interface SkeletonProps {
  className?: string
}

/**
 * Basic skeleton element
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  )
}

/**
 * Skeleton for table row
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-700">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full max-w-50" />
        </td>
      ))}
    </tr>
  )
}

/**
 * Skeleton for stat card on dashboard
 */
export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
      <Skeleton className="w-12 h-12 rounded-xl mb-4" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

/**
 * Skeleton for card item (jadwal, etc)
 */
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-1" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Skeleton className="flex-1 h-8 rounded-lg" />
        <Skeleton className="flex-1 h-8 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Skeleton for list/mobile card item
 */
export function ListItemSkeleton() {
  return (
    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="w-10 h-10 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for warta/pengumuman list
 */
export function WartaListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
        {Array.from({ length: count }).map((_, i) => (
          <ListItemSkeleton key={i} />
        ))}
      </div>
      {/* Desktop */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left"><Skeleton className="h-3 w-16" /></th>
              <th className="px-6 py-4 text-left"><Skeleton className="h-3 w-16" /></th>
              <th className="px-6 py-4 text-left"><Skeleton className="h-3 w-16" /></th>
              <th className="px-6 py-4 text-right"><Skeleton className="h-3 w-12 ml-auto" /></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: count }).map((_, i) => (
              <TableRowSkeleton key={i} columns={4} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

/**
 * Skeleton for dashboard stats grid
 */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for cards grid (jadwal, etc)
 */
export function CardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
