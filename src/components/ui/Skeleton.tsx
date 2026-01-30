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

/**
 * Skeleton for homepage Renungan card (Hero section)
 */
export function RenunganHomeSkeleton() {
  return (
    <div className="bg-blue-900/60 backdrop-blur-md rounded-2xl p-6 border border-white/30 max-w-md animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-yellow-400/50"></div>
        <div className="h-3 bg-white/20 rounded w-28"></div>
      </div>
      <div className="h-5 bg-white/20 rounded w-3/4 mb-3"></div>
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-white/15 rounded w-full"></div>
        <div className="h-4 bg-white/15 rounded w-5/6"></div>
        <div className="h-4 bg-white/15 rounded w-4/6"></div>
      </div>
      <div className="h-3 bg-white/10 rounded w-1/3"></div>
    </div>
  )
}

/**
 * Skeleton for homepage Jadwal sidebar (Hero section)
 */
export function JadwalHomeSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-white/5 rounded-xl animate-pulse"
        >
          <div className="w-12 h-12 rounded-full bg-white/10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-3 bg-white/10 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for Warta card grid on homepage
 */
export function WartaCardHomeSkeleton() {
  return (
    <div className="bg-(--bg-secondary) rounded-2xl overflow-hidden border border-(--border) animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-6 space-y-3">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>
  )
}

export function WartaGridHomeSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <WartaCardHomeSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for Pengumuman list on homepage
 */
export function PengumumanHomeSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-col sm:flex-row sm:items-start gap-4 p-6 bg-(--bg-primary) rounded-2xl border border-(--border) animate-pulse"
        >
          <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for mobile Jadwal section
 */
export function JadwalMobileHomeSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-(--bg-secondary) rounded-xl animate-pulse"
        >
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

