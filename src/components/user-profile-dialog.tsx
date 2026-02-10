import { useEffect, useState } from 'react'
import { useUserStore } from '@/store/useUserStore'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

export function UserProfileDialog() {
  const { isOpen, setOpen, profile, updateProfile, generateBirthChart } = useUserStore()
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [birthDateStr, setBirthDateStr] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(profile.name || '')
      setGender(profile.gender || 'male')
      if (profile.birthDate) {
        // Format date for datetime-local input: YYYY-MM-DDTHH:mm
        const date = new Date(profile.birthDate)
        // Handle timezone offset for local display
        const offset = date.getTimezoneOffset()
        const localDate = new Date(date.getTime() - offset * 60 * 1000)
        setBirthDateStr(localDate.toISOString().slice(0, 16))
      } else {
        setBirthDateStr('')
      }
    }
  }, [isOpen, profile])

  const handleSave = async () => {
    if (!birthDateStr) return

    setIsSaving(true)
    try {
      const birthDate = new Date(birthDateStr)
      updateProfile({
        name,
        gender,
        birthDate
      })
      
      // Generate birth chart immediately
      await generateBirthChart()
      
      setOpen(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>设置个人命盘信息</DialogTitle>
          <DialogDescription>
            请输入您的出生信息，系统将为您生成终身命盘，并在解盘时作为参考。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right text-sm font-medium">
              姓名
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="gender" className="text-right text-sm font-medium">
              性别
            </label>
            <div className="col-span-3 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === 'male'}
                  onChange={() => setGender('male')}
                />
                男
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === 'female'}
                  onChange={() => setGender('female')}
                />
                女
              </label>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="birthdate" className="text-right text-sm font-medium">
              出生时间
            </label>
            <Input
              id="birthdate"
              type="datetime-local"
              value={birthDateStr}
              onChange={(e) => setBirthDateStr(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存并生成命盘
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
