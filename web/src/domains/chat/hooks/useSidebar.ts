import { useCallback, useState } from 'react'

type UseSidebarResult = {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
}

export function useSidebar(): UseSidebarResult {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false)
  }, [])

  return { isSidebarOpen, toggleSidebar, closeSidebar }
}
