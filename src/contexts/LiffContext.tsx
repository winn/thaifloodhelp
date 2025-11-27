import liff from '@line/liff'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

interface LiffProfile {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}

interface LiffContextType {
  isLiffInitialized: boolean
  isLoggedIn: boolean
  isInLiffClient: boolean
  profile: LiffProfile | null
  error: string | null
  isLoading: boolean
  login: () => void
  logout: () => void
  shareTargetPicker: () => Promise<void>
  isShareAvailable: boolean
}

const LiffContext = createContext<LiffContextType | undefined>(undefined)

const LIFF_ID = import.meta.env.VITE_LIFF_ID || ''

function mobileCheck(): boolean {
  const userAgent = navigator.userAgent || ''
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent,
  )
}

export function LiffProvider({ children }: { children: ReactNode }) {
  const [isLiffInitialized, setIsLiffInitialized] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isInLiffClient, setIsInLiffClient] = useState(false)
  const [profile, setProfile] = useState<LiffProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initLiff = async () => {
      if (!LIFF_ID) {
        console.warn('LIFF_ID is not set. LIFF features will be disabled.')
        setIsLoading(false)
        return
      }

      try {
        if (liff.isInClient()) {
          await liff.init({ liffId: LIFF_ID })
          setIsLiffInitialized(true)
          setIsInLiffClient(true)
          if (liff.isLoggedIn()) {
            setIsLoggedIn(true)
            await fetchProfile()
          } else {
            liff.login()
          }
        } else {
          setIsInLiffClient(false)
          if (mobileCheck()) {
            window.location.replace(`line://app/${LIFF_ID}`)
            setTimeout(() => {
              window.close()
            }, 5000)
          } else {
            await liff.init({
              liffId: LIFF_ID,
              withLoginOnExternalBrowser: false,
            })
            setIsLiffInitialized(true)
            if (liff.isLoggedIn()) {
              setIsLoggedIn(true)
              await fetchProfile()
            }
          }
        }
      } catch (err) {
        console.error('LIFF initialization failed:', err)
        setError(
          err instanceof Error ? err.message : 'LIFF initialization failed',
        )
      } finally {
        setIsLoading(false)
      }
    }

    initLiff()
  }, [])

  const fetchProfile = async () => {
    try {
      const liffProfile = await liff.getProfile()
      setProfile({
        userId: liffProfile.userId,
        displayName: liffProfile.displayName,
        pictureUrl: liffProfile.pictureUrl,
        statusMessage: liffProfile.statusMessage,
      })
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    }
  }

  const login = () => {
    if (isLiffInitialized && !isLoggedIn) {
      liff.login()
    }
  }

  const logout = () => {
    if (isLiffInitialized && isLoggedIn) {
      liff.logout()
      setIsLoggedIn(false)
      setProfile(null)
      window.location.reload()
    }
  }

  const shareTargetPicker = async () => {
    if (!isLiffInitialized) {
      console.warn('LIFF is not initialized')
      return
    }

    // If not in LIFF client and not logged in, redirect to LINE login first
    if (!liff.isInClient() && !liff.isLoggedIn()) {
      liff.login()
      return
    }

    if (!liff.isApiAvailable('shareTargetPicker')) {
      console.warn('ShareTargetPicker is not available')
      // Fallback: open LINE share URL
      const shareUrl = 'https://miniapp.line.me/2008569116-rGyQw3mA'
      const shareText = `ช่วยกันส่งข้อมูลน้ำท่วมผ่าน AI Platform นี้ครับ
หากพบโพสต์ขอความช่วยเหลือในโซเชียลฯ ฝากนำมากรอกในลิงก์นี้ เพื่อให้ข้อมูลเป็นระบบและช่วยเหลือได้ไวขึ้นครับ

${shareUrl}
#น้ำท่วม #TechForGood #ThaiFloodHelp #น้ำท่วมไทย`
      const lineShareUrl = `https://line.me/R/share?text=${encodeURIComponent(shareText)}`
      window.open(lineShareUrl, '_blank')
      return
    }

    try {
      await liff.shareTargetPicker([
        {
          type: 'text',
          text: `ช่วยกันส่งข้อมูลน้ำท่วมผ่าน AI Platform นี้ครับ
หากพบโพสต์ขอความช่วยเหลือในโซเชียลฯ ฝากนำมากรอกในลิงก์นี้ เพื่อให้ข้อมูลเป็นระบบและช่วยเหลือได้ไวขึ้นครับ

https://miniapp.line.me/2008569116-rGyQw3mA
#น้ำท่วม #TechForGood #ThaiFloodHelp #น้ำท่วมไทย`,
        },
      ])
    } catch (err) {
      console.error('ShareTargetPicker error:', err)
      throw err
    }
  }

  const isShareAvailable =
    isLiffInitialized && (liff.isApiAvailable?.('shareTargetPicker') || false)

  return (
    <LiffContext.Provider
      value={{
        isLiffInitialized,
        isLoggedIn,
        isInLiffClient,
        profile,
        error,
        isLoading,
        login,
        logout,
        shareTargetPicker,
        isShareAvailable,
      }}
    >
      {children}
    </LiffContext.Provider>
  )
}

export function useLiff() {
  const context = useContext(LiffContext)
  if (context === undefined) {
    throw new Error('useLiff must be used within a LiffProvider')
  }
  return context
}
