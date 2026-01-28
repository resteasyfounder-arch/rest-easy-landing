import { motion } from "framer-motion";

export const Atmosphere = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-cream">
            {/* Warm Peach Blob */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [-20, 20, -20],
                    y: [-20, 20, -20],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                }}
                className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-orange-200/40 to-transparent blur-3xl"
            />

            {/* Sage/Mint Blob */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.4, 0.3],
                    x: [30, -30, 30],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-sage-200/40 to-transparent blur-3xl"
            />

            {/* Soft Center Light */}
            <div className="absolute inset-0 bg-white/40" />
        </div>
    );
};
