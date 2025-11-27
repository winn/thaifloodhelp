import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { useLiff } from '@/contexts/LiffContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { ErrorUtils } from '@/utils/ErrorUtils'

const Auth = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { user } = useAuth()
  const {
    isLiffInitialized,
    isLoading: isLiffLoading,
    login: liffLogin,
  } = useLiff()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const from = location.state?.from || '/'

  useEffect(() => {
    if (user) {
      navigate(from)
    }
  }, [user, navigate, from])

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const redirectUrl = `${window.location.origin}/`

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      toast({
        title: 'ลงทะเบียนสำเร็จ',
        description: 'คุณสามารถเข้าสู่ระบบได้ทันที',
      })

      setEmail('')
      setPassword('')
      setFullName('')
    } catch (error: unknown) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: ErrorUtils.getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast({
        title: 'เข้าสู่ระบบสำเร็จ',
      })

      navigate(from)
    } catch (error: unknown) {
      const message = ErrorUtils.getErrorMessage(error)
      toast({
        title: 'เกิดข้อผิดพลาด',
        description:
          message === 'Invalid login credentials'
            ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
            : message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: ErrorUtils.getErrorMessage(error),
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  const handleLineSignIn = () => {
    if (!isLiffInitialized) return
    liffLogin()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            เข้าสู่ระบบ Thai Flood Help
          </CardTitle>
          <CardDescription className="text-center">
            เข้าสู่ระบบเพื่อใช้งานฟีเจอร์เต็มรูปแบบ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              เข้าสู่ระบบด้วย Google
            </Button>

            <Button
              className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white"
              onClick={handleLineSignIn}
              disabled={loading || isLiffLoading || !isLiffInitialized}
            >
              {isLiffLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.5c-5.52 0-10 3.58-10 8 0 4.42 4.48 8 10 8 5.52 0 10-3.58 10-8s-4.48-8-10-8zm0 14c-4.41 0-8-2.69-8-6s3.59-6 8-6 8 2.69 8 6-3.59 6-8 6z" />
                  <path d="M12 11h-2v2h2v2h2v-2h2v-2h-2V9h-2v2z" />
                  <path d="M24 10.5c0 4.42-4.48 8-10 8-1.08 0-2.11-.14-3.09-.39l-4.14 2.29c-.46.25-1.02-.08-1.02-.61v-2.04c-3.33-1.65-5.75-4.7-5.75-8.25C0 5.08 5.37 1.5 12 1.5s12 3.58 12 9z" />
                </svg>
              )}
              เข้าสู่ระบบด้วย LINE
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  หรือ
                </span>
              </div>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">เข้าสู่ระบบ</TabsTrigger>
                <TabsTrigger value="signup">ลงทะเบียน</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">อีเมล</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">รหัสผ่าน</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    เข้าสู่ระบบ
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">ชื่อ-นามสกุล</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="ชื่อของคุณ"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">อีเมล</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">รหัสผ่าน</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    ลงทะเบียน
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>การ login เป็น optional</p>
            <p className="mt-1">คุณยังสามารถใช้งานระบบได้โดยไม่ต้อง login</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Auth
