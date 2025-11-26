import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  MessageSquarePlus, 
  Droplets, 
  Users, 
  MapPin, 
  Sparkles,
  Copy,
  Database,
  CheckCircle2,
  Filter,
  Baby,
  User,
  Stethoscope,
  Github,
  Code,
  TrendingUp,
  HeartHandshake,
  Shield
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
      // Get total reports
      const { count: totalCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true });

      // Get helped count (completed status)
      const { count: helpedCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Get urgent count (level 4-5)
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
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        {/* Animated water ripple effect */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700" />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
        </div>

        <motion.div
          className="max-w-6xl mx-auto text-center relative z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-8">
            <Droplets className="h-20 w-20 text-blue-500 mx-auto mb-4" />
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6"
          >
            ทุกวินาที <span className="text-blue-500">มีคนรอ</span>
            <br />
            <span className="text-orange-500">ความช่วยเหลือ</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Thai Flood Help - รวมข้อมูลที่กระจัดกระจายใน Social Media และช่องทางต่างๆ
            <br />
            สกัดข้อมูลสำคัญด้วย AI เพื่อการช่วยเหลือที่รวดเร็วขึ้น
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-3 mb-12 text-sm md:text-base"
          >
            <div className="px-4 py-2 bg-blue-100 dark:bg-blue-950 rounded-full text-blue-700 dark:text-blue-300 font-medium">
              🎧 Social Listening
            </div>
            <div className="text-2xl text-gray-400">+</div>
            <div className="px-4 py-2 bg-orange-100 dark:bg-orange-950 rounded-full text-orange-700 dark:text-orange-300 font-medium">
              👥 Crowd Sourcing
            </div>
            <div className="text-2xl text-gray-400">+</div>
            <div className="px-4 py-2 bg-purple-100 dark:bg-purple-950 rounded-full text-purple-700 dark:text-purple-300 font-medium">
              🤖 AI Technology
            </div>
          </motion.div>

          {/* Real-time Stats */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12"
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {stats.totalReports}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  รายงานในระบบ
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">
                  {stats.helpedCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ช่วยเหลือสำเร็จ
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-red-200 dark:border-red-800">
              <CardContent className="p-6">
                <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">
                  {stats.urgentCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  เคสเร่งด่วน
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              size="lg"
              className="text-lg h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
              onClick={() => navigate('/dashboard')}
            >
              <Search className="mr-2 h-5 w-5" />
              ค้นหาผู้ต้องการความช่วยเหลือ
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg h-14 px-8 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950 shadow-lg"
              onClick={() => navigate('/extraction')}
            >
              <MessageSquarePlus className="mr-2 h-5 w-5" />
              แจ้งข้อมูลผู้ต้องการความช่วยเหลือ
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Why Thai Flood Help */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              ทำไมต้อง <span className="text-blue-500">Thai Flood Help</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              แก้ปัญหาข้อมูลกระจัดกระจาย ซ้ำซ้อน และหาไม่เจอ
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-red-600 mb-6">😰 ก่อนมี Thai Flood Help</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <span className="text-red-500 text-xl">✗</span>
                      <span>ข้อมูลกระจัดกระจายในหลายแพลตฟอร์ม</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <span className="text-red-500 text-xl">✗</span>
                      <span>ข้อมูลซ้ำซ้อน สับสน</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <span className="text-red-500 text-xl">✗</span>
                      <span>หาข้อมูลไม่เจอ เสียเวลา</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <span className="text-red-500 text-xl">✗</span>
                      <span>ไม่รู้ใครต้องการความช่วยเหลือด่วนที่สุด</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-green-600 mb-6">✨ หลังมี Thai Flood Help</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="text-green-500 h-6 w-6 shrink-0" />
                      <span>รวมข้อมูลจากทุกแหล่งในที่เดียว</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="text-green-500 h-6 w-6 shrink-0" />
                      <span>AI ตัดข้อมูลซ้ำอัตโนมัติ</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="text-green-500 h-6 w-6 shrink-0" />
                      <span>ค้นหาข้อมูลได้ง่ายและรวดเร็ว</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="text-green-500 h-6 w-6 shrink-0" />
                      <span>เรียงลำดับความเร่งด่วนอัตโนมัติ</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              ใช้งานง่าย <span className="text-blue-500">3 ขั้นตอน</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: Copy,
                title: "Copy โพสต์จากโซเชียล",
                description: "คัดลอกข้อความจาก Facebook, Twitter, Line หรือที่ไหนก็ได้",
                color: "blue"
              },
              {
                step: "2",
                icon: Database,
                title: "วางในระบบ",
                description: "AI จะดึงข้อมูลสำคัญออกมาอัตโนมัติ - ชื่อ, เบอร์โทร, ที่อยู่, ความเร่งด่วน",
                color: "orange"
              },
              {
                step: "3",
                icon: CheckCircle2,
                title: "พร้อมช่วยเหลือทันที",
                description: "ข้อมูลพร้อมค้นหา กรอง และช่วยเหลือได้ทันที",
                color: "green"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 rounded-full bg-${item.color}-100 dark:bg-${item.color}-950 flex items-center justify-center mx-auto mb-6`}>
                      <item.icon className={`h-8 w-8 text-${item.color}-600`} />
                    </div>
                    <div className={`text-5xl font-bold text-${item.color}-500 mb-4`}>
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              พลังของ <span className="text-blue-500">AI</span> + <span className="text-orange-500">ใจคนไทย</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              เทคโนโลジีที่ช่วยให้การช่วยเหลือเร็วขึ้น แม่นยำขึ้น
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: "แยกข้อมูลอัตโนมัติ",
                description: "AI ดึงชื่อ, ที่อยู่, เบอร์โทร, พิกัด, ความเร่งด่วน ออกมาเอง",
                color: "blue"
              },
              {
                icon: Shield,
                title: "ตัดข้อมูลซ้ำ",
                description: "ตรวจจับข้อมูลซ้ำซ้อนอัตโนมัติ ไม่ให้เสียเวลา",
                color: "green"
              },
              {
                icon: Search,
                title: "ค้นหาอัจฉริยะ",
                description: "ค้นหาด้วยภาษาธรรมดา 'หาคนที่เชียงใหม่ระดับ 5' ก็ได้",
                color: "purple"
              },
              {
                icon: Users,
                title: "ระบุกลุ่มเปราะบาง",
                description: "ระบุเด็ก ผู้สูงอายุ ผู้ป่วย ที่ต้องการความช่วยเหลือพิเศษ",
                color: "orange"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <feature.icon className={`h-10 w-10 text-${feature.color}-500 mb-4`} />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Dashboard <span className="text-orange-500">Real-time</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              เห็นภาพรวมและรายละเอียดในที่เดียว
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                title: "แผนที่ความช่วยเหลือ",
                description: "ดูตำแหน่งผู้ต้องการความช่วยเหลือบนแผนที่"
              },
              {
                icon: TrendingUp,
                title: "Live Feed ข้อมูลล่าสุด",
                description: "อัพเดทข้อมูลใหม่แบบ real-time"
              },
              {
                icon: Filter,
                title: "Filter ตามต้องการ",
                description: "กรองตามพื้นที่, ความเร่งด่วน, ประเภทความช่วยเหลือ"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Button 
              size="lg"
              className="text-lg h-14 px-8 bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
              onClick={() => navigate('/dashboard')}
            >
              <MapPin className="mr-2 h-5 w-5" />
              เข้าสู่ Dashboard
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Call to Action - Join Us */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-orange-500">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              ร่วมเป็นส่วนหนึ่ง
            </h2>
            <p className="text-xl md:text-2xl mb-12 opacity-90">
              ไม่ทิ้งกัน • ผ่านไปด้วยกัน • ทุกชีวิตมีค่า
            </p>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors duration-300">
                <CardContent className="p-8 text-center">
                  <HeartHandshake className="h-12 w-12 text-white mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">
                    สำหรับอาสาสมัคร
                  </h3>
                  <Button 
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/extraction')}
                  >
                    เริ่มช่วยเหลือ
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors duration-300">
                <CardContent className="p-8 text-center">
                  <Github className="h-12 w-12 text-white mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">
                    สำหรับ Developer
                  </h3>
                  <Button 
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    onClick={() => window.open('https://github.com', '_blank')}
                  >
                    GitHub - Open Source
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors duration-300">
                <CardContent className="p-8 text-center">
                  <Code className="h-12 w-12 text-white mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">
                    สำหรับองค์กร
                  </h3>
                  <Button 
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/api')}
                  >
                    ใช้ API ของเรา
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Emergency Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white py-3 px-4 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm md:text-base">
            <Baby className="h-5 w-5" />
            <User className="h-5 w-5" />
            <Stethoscope className="h-5 w-5" />
            <span className="font-medium">
              มีเคสเร่งด่วน {stats.urgentCount} เคส รอความช่วยเหลือ
            </span>
          </div>
          <Button 
            size="sm"
            className="bg-white text-red-600 hover:bg-gray-100 font-bold"
            onClick={() => navigate('/dashboard')}
          >
            ช่วยเหลือเดี๋ยวนี้
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
