'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
// import { Badge } from './ui/badge'
import { Calendar, Clock, TrendingUp, Users } from 'lucide-react'

interface ActivityData {
  totalSessions: number
  averageSessionTime: number
  lastActive: string
  toolsUsed: string[]
  weeklyActivity: number[]
}

interface UserActivityTrackerProps {
  userId: string
  isOwnProfile?: boolean
}

export const UserActivityTracker: React.FC<UserActivityTrackerProps> = ({
  userId,
}) => {
  const [activityData, setActivityData] = useState<ActivityData>({
    totalSessions: 0,
    averageSessionTime: 0,
    lastActive: 'Never',
    toolsUsed: [],
    weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading activity data
    const loadActivityData = async () => {
      setIsLoading(true)
      // In a real app, this would fetch from an API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setActivityData({
        totalSessions: Math.floor(Math.random() * 50) + 10,
        averageSessionTime: Math.floor(Math.random() * 30) + 5,
        lastActive: new Date().toLocaleDateString(),
        toolsUsed: ['QR Generator', 'JSON Calculator', 'Byte Converter'],
        weeklyActivity: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)),
      })
      setIsLoading(false)
    }

    loadActivityData()
  }, [userId])

  // const getActivityLevel = (activity: number) => {
  //   if (activity > 80) return { level: 'High', color: 'bg-green-500' }
  //   if (activity > 50) return { level: 'Medium', color: 'bg-yellow-500' }
  //   return { level: 'Low', color: 'bg-gray-500' }
  // }

  const getMostUsedTool = () => {
    if (activityData.toolsUsed.length === 0) return 'None'
    return activityData.toolsUsed[0]
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Activity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {activityData.totalSessions}
              </div>
              <div className="text-sm text-gray-500">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {activityData.averageSessionTime}m
              </div>
              <div className="text-sm text-gray-500">Avg. Session</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activityData.weeklyActivity.map((activity, index) => {
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
              
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 text-sm text-gray-500">{dayNames[index]}</div>
                  <Progress value={activity} className="flex-1" />
                  <span className="w-16 text-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {activity}%
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tools Used */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Tools Used
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activityData.toolsUsed.length > 0 ? (
              activityData.toolsUsed.map((tool, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{tool}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Used</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No tools used yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Last Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Last Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {activityData.lastActive}
            </div>
            <div className="text-sm text-gray-500">
              Most used tool: {getMostUsedTool()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 