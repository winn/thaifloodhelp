import { SendMessagesParams } from '@liff/send-messages'
import liff from '@line/liff'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import { ErrorUtils } from '@/utils/ErrorUtils'

interface LiffProfile {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}

interface ShareTargetPickerOptions {
  text: string
  messages?: SendMessagesParams[number][]
  isMultiple?: boolean
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
  shareTargetPicker: (options: ShareTargetPickerOptions) => Promise<boolean>
  isShareAvailable: boolean
  getLIFFUrl: (path?: string) => Promise<string>
}

const LiffContext = createContext<LiffContextType | undefined>(undefined)

const LIFF_ID = import.meta.env.VITE_LIFF_ID || ''

function isMobile() {
  const regex =
    /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  return regex.test(navigator.userAgent)
}

const useLiffContextValue = (): LiffContextType => {
  const isInit = useRef(false)

  const [error, setError] = useState<string | null>(null)

  // Loading state during LIFF initialization
  const [isLoading, setIsLoading] = useState(true)

  // Ensure LIFF is initialized, for LIFF features
  const [isLiffInitialized, setIsLiffInitialized] = useState(false)

  // LIFF State
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isInLiffClient, setIsInLiffClient] = useState(false)
  const [profile, setProfile] = useState<LiffProfile | null>(null)

  const initializeLIFF = useCallback(async () => {
    try {
      if (!LIFF_ID) {
        console.warn('LIFF_ID is not set. LIFF features will be disabled.')
        throw new Error('LIFF_ID is not set')
      }

      if (isMobile() && !liff.isInClient()) {
        // Redirect mobile browsers to LINE app
        window.location.replace(`line://app/${LIFF_ID}`)
        setTimeout(() => {
          window.close()
        }, 5000)
        return
      }

      // Initialize LIFF
      await liff.init({ liffId: LIFF_ID })
      setIsLiffInitialized(true)

      const isInClient = liff.isInClient()
      setIsInLiffClient(isInClient)

      const isLoggedIn = liff.isLoggedIn()
      setIsLoggedIn(isLoggedIn)

      if (!isLoggedIn) {
        liff.login()
        return
      }

      await fetchProfile()
    } catch (error) {
      console.error('LIFF initialization failed:', error)
      setError(ErrorUtils.getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isInit.current) {
      return
    }

    isInit.current = true

    initializeLIFF()
  }, [initializeLIFF])

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
      setError(ErrorUtils.getErrorMessage(err))
    }
  }

  const isLiffInitializedCheck = () => {
    if (!isLiffInitialized) {
      console.warn('LIFF is not initialized')
    }

    return isLiffInitialized
  }

  const login = () => {
    if (!isLiffInitializedCheck()) {
      return
    }

    if (liff.isLoggedIn()) {
      console.warn('Already logged in')
      return
    }

    return liff.login()
  }

  const logout = () => {
    if (!isLiffInitializedCheck()) {
      return
    }

    if (!liff.isLoggedIn()) {
      console.warn('Not logged in')
      return
    }

    liff.logout()
    setIsLoggedIn(false)
    setProfile(null)
    window.location.reload()
  }

  const shareTargetPicker = async ({
    text,
    messages = [],
    isMultiple,
  }: ShareTargetPickerOptions) => {
    if (!isLiffInitializedCheck()) {
      return false
    }

    // If not in LIFF client and not logged in, redirect to LINE login first
    if (!liff.isLoggedIn()) {
      console.warn('Not logged in. Redirecting to login.')
      liff.login()
      return false
    }

    if (!liff.isApiAvailable('shareTargetPicker')) {
      console.warn('ShareTargetPicker is not available')
      // Fallback: open LINE share URL
      const lineShareUrl = `https://line.me/R/share?text=${encodeURIComponent(text)}`
      window.open(lineShareUrl, '_blank')
      return true
    }

    try {
      const result = await liff.shareTargetPicker(
        messages.length > 0 ? messages : [{ type: 'text', text }],
        { isMultiple },
      )

      if (result && result.status === 'success') {
        console.log('Content shared successfully')
        return true
      } else {
        console.log('ShareTargetPicker was cancelled or failed')
        return false
      }
    } catch (err) {
      console.error('ShareTargetPicker error:', err)
      throw err
    }
  }

  const getLIFFUrl = async (path: string = '/') => {
    if (!isLiffInitializedCheck()) {
      return ''
    }

    return liff.permanentLink.createUrlBy(window.location.origin + path)
  }

  const isShareAvailable =
    isLiffInitialized && (liff.isApiAvailable?.('shareTargetPicker') || false)

  return {
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
    getLIFFUrl,
  }
}

export function LiffProvider({ children }: { children: ReactNode }) {
  const value = useLiffContextValue()

  return <LiffContext.Provider value={value}>{children}</LiffContext.Provider>
}

export function useLiff() {
  const context = useContext(LiffContext)
  if (context === undefined) {
    throw new Error('useLiff must be used within a LiffProvider')
  }
  return context
}
