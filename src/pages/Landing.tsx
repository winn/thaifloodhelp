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
      const { count: totalCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true });

      const { count: helpedCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const { count: urgentCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .gte('urgency_level', 4);

      setStats({
        totalReports: totalCount || 0,
        helpedCount: helpedCount || 0,
        urgentCount: urgentCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
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
      {/* Hero Section with Gradient */}
      <section className="relative overflow-hidden py-24 md:py-32 px-4 bg-gradient-to-br from-blue-600 via-purple-500 to-orange-500">
        {/* Subtle overlay pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent_50%)]" />
        
        <motion.div
          className="max-w-6xl mx-auto text-center relative z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-8">
            <Droplets className="h-16 w-16 md:h-20 md:w-20 text-white mx-auto mb-6 opacity-90" />
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 md:mb-8 leading-tight px-4"
          >
            Thai Flood Help
            <br />
            <span className="text-white/90 text-2xl sm:text-3xl md:text-4xl lg:text-6xl block mt-2">รวมข้อมูลที่กระจัดกระจาย</span>
            <br className="hidden sm:block" />
            <span className="text-xl sm:text-2xl md:text-4xl lg:text-5xl block mt-2">ใน Social Media และช่องทางต่างๆ</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 mb-4 md:mb-6 font-medium px-4"
          >
            สกัดข้อมูลสำคัญด้วย AI เพื่อการช่วยเหลือที่รวดเร็วขึ้น
          </motion.p>

          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-3 md:mb-4 font-semibold px-4"
          >
            เมื่อ AI กับมนุษย์ ทำงานร่วมกัน เพื่อช่วยผู้ประสบภัย
          </motion.p>

          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-white/80 mb-8 md:mb-12 px-4"
          >
            ทุกวินาที • มีคนรอความช่วยเหลือ
          </motion.p>

          {/* Technology Badges */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-12 md:mb-16 text-xs sm:text-sm md:text-base px-4"
          >
            <div className="px-4 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-md rounded-full text-white font-medium border border-white/30 whitespace-nowrap">
              🎧 Social Listening
            </div>
            <div className="text-xl sm:text-2xl text-white/50">+</div>
            <div className="px-4 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-md rounded-full text-white font-medium border border-white/30 whitespace-nowrap">
              👥 Crowd Sourcing
            </div>
            <div className="text-xl sm:text-2xl text-white/50">+</div>
            <div className="px-4 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-md rounded-full text-white font-medium border border-white/30 whitespace-nowrap">
              🤖 AI Technology
            </div>
          </motion.div>

          {/* Real-time Stats with Glassmorphism */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto mb-8 md:mb-12 px-4"
          >
            <div className="bg-white/15 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1 md:mb-2">
                {stats.totalReports}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-white/80">
                รายงานในระบบ
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1 md:mb-2">
                {stats.helpedCount}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-white/80">
                ช่วยเหลือสำเร็จ
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1 md:mb-2">
                {stats.urgentCount}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-white/80">
                เคสเร่งด่วน
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col gap-6 justify-center items-center max-w-2xl mx-auto"
          >
            {/* Primary CTA - ช่วยใส่ข้อมูล */}
            <div className="w-full px-4">
              <Button 
                size="lg"
                className="w-full text-base sm:text-lg md:text-xl h-16 sm:h-18 md:h-20 px-6 sm:px-8 md:px-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl shadow-orange-500/50 font-bold rounded-xl md:rounded-2xl border-2 md:border-4 border-white/30 transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/extraction')}
              >
                <MessageSquarePlus className="mr-2 sm:mr-3 h-5 sm:h-6 md:h-7 w-5 sm:w-6 md:w-7 flex-shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="text-base sm:text-lg md:text-xl lg:text-2xl">ช่วยใส่ข้อมูลจาก Social</span>
                  <span className="text-xs sm:text-sm font-normal opacity-90 hidden sm:block">คุณสามารถช่วยชีวิตได้ด้วยการใส่ข้อมูล</span>
                </div>
              </Button>
            </div>

            {/* Secondary CTA - ค้นหา */}
            <div className="w-full flex gap-4 px-4">
              <Button 
                size="lg"
                className="flex-1 text-sm sm:text-base md:text-lg h-12 sm:h-14 px-4 sm:px-6 md:px-8 bg-white text-blue-600 hover:bg-white/90 shadow-xl font-semibold rounded-lg md:rounded-xl"
                onClick={() => navigate('/dashboard')}
              >
                <Search className="mr-2 h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0" />
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

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-stretch max-w-5xl mx-auto px-4">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 rounded-3xl p-8 md:p-10 border border-red-200 dark:border-red-800 flex flex-col min-h-[420px]"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-red-600 mb-6 md:mb-8">😰 ก่อนมีระบบ</h3>
              <ul className="space-y-4 md:space-y-5 flex-grow">
                <li className="flex items-start gap-3 md:gap-4 text-base md:text-lg text-gray-700 dark:text-gray-300">
                  <span className="text-red-500 text-xl md:text-2xl shrink-0">✗</span>
                  <span>ข้อมูลกระจัดกระจายในหลายแพลตฟอร์ม</span>
                </li>
                <li className="flex items-start gap-3 md:gap-4 text-base md:text-lg text-gray-700 dark:text-gray-300">
                  <span className="text-red-500 text-xl md:text-2xl shrink-0">✗</span>
                  <span>ข้อมูลซ้ำซ้อน สับสน</span>
                </li>
                <li className="flex items-start gap-3 md:gap-4 text-base md:text-lg text-gray-700 dark:text-gray-300">
                  <span className="text-red-500 text-xl md:text-2xl shrink-0">✗</span>
                  <span>หาข้อมูลไม่เจอ เสียเวลา</span>
                </li>
                <li className="flex items-start gap-3 md:gap-4 text-base md:text-lg text-gray-700 dark:text-gray-300">
                  <span className="text-red-500 text-xl md:text-2xl shrink-0">✗</span>
                  <span>ไม่รู้ใครต้องการความช่วยเหลือด่วนที่สุด</span>
                </li>
              </ul>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-3xl p-8 md:p-10 border border-green-200 dark:border-green-800 flex flex-col min-h-[420px]"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-green-600 mb-6 md:mb-8">✨ หลังมีระบบ</h3>
              <ul className="space-y-4 md:space-y-5 flex-grow">
                <li className="flex items-start gap-3 md:gap-4 text-base md:text-lg text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="text-green-500 h-6 w-6 md:h-7 md:w-7 shrink-0" />
                  <span>รวมข้อมูลจากทุกแหล่งในที่เดียว</span>
                </li>
                <li className="flex items-start gap-3 md:gap-4 text-base md:text-lg text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="text-green-500 h-6 w-6 md:h-7 md:w-7 shrink-0" />
                  <span>AI ตัดข้อมูลซ้ำอัตโนมัติ</span>
                </li>
                <li className="flex items-start gap-3 md:gap-4 text-base md:text-lg text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="text-green-500 h-6 w-6 md:h-7 md:w-7 shrink-0" />
                  <span>ค้นหาข้อมูลได้ง่ายและรวดเร็ว</span>
                </li>
                <li className="flex items-start gap-3 md:gap-4 text-base md:text-lg text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="text-green-500 h-6 w-6 md:h-7 md:w-7 shrink-0" />
                  <span>เรียงลำดับความเร่งด่วนอัตโนมัติ</span>
                </li>
              </ul>
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
