"use client"

import {
  useRef,
  type ComponentPropsWithoutRef,
  type FC,
  type ReactNode,
} from "react"
import { motion, MotionValue, useScroll, useTransform } from "motion/react"

import { cn } from "@/lib/utils"

export interface TextRevealProps extends ComponentPropsWithoutRef<"div"> {
  children: string
  textClassName?: string
}

export const TextReveal: FC<TextRevealProps> = ({
  children,
  className,
  textClassName,
  ...props
}) => {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "start 20%"],
  })

  if (typeof children !== "string") {
    throw new Error("TextReveal: children must be a string")
  }

  const words = children.split(" ")

  return (
    <div ref={sectionRef} className={cn("relative z-0", className)} {...props}>
      <span
        className={cn(
          "flex flex-wrap text-2xl font-bold text-black/20 md:text-3xl lg:text-5xl xl:text-[48px] dark:text-white/20",
          textClassName
        )}
      >
        {words.map((word, i) => {
          const start = i / words.length
          const end = start + 1 / words.length
          return (
            <Word key={i} progress={scrollYProgress} range={[start, end]}>
              {word}
            </Word>
          )
        })}
      </span>
    </div>
  )
}

interface WordProps {
  children: ReactNode
  progress: MotionValue<number>
  range: [number, number]
}

const Word: FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1])
  return (
    <span className="xl:lg-3 relative mx-1 lg:mx-1.5">
      <span aria-hidden="true" className="absolute opacity-15">
        {children}
      </span>
      <motion.span
        style={{ opacity: opacity }}
        className="text-current"
      >
        {children}
      </motion.span>
    </span>
  )
}
