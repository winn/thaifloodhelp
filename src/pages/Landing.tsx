import { motion } from 'framer-motion'
import { MessageSquarePlus, Search, HandHeart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import heroFlood from '@/assets/hero-flood.jpg'
import { Button } from '@/components/ui/button'
import { useLandingStats } from '@/hooks/use-stats'
import { useHelpStats } from '@/hooks/use-help-stats'
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'



const Landing = () => {
  const navigate = useNavigate();
  const {
    data: stats = {
      totalReports: 0,
      helpedCount: 0,
      urgentCount: 0
    }
  } = useLandingStats();
  
  const { data: helpStats = { helpRequestsCount: 0, helpOffersCount: 0 } } = useHelpStats();
  
  const [mode, setMode] = useState<'during' | 'after'>('during');
  
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
          
          {/* Mode Toggle - During/After Flood */}
          <motion.div variants={itemVariants} className="flex justify-center mb-4 md:mb-6">
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'during' | 'after')} className="w-auto">
              <TabsList className="bg-white/20 backdrop-blur-md border border-white/30 p-1">
                <TabsTrigger 
                  value="during" 
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-white font-medium px-6 py-2"
                >
                  During Flood
                </TabsTrigger>
                <TabsTrigger 
                  value="after" 
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-white font-medium px-6 py-2"
                >
                  After Flood
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Dynamic Description based on mode */}
          {mode === 'during' ? (
            <>
              <motion.p variants={itemVariants} className="text-sm sm:text-base md:text-lg text-white mb-6 md:mb-8 font-medium px-4 max-w-4xl mx-auto drop-shadow-md [text-shadow:_0_1px_8px_rgb(0_0_0_/_50%)]">
                ช่วยกันรวบรวมข้อมูลที่กระจัดกระจายตามช่องทางต่างๆ
                <br />
                โดยให้ AI สกัดออกมาเป็นประเด็นสำคัญ
                เพื่อให้การช่วยเหลือได้รวดเร็วขึ้น
              </motion.p>
            </>
          ) : (
            <>
              <motion.p variants={itemVariants} className="text-sm sm:text-base md:text-lg text-white mb-6 md:mb-8 font-medium px-4 max-w-4xl mx-auto drop-shadow-md [text-shadow:_0_1px_8px_rgb(0_0_0_/_50%)]">
                เชื่อมโยงผู้ประสบภัยกับอาสาสมัคร
                <br />
                โพสต์ความต้องการหรือเสนอความช่วยเหลือ
                เพื่อฟื้นฟูชีวิตหลังน้ำลด
              </motion.p>
            </>
          )}

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

          {/* Real-time Stats with Glassmorphism - Dynamic based on mode */}
          {mode === 'during' ? (
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
          ) : (
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-3 md:gap-4 max-w-md md:max-w-2xl mx-auto mb-6 md:mb-8 px-4"
            >
              <div className="bg-white/15 backdrop-blur-lg rounded-lg md:rounded-xl p-4 md:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 will-change-transform">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1">
                  {helpStats.helpRequestsCount}
                </div>
                <div className="text-xs sm:text-sm text-white/80">
                  ผู้ต้องการความช่วยเหลือ
                </div>
              </div>
              <div className="bg-white/15 backdrop-blur-lg rounded-lg md:rounded-xl p-4 md:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 will-change-transform">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1">
                  {helpStats.helpOffersCount}
                </div>
                <div className="text-xs sm:text-sm text-white/80">
                  อาสาสมัคร/ผู้ให้ความช่วยเหลือ
                </div>
              </div>
            </motion.div>
          )}

          {/* CTA Buttons - Dynamic based on mode */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-3 md:gap-4 justify-center items-center max-w-xl md:max-w-2xl mx-auto px-4"
          >
            {mode === 'during' ? (
              <>
                {/* During Flood CTAs */}
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

                <Button
                  size="lg"
                  className="w-full text-xs sm:text-sm md:text-base h-12 sm:h-14 px-4 sm:px-6 md:px-8 bg-white text-blue-600 hover:bg-white/90 shadow-xl font-semibold rounded-lg hover:scale-[1.02] active:scale-100 transition-transform duration-200"
                  onClick={() => navigate('/dashboard')}
                >
                  <Search className="mr-2 h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0" />
                  <span>ค้นหาผู้ประสบภัย</span>
                </Button>
              </>
            ) : (
              <>
                {/* After Flood CTAs */}
                <Button
                  size="lg"
                  className="w-full text-sm sm:text-base md:text-lg h-14 sm:h-16 md:h-18 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl shadow-orange-500/50 font-bold rounded-lg md:rounded-xl border-2 border-white/30 hover:scale-[1.02] active:scale-100 transition-transform duration-200"
                  onClick={() => navigate('/help-browse')}
                >
                  <HandHeart className="mr-2 h-5 sm:h-6 md:h-7 w-5 sm:w-6 md:w-7 flex-shrink-0" />
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-sm sm:text-base md:text-lg leading-tight">
                      ขอและให้ความช่วยเหลือ
                    </span>
                    <span className="text-xs font-normal opacity-90 hidden sm:block leading-tight">
                      เชื่อมโยงผู้ต้องการกับอาสาสมัคร
                    </span>
                  </div>
                </Button>

                <Button
                  size="lg"
                  className="w-full text-xs sm:text-sm md:text-base h-12 sm:h-14 px-4 sm:px-6 md:px-8 bg-white text-blue-600 hover:bg-white/90 shadow-xl font-semibold rounded-lg hover:scale-[1.02] active:scale-100 transition-transform duration-200"
                  onClick={() => navigate('/help-browse')}
                >
                  <Search className="mr-2 h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0" />
                  <span>ดูรายการทั้งหมด</span>
                </Button>
              </>
            )}
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}

export default Landing;