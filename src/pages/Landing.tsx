import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  MessageSquarePlus, 
  Droplets, 
  MapPin, 
  Sparkles,
  Copy,
  Database,
  CheckCircle2,
  Shield,
  Github,
  Code,
  HeartHandshake
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroFlood from "@/assets/hero-flood.jpg";
import socialIconsCluster from "@/assets/social-icons-cluster.svg";

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
      <section className="relative overflow-hidden py-12 md:py-16 px-4 min-h-screen flex items-center" style={{ backgroundImage: `url(${heroFlood})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* Black overlay with 50% opacity */}
        <div className="absolute inset-0 bg-black/50" />
        
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
            <div className="text-lg sm:text-xl text-white/50">+</div>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-medium border border-white/30 whitespace-nowrap">
              👥 Crowd Sourcing
            </div>
            <div className="text-lg sm:text-xl text-white/50">+</div>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-medium border border-white/30 whitespace-nowrap">
              🤖 AI Technology
            </div>
          </motion.div>

          {/* Real-time Stats with Glassmorphism */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 max-w-3xl mx-auto mb-6 md:mb-8 px-4"
          >
            <div className="bg-white/15 backdrop-blur-lg rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1">
                {stats.totalReports}
              </div>
              <div className="text-xs sm:text-sm text-white/80">
                รายงานในระบบ
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-lg rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1">
                {stats.helpedCount}
              </div>
              <div className="text-xs sm:text-sm text-white/80">
                ช่วยเหลือสำเร็จ
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-lg rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
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
            className="flex flex-col gap-3 md:gap-4 justify-center items-center max-w-2xl mx-auto"
          >
            {/* Primary CTA - ช่วยใส่ข้อมูล */}
            <div className="w-full px-4">
              <Button 
                size="lg"
                className="w-full text-sm sm:text-base md:text-lg h-12 sm:h-14 md:h-16 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl shadow-orange-500/50 font-bold rounded-lg md:rounded-xl border-2 border-white/30 transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/extraction')}
              >
                <MessageSquarePlus className="mr-2 h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6 flex-shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="text-sm sm:text-base md:text-lg">ช่วยใส่ข้อมูลจาก Social</span>
                  <span className="text-xs font-normal opacity-90 hidden sm:block">คุณสามารถช่วยชีวิตได้ด้วยการใส่ข้อมูล</span>
                </div>
              </Button>
            </div>

            {/* Secondary CTA - ค้นหา */}
            <div className="w-full flex gap-3 px-4">
              <Button 
                size="lg"
                className="flex-1 text-xs sm:text-sm md:text-base h-10 sm:h-12 px-3 sm:px-4 md:px-6 bg-white text-blue-600 hover:bg-white/90 shadow-xl font-semibold rounded-lg"
                onClick={() => navigate('/dashboard')}
              >
                <Search className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">ค้นหาผู้ต้องการความช่วยเหลือ</span>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Why Thai Flood Help - Clean White Section */}
      <section className="py-24 md:py-32 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              ทำไมต้อง Thai Flood Help
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400">
              แก้ปัญหาข้อมูลกระจัดกระจาย ซ้ำซ้อน และหาไม่เจอ
            </p>
          </motion.div>

          {/* 3-Column Layout */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-center max-w-6xl mx-auto px-4">
            
            {/* Left - Problem (ปัญหาด้านข้อมูล) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center md:text-right space-y-4"
            >
              <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">ปัญหาด้านข้อมูล</p>
              <h3 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200">รวบรวม</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base md:text-lg">
                เมื่อข้อมูลกระจัดกระจายอยู่หลายแพลตฟอร์ม ซ้ำซ้อนสับสน
                ค้นหาไม่เจอจนเสียเวลาและทำให้เราไม่รู้ด้วยว่าใครคือคนที่ต้องการความช่วยเหลือด่วนที่สุด
              </p>
            </motion.div>

            {/* Center - Social Media Icons Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center"
            >
              <img 
                src={socialIconsCluster} 
                alt="Social platforms cluster" 
                className="w-full max-w-[300px] md:max-w-[400px] h-auto"
              />
            </motion.div>

            {/* Right - Solution (แก้ไขปัญหาข้อมูล) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center md:text-left space-y-4"
            >
              <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">แก้ไขปัญหาข้อมูล</p>
              <h3 className="text-4xl md:text-5xl font-bold text-blue-500">จัดเรียง</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base md:text-lg">
                ระบบรวมข้อมูลจากทุกแหล่งไว้ในที่เดียว ให้ AI ตัดข้อมูลซ้ำอัตโนมัติ
                ค้นหาข้อมูลได้ง่ายและรวดเร็ว พร้อมจัดเรียงลำดับความเร่งด่วนให้อัตโนมัติ
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              ใช้งานง่าย 3 ขั้นตอน
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                icon: Copy,
                title: "Copy โพสต์จากโซเชียล",
                description: "คัดลอกข้อความจาก Facebook, Twitter, Line หรือที่ไหนก็ได้"
              },
              {
                step: "2",
                icon: Database,
                title: "วางในระบบ",
                description: "AI จะดึงข้อมูลสำคัญออกมาอัตโนมัติ"
              },
              {
                step: "3",
                icon: CheckCircle2,
                title: "พร้อมช่วยเหลือทันที",
                description: "ข้อมูลพร้อมค้นหาและช่วยเหลือได้ทันที"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-white dark:bg-gray-900 rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-8">
                  <item.icon className="h-10 w-10 text-white" />
                </div>
                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-purple-600 mb-6 text-center">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                  {item.title}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-24 md:py-32 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              พลังของ AI + ใจคนไทย
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400">
              เทคโนโลยีที่ช่วยให้การช่วยเหลือเร็วขึ้น แม่นยำขึ้น
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: "แยกข้อมูลอัตโนมัติ",
                description: "AI ดึงชื่อ ที่อยู่ เบอร์โทร พิกัด ความเร่งด่วน"
              },
              {
                icon: Shield,
                title: "ตัดข้อมูลซ้ำ",
                description: "ตรวจจับข้อมูลซ้ำซ้อนอัตโนมัติ ไม่เสียเวลา"
              },
              {
                icon: Search,
                title: "ค้นหาอัจฉริยะ",
                description: "ค้นหาด้วยภาษาธรรมดา 'หาคนที่เชียงใหม่ระดับ 5'"
              },
              {
                icon: MapPin,
                title: "ระบุกลุ่มเปราะบาง",
                description: "ระบุเด็ก ผู้สูงอายุ ผู้ป่วย ที่ต้องการช่วยเหลือพิเศษ"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-600"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us - Gradient Section */}
      <section className="py-24 md:py-32 px-4 bg-gradient-to-br from-blue-600 via-purple-500 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent_50%)]" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center text-white mb-20"
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              ร่วมเป็นส่วนหนึ่ง
            </h2>
            <p className="text-2xl md:text-3xl mb-4 opacity-95">
              ไม่ทิ้งกัน • ผ่านไปด้วยกัน • ทุกชีวิตมีค่า
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
            {[
              {
                icon: HeartHandshake,
                title: "สำหรับอาสาสมัคร",
                buttonText: "ช่วยใส่ข้อมูล",
                onClick: () => navigate('/extraction')
              },
              {
                icon: Github,
                title: "สำหรับ Developer",
                buttonText: "GitHub - Open Source",
                onClick: () => window.open('https://github.com', '_blank')
              },
              {
                icon: Code,
                title: "สำหรับองค์กร",
                buttonText: "ใช้ API ของเรา",
                onClick: () => navigate('/api')
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="bg-white/15 backdrop-blur-lg rounded-3xl p-8 md:p-10 border border-white/20 hover:bg-white/25 transition-all duration-300 flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                  <item.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-8 text-center min-h-[64px] flex items-center justify-center">
                  {item.title}
                </h3>
                <div className="mt-auto w-full flex justify-center">
                  <Button 
                    size="lg"
                    className="inline-flex items-center justify-center px-6 md:px-8 py-2 md:py-3 text-sm md:text-base bg-white text-blue-600 hover:bg-white/90 font-semibold rounded-xl shadow-lg whitespace-nowrap"
                    onClick={item.onClick}
                  >
                    {item.buttonText}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
