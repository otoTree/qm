'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { QimenReport as QimenReportType } from '@/types/qimen'
import { Calendar, Clock, Star, Compass, Target, Lightbulb } from 'lucide-react'

interface QimenReportProps {
  report: QimenReportType
  className?: string
}

export function QimenReport({ report, className }: QimenReportProps) {
  const { result, input } = report
  
  const formatDateTime = (datetime: Date) => {
    return datetime.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long'
    })
  }
  
  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      general: '综合运势',
      career: '事业工作',
      love: '感情婚姻',
      wealth: '财运投资',
      health: '健康养生',
      study: '学业考试',
      travel: '出行旅游',
      decision: '决策选择'
    }
    return labels[type] || type
  }
  
  const renderPanInfo = (title: string, data: string[], icon: React.ReactNode) => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {data.map((item, index) => {
            const gongNames = ['坎', '艮', '震', '巽', '离', '坤', '兑', '乾', '中']
            return (
              <div key={index} className="text-center p-2 bg-muted/50 rounded">
                <div className="text-xs text-muted-foreground mb-1">
                  {gongNames[index] || `${index + 1}`}
                </div>
                <div className="text-sm font-medium">{item}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              奇门遁甲排盘
            </CardTitle>
            <Badge variant="secondary">
              {getQuestionTypeLabel(input.questionType)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">排盘时间：</span>
              <span className="font-medium">{formatDateTime(input.datetime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">性别：</span>
              <span className="font-medium">{input.gender === 'male' ? '男' : '女'}</span>
            </div>
          </div>
          
          {/* 基础信息 */}
          {result.basicInfo && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">公历：</span>{result.basicInfo.gongli}</div>
                <div><span className="text-muted-foreground">农历：</span>{result.basicInfo.nongli}</div>
                <div><span className="text-muted-foreground">四柱：</span>{result.basicInfo.sizhu}</div>
                <div><span className="text-muted-foreground">值符：</span>{result.basicInfo.zhifu}</div>
                <div><span className="text-muted-foreground">值使：</span>{result.basicInfo.zhishi}</div>
                <div><span className="text-muted-foreground">遁局：</span>{result.basicInfo.dunju}</div>
              </div>
            </div>
          )}
          
          <Separator />
          
        </CardContent>
      </Card>
      
      {/* Pan Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 天盘 */}
        {renderPanInfo(
          '天盘（九星）',
          result.tianpan,
          <Star className="w-4 h-4" />
        )}
        
        {/* 地盘 */}
        {renderPanInfo(
          '地盘（三奇六仪）',
          result.dipan,
          <Compass className="w-4 h-4" />
        )}
        
        {/* 人盘 */}
        {renderPanInfo(
          '人盘（八门）',
          result.renpan,
          <Target className="w-4 h-4" />
        )}
        
        {/* 神盘 */}
        {renderPanInfo(
          '神盘（八神）',
          result.shenpan,
          <Lightbulb className="w-4 h-4" />
        )}
      </div>
      
      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-4">
        <div>报告生成时间：{new Date(report.timestamp).toLocaleString('zh-CN')}</div>
        <div className="mt-1">报告ID：{report.id}</div>
      </div>
    </div>
  )
}