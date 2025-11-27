import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MessageSquarePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroFlood from "@/assets/hero-flood.jpg";
import MissionSections from "@/components/MissionSections";

const Landing = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalReports: 0,
    helpedCount: 0,
    urgentCount: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Run queries in parallel for better performance
      const [totalResult, helpedResult, urgentResult] = await Promise.all([
        supabase.from('reports').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('reports').select('*', { count: 'exact', head: true }).gte('urgency_level', 4)
      ]);

      setStats({
        totalReports: totalResult.count || 0,
        helpedCount: helpedResult.count || 0,
        urgentCount: urgentResult.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Keep current stats or show 0 - don't crash the page
      setStats({ totalReports: 0, helpedCount: 0, urgentCount: 0 });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative overflow-hidden py-12 md:py-16 px-4 min-h-screen flex items-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${heroFlood})` }}>
        {/* Black overlay with 50% opacity */}
        <div className="absolute inset-0 bg-black/50 z-0" />

        <motion.div
          className="max-w-6xl mx-auto text-center relative z-10 w-full"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight px-4"
          >
            Thai Flood Help
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base md:text-lg text-white/95 mb-2 md:mb-3 font-medium px-4 max-w-4xl mx-auto"
          >
            เว็บไซต์ที่ช่วยรวบรวมข้อมูลที่กระจัดกระจายตามช่องทางต่างๆ
            <br />
            โดยให้ AI สกัดออกมาเป็นประเด็นสำคัญ เพื่อให้การช่วยเหลือได้รวดเร็วขึ้น
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base md:text-lg text-white/80 mb-4 md:mb-6 px-4"
          >
            ทุกวินาที • มีคนรอความช่วยเหลือ
          </motion.p>

          {/* Technology Badges */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8 text-xs sm:text-sm px-4"
          >
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
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 max-w-2xl mx-auto mb-6 md:mb-8 px-4 justify-items-center sm:justify-items-stretch"
          >
            <div className="w-full max-w-xs sm:max-w-none bg-white/15 backdrop-blur-lg rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[3rem] flex items-center justify-center">
                {stats.totalReports}
              </div>
              <div className="text-xs sm:text-sm text-white/80">
                รายงานในระบบ
              </div>
            </div>
            <div className="w-full max-w-xs sm:max-w-none bg-white/15 backdrop-blur-lg rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[3rem] flex items-center justify-center">
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
            className="flex flex-col gap-3 md:gap-4 justify-center items-center max-w-2xl mx-auto w-full"
          >
            {/* Primary CTA - ช่วยใส่ข้อมูล */}
            <div className="w-full px-4">
              <Button
                size="lg"
                className="w-full text-sm sm:text-base md:text-lg h-auto min-h-[3rem] sm:min-h-[3.5rem] md:min-h-[4rem] py-3 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl shadow-orange-500/50 font-bold rounded-lg md:rounded-xl border-2 border-white/30 transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/extraction')}
              >
                <MessageSquarePlus className="mr-2 h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6 flex-shrink-0" />
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm sm:text-base md:text-lg leading-tight">ช่วยใส่ข้อมูลจาก Social</span>
                  <span className="text-xs font-normal opacity-90 hidden sm:block leading-tight">คุณสามารถช่วยชีวิตได้ด้วยการใส่ข้อมูล</span>
                </div>
              </Button>
            </div>

            {/* Secondary CTA - ค้นหา */}
            <div className="w-full px-4">
              <Button
                size="lg"
                className="w-full text-xs sm:text-sm md:text-base h-10 sm:h-12 md:h-14 px-3 sm:px-4 md:px-6 bg-white text-blue-600 hover:bg-white/90 shadow-xl font-semibold rounded-lg transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/dashboard')}
              >
                <Search className="mr-2 h-4 w-4 sm:h-5 md:h-6 flex-shrink-0" />
                <span className="truncate">ค้นหาผู้ต้องการความช่วยเหลือ</span>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
