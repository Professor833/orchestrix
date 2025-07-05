'use client'

import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { Archive, Download, RefreshCw, Upload } from 'lucide-react'
import { toast } from 'sonner'

export function WorkflowActions() {
  const queryClient = useQueryClient()

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['workflows'] })
    toast.success('Workflows refreshed!')
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Bulk actions:</span>
        <Button variant="outline" size="sm">
          <Archive className="mr-2 h-4 w-4" />
          Archive Selected
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  )
}
