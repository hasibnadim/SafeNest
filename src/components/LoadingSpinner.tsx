import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
  fullScreen?: boolean
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />
      {text && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

// Skeleton loading component
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'animate-pulse bg-gray-200 rounded',
      className
    )}
  />
)

// Page loading component
export const PageLoader: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <LoadingSpinner 
    size="lg" 
    text={message} 
    fullScreen 
    className="space-y-4"
  />
)

// Inline loading component
export const InlineLoader: React.FC<{ text?: string }> = ({ 
  text = 'Loading...' 
}) => (
  <LoadingSpinner 
    size="sm" 
    text={text} 
    className="py-4"
  />
) 