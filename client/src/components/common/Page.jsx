import { motion } from 'framer-motion'
import { pageVariants } from '../../utils/motion'

export default function Page({ children, className }) {
  const MotionDiv = motion.div
  return (
    <MotionDiv variants={pageVariants} initial="initial" animate="animate" exit="exit" className={className}>
      {children}
    </MotionDiv>
  )
}

