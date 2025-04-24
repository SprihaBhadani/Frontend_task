import { motion } from "framer-motion";
import Link from "next/link";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={styles.content}
      >
        <motion.h1 
          className={styles.title}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
        >
          Student Course Tracker
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className={styles.description}
        >
          Welcome! Register or login to get started.
        </motion.p>
        
        <motion.div 
          className={styles.buttonContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <Link href="/login">
            <motion.button 
              className={styles.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
          </Link>
          <Link href="/register">
            <motion.button 
              className={styles.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Register
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}