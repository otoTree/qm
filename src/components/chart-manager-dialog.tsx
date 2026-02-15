import { useState } from 'react'
import { useUserStore } from '@/store/useUserStore'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Trash2, User, Plus } from 'lucide-react'

export function ChartManagerDialog() {
  const { 
    isChartManagerOpen, 
    setChartManagerOpen, 
    savedProfiles, 
    addSavedProfile, 
    removeSavedProfile 
  } = useUserStore()

  const [newName, setNewName] = useState('')
  const [newGender, setNewGender] = useState<'male' | 'female'>('male')
  const [newBirthDateStr, setNewBirthDateStr] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = async () => {
    if (!newName || !newBirthDateStr) return

    setIsAdding(true)
    try {
      const birthDate = new Date(newBirthDateStr)
      await addSavedProfile({
        name: newName,
        gender: newGender,
        birthDate,
        relationship: '',
        notes: ''
      })
      
      // Reset form
      setNewName('')
      setNewGender('male')
      setNewBirthDateStr('')
    } catch (error) {
      console.error('Error adding profile:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个命盘吗？')) {
      removeSavedProfile(id)
    }
  }

  return (
    <Dialog open={isChartManagerOpen} onOpenChange={setChartManagerOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>命盘管理</DialogTitle>
          <DialogDescription>
            管理多人的命盘信息，可以在对话中通过 @ 引用。
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-6">
          {/* List of saved profiles */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">已保存的命盘 ({savedProfiles.length})</h3>
            <ScrollArea className="h-[200px] w-full rounded-md border p-2">
              {savedProfiles.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  暂无保存的命盘
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {savedProfiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{profile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {profile.gender === 'male' ? '男' : '女'} · {new Date(profile.birthDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(profile.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <Separator />

          {/* Add new profile form */}
          <div className="grid gap-4">
            <h3 className="text-sm font-medium">添加新命盘</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="newName" className="text-xs font-medium">姓名</label>
                <Input
                  id="newName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="请输入姓名"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium">性别</label>
                <div className="flex h-10 items-center gap-4 rounded-md border px-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="newGender"
                      checked={newGender === 'male'}
                      onChange={() => setNewGender('male')}
                    />
                    男
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="newGender"
                      checked={newGender === 'female'}
                      onChange={() => setNewGender('female')}
                    />
                    女
                  </label>
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="newBirthDate" className="text-xs font-medium">出生日期</label>
              <Input
                id="newBirthDate"
                type="datetime-local"
                value={newBirthDateStr}
                onChange={(e) => setNewBirthDateStr(e.target.value)}
              />
            </div>

            <Button onClick={handleAdd} disabled={isAdding || !newName || !newBirthDateStr} className="w-full">
              {isAdding ? (
                <>添加中...</>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> 添加命盘
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

