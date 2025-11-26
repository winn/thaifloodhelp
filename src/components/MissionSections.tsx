import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Copy, Database, CheckCircle2, Sparkles, Shield, Search, MapPin, HeartHandshake, Github, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";
import socialIconsCluster from "@/assets/social-icons-cluster.svg";

const MissionSections = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Why Thai Flood Help - Clean White Section */}
      <section className="py-24 md:py-32 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              ทำไมต้อง Thai Flood Help
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400">
              แก้ปัญหาข้อมูลกระจัดกระจาย ซ้ำซ้อน และหาไม่เจอ
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-center max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "0px 0px -50px 0px" }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-right space-y-4"
            >
              <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">ปัญหาด้านข้อมูล</p>
              <h3 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200">รวบรวม</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base md:text-lg">
                เมื่อข้อมูลกระจัดกระจายอยู่หลายแพลตฟอร์ม ซ้ำซ้อนสับสน
                ค้นหาไม่เจอจนเสียเวลาและทำให้เราไม่รู้ด้วยว่าใครคือคนที่ต้องการความช่วยเหลือด่วนที่สุด
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "0px 0px -50px 0px" }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center"
            >
              <img 
                src={socialIconsCluster} 
                alt="Social platforms cluster" 
                className="w-full max-w-[300px] md:max-w-[400px] h-auto"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "0px 0px -50px 0px" }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-left space-y-4"
            >
              <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">แก้ไขปัญหาข้อมูล</p>
              <h3 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200">จัดเรียง</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base md:text-lg">
                ระบบรวมข้อมูลจากทุกแหล่งไว้ในที่เดียว ให้ AI ตัดข้อมูลซ้ำอัตโนมัติ
                ค้นหาข้อมูลได้ง่ายและรวดเร็ว พร้อมจัดเรียงลำดับความเร่งด่วนให้อัตโนมัติ
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works - Modern Minimal Style */}
      <section className="py-24 md:py-32 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              ใช้งานง่าย 3 ขั้นตอน
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
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
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-10 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
                  <item.icon className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-purple-600 mb-6 text-center">
                  {item.step}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                  {item.title}
                </h3>
                <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 text-center leading-relaxed">
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
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 0.6 }}
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
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
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
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 0.6 }}
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
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
    </>
  );
};

export default MissionSections;
