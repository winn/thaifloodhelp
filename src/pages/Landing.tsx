import { motion } from 'framer-motion'
import { MessageSquarePlus, Search, HandHeart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import heroFlood from '@/assets/hero-flood.jpg'
import { Button } from '@/components/ui/button'
import { useLandingStats } from '@/hooks/use-stats'
import { useEffect, useState } from 'react'



const Landing = () => {
  const navigate = useNavigate();
  const {
    data: stats = {
      totalReports: 0,
      helpedCount: 0,
      urgentCount: 0
    }
  } = useLandingStats();
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };
  const itemVariants = {
    hidden: {
      y: 30,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  const [hatyaiRainfall, setHatyaiRainfall] = useState<number | string>('กำลังโหลด...')

  useEffect(() => {
    let mounted = true

    const fetchRainfall = async () => {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=7.0084&longitude=100.4767&current=precipitation&timezone=Asia%2FBangkok&forecast_days=1'
        )
        const data = await res.json()
        const rainfall = data?.current?.precipitation ?? 'N/A'
        if (mounted) setHatyaiRainfall(rainfall)
      } catch (error) {
        console.error('Error fetching rainfall data:', error)
        if (mounted) setHatyaiRainfall('N/A')
      }
    }

    fetchRainfall()

    return () => {
      mounted = false
    }
  }, [])

  const getHatyaiRainfall = () => hatyaiRainfall

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative overflow-hidden py-12 md:py-16 px-4 min-h-[calc(100vh-4rem)] flex items-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroFlood})` }}
        />
        {/* Dark gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        <motion.div className="max-w-6xl mx-auto text-center relative z-10 w-full" initial="hidden" animate="visible" variants={containerVariants}>
          <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight px-4 drop-shadow-lg [text-shadow:_0_2px_10px_rgb(0_0_0_/_40%)]">
            Thai Flood Help
          </motion.h1>

          <motion.p variants={itemVariants} className="text-sm sm:text-base md:text-lg text-white mb-2 md:mb-3 font-medium px-4 max-w-4xl mx-auto drop-shadow-md [text-shadow:_0_1px_8px_rgb(0_0_0_/_50%)]">
            เว็บไซต์ที่ช่วยรวบรวมข้อมูลที่กระจัดกระจายตามช่องทางต่างๆ
            <br />
            โดยให้ AI สกัดออกมาเป็นประเด็นสำคัญ
            เพื่อให้การช่วยเหลือได้รวดเร็วขึ้น
          </motion.p>

          <motion.p variants={itemVariants} className="text-sm sm:text-base md:text-lg text-white/90 mb-4 md:mb-6 px-4 drop-shadow-md [text-shadow:_0_1px_6px_rgb(0_0_0_/_50%)]">
            ทุกวินาที • มีคนรอความช่วยเหลือ
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base md:text-lg text-white/90 mb-4 md:mb-6 px-4 drop-shadow-md [text-shadow:_0_1px_6px_rgb(0_0_0_/_50%)]"
          >
            หาดใหญ่ ปริมาณน้ำฝนรายชั่วโมง {getHatyaiRainfall()} มม.
          </motion.p>

          {/* Technology Badges */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8 text-xs sm:text-sm px-4">
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-medium border border-white/30 whitespace-nowrap">
              🎧 Social Listening
            </div>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-medium border border-white/30 whitespace-nowrap">
              👥 Crowd Sourcing
            </div>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-medium border border-white/30 whitespace-nowrap">
              🤖 AI Technology
            </div>
          </motion.div>

          {/* Real-time Stats with Glassmorphism */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 gap-3 md:gap-4 max-w-md md:max-w-2xl mx-auto mb-6 md:mb-8 px-4"
          >
            <div className="bg-white/15 backdrop-blur-lg rounded-lg md:rounded-xl p-4 md:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 will-change-transform">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1">
                {stats.totalReports}
              </div>
              <div className="text-xs sm:text-sm text-white/80">
                รายงานในระบบ
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-lg rounded-lg md:rounded-xl p-4 md:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 will-change-transform">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1">
                {stats.urgentCount}
              </div>
              <div className="text-xs sm:text-sm text-white/80">
                เคสเร่งด่วน
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-3 md:gap-4 justify-center items-center max-w-xl md:max-w-2xl mx-auto px-4"
          >
            {/* Primary CTA - ช่วยใส่ข้อมูล */}
            <Button
              size="lg"
              className="w-full text-sm sm:text-base md:text-lg h-14 sm:h-16 md:h-18 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl shadow-orange-500/50 font-bold rounded-lg md:rounded-xl border-2 border-white/30 hover:scale-[1.02] active:scale-100 transition-transform duration-200"
              onClick={() => navigate('/extraction')}
            >
              <MessageSquarePlus className="mr-2 h-5 sm:h-6 md:h-7 w-5 sm:w-6 md:w-7 flex-shrink-0" />
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm sm:text-base md:text-lg leading-tight">
                  ช่วยใส่ข้อมูลจาก Social
                </span>
                <span className="text-xs font-normal opacity-90 hidden sm:block leading-tight">
                  คุณสามารถช่วยชีวิตได้ด้วยการใส่ข้อมูล
                </span>
              </div>
            </Button>

            {/* Help/Job Match CTA */}
            <Button
              size="lg"
              className="w-full text-sm sm:text-base md:text-lg h-14 sm:h-16 md:h-18 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl shadow-orange-500/50 font-bold rounded-lg md:rounded-xl border-2 border-white/30 hover:scale-[1.02] active:scale-100 transition-transform duration-200"
              onClick={() => navigate('/help-browse')}
            >
              <HandHeart className="mr-2 h-5 sm:h-6 md:h-7 w-5 sm:w-6 md:w-7 flex-shrink-0" />
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm sm:text-base md:text-lg leading-tight">
                  ขอความช่วยเหลือ
                </span>
                <span className="text-xs font-normal opacity-90 hidden sm:block leading-tight">
                  โพสต์ความต้องการความช่วยเหลือของคุณ
                </span>
              </div>
            </Button>

            {/* Secondary CTA - ค้นหา */}
            <Button
              size="lg"
              className="w-full text-xs sm:text-sm md:text-base h-12 sm:h-14 px-4 sm:px-6 md:px-8 bg-white text-blue-600 hover:bg-white/90 shadow-xl font-semibold rounded-lg hover:scale-[1.02] active:scale-100 transition-transform duration-200"
              onClick={() => navigate('/dashboard')}
            >
              <Search className="mr-2 h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0" />
              <span>ค้นหาผู้ประสบภัย</span>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}

export default Landing;