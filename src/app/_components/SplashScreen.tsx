"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only used to control animation timing
    setMounted(true);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            key="splash"
            initial={mounted ? { x: 0 } : false}
            animate={{ x: 0 }}
            exit={{
              x: "-100vw",
            }}
            transition={{
              duration: 0.4,
              ease: [0.6, 0, 1, 1],
            }}
            className="bg-primary fixed inset-0 z-[9999] flex items-center justify-center"
          >
            <motion.div
              initial={
                mounted
                  ? {
                      opacity: 0,
                      scale: 0,
                    }
                  : {
                      opacity: 1,
                      scale: 1,
                    }
              }
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
              }}
              transition={{
                duration: mounted ? 0.6 : 0,
                type: "spring",
                damping: 15,
                stiffness: 300,
                mass: 0.8,
              }}
              className="shadow-brand flex items-center justify-center rounded-3xl border-2 bg-white px-8 py-2 pt-3"
            >
              <motion.h1
                initial={
                  mounted
                    ? {
                        opacity: 0,
                        y: 10,
                      }
                    : {
                        opacity: 1,
                        y: 0,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                transition={{
                  delay: mounted ? 0.2 : 0,
                  duration: mounted ? 0.4 : 0,
                  ease: "easeOut",
                }}
                className="text-primary text-4xl font-bold tracking-wide"
                style={{
                  fontFamily:
                    "MohrRounded, system-ui, -apple-system, sans-serif",
                }}
              >
                WellNest
              </motion.h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {!loading && children}
    </>
  );
}
