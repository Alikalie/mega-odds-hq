import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Crown } from "lucide-react";

export const VipBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to="/vip"
        className="block w-full bg-gradient-to-r from-vip/90 to-amber-500/90 py-3 px-4 text-center group hover:from-vip hover:to-amber-500 transition-all"
      >
        <div className="flex items-center justify-center gap-2">
          <Crown className="w-5 h-5 text-vip-foreground animate-pulse" />
          <span className="font-display font-bold text-vip-foreground uppercase tracking-wider">
            Buy VIP
          </span>
          <Crown className="w-5 h-5 text-vip-foreground animate-pulse" />
        </div>
      </Link>
    </motion.div>
  );
};
