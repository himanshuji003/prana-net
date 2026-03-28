import { motion } from "framer-motion";

export const GradientMeshBackground = () => {
  return (
    <div className="fixed inset-0 min-h-screen w-full overflow-hidden bg-forest-primary -z-50 pointer-events-none">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-health-green/10 blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-accent-teal/10 blur-[100px]"
      />
    </div>
  );
};
