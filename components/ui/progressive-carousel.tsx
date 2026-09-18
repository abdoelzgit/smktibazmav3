"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, FC, ReactElement } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface ProgressSliderContextType {
  active: string;
  progress: number;
  handleButtonClick: (value: string) => void;
  vertical: boolean;
}

interface ProgressSliderProps {
  children: ReactNode;
  duration?: number;
  fastDuration?: number;
  vertical?: boolean;
  activeSlider: string;
  className?: string;
}

interface SliderContentProps {
  children: ReactNode;
  className?: string;
}

interface SliderWrapperProps {
  children: ReactNode;
  value: string;
  className?: string;
}

interface ProgressBarProps {
  children: ReactNode;
  className?: string;
}

interface SliderBtnProps {
  children: ReactNode;
  value: string;
  className?: string;
  progressBarClass?: string;
}

// Type guard untuk memeriksa apakah element adalah ReactElement dengan value prop
function isSliderWrapperElement(child: ReactNode): child is ReactElement<SliderWrapperProps> {
  if (!React.isValidElement(child)) return false;
  const element = child as ReactElement<SliderWrapperProps>;
  return typeof element.props.value === 'string';
}

// Type guard untuk memeriksa apakah element adalah SliderContent
function isSliderContentElement(child: ReactNode): child is ReactElement<SliderContentProps> {
  return React.isValidElement(child) && child.type === SliderContent;
}

const ProgressSliderContext = createContext<ProgressSliderContextType | undefined>(undefined);

export const useProgressSliderContext = (): ProgressSliderContextType => {
  const context = useContext(ProgressSliderContext);
  if (!context) {
    throw new Error('useProgressSliderContext must be used within a ProgressSlider');
  }
  return context;
};

export const ProgressSlider: FC<ProgressSliderProps> = ({
  children,
  duration = 5000,
  fastDuration = 400,
  vertical = false,
  activeSlider,
  className,
}) => {
  const [active, setActive] = useState<string>(activeSlider);
  const [progress, setProgress] = useState<number>(0);
  const [isFastForward, setIsFastForward] = useState<boolean>(false);
  const frame = useRef<number>(0);
  const firstFrameTime = useRef<number>(performance.now());
  const targetValue = useRef<string | null>(null);
  const [sliderValues, setSliderValues] = useState<string[]>([]);

  useEffect(() => {
    const childrenArray = React.Children.toArray(children);
    const sliderContentChild = childrenArray.find(isSliderContentElement);

    if (sliderContentChild) {
      const sliderChildren = React.Children.toArray(sliderContentChild.props.children);
      const values = sliderChildren
        .filter(isSliderWrapperElement)
        .map((child) => child.props.value);
      setSliderValues(values);
    }
  }, [children]);

  useEffect(() => {
    if (sliderValues.length > 0) {
      firstFrameTime.current = performance.now();
      frame.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(frame.current);
  }, [sliderValues, active, isFastForward]);

  const animate = (now: number) => {
    const currentDuration = isFastForward ? fastDuration : duration;
    const elapsedTime = now - firstFrameTime.current;
    const timeFraction = elapsedTime / currentDuration;

    if (timeFraction <= 1) {
      setProgress(isFastForward ? progress + (100 - progress) * timeFraction : timeFraction * 100);
      frame.current = requestAnimationFrame(animate);
    } else {
      if (isFastForward) {
        setIsFastForward(false);
        if (targetValue.current !== null) {
          setActive(targetValue.current);
          targetValue.current = null;
        }
      } else {
        const currentIndex = sliderValues.indexOf(active);
        const nextIndex = (currentIndex + 1) % sliderValues.length;
        setActive(sliderValues[nextIndex]);
      }
      setProgress(0);
      firstFrameTime.current = performance.now();
    }
  };

  const handleButtonClick = (value: string) => {
    if (value !== active) {
      const elapsedTime = performance.now() - firstFrameTime.current;
      const currentProgress = (elapsedTime / duration) * 100;
      setProgress(currentProgress);
      targetValue.current = value;
      setIsFastForward(true);
      firstFrameTime.current = performance.now();
    }
  };

  return (
    <ProgressSliderContext.Provider value={{ active, progress, handleButtonClick, vertical }}>
      <div className={cn('relative', className)}>{children}</div>
    </ProgressSliderContext.Provider>
  );
};

export const SliderContent: FC<SliderContentProps> = ({ children, className }) => {
  return <div className={cn('relative', className)}>{children}</div>;
};

export const SliderWrapper: FC<SliderWrapperProps> = ({ children, value, className }) => {
  const { active } = useProgressSliderContext();

  return (
    <AnimatePresence mode="popLayout">
      {active === value && (
        <motion.div
          key={value}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={cn('absolute inset-0', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const SliderBtnGroup: FC<ProgressBarProps> = ({ children, className }) => {
  return <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>{children}</div>;
};

export const SliderBtn: FC<SliderBtnProps> = ({ children, value, className, progressBarClass }) => {
  const { active, progress, handleButtonClick, vertical } = useProgressSliderContext();

  return (
    <button
      className={cn(
        "relative flex flex-col items-start text-left p-4 rounded-xl border transition-all duration-300 overflow-hidden",
        active === value 
          ? "border-blue-900/30 bg-blue-50/50 shadow-md" 
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
        className
      )}
      onClick={() => handleButtonClick(value)}
    >
      {/* Progress Bar Background */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden"
        role="progressbar"
        aria-valuenow={active === value ? progress : 0}
      >
        <span
          className={cn("absolute left-0 top-0 bg-blue-900/10 transition-all duration-100 ease-linear", progressBarClass)}
          style={{
            [vertical ? 'height' : 'width']: active === value ? `${progress}%` : '0%',
          }}
        />
      </div>
      
      {/* Button Content */}
      <div className="relative z-10 w-full">{children}</div>
    </button>
  );
};