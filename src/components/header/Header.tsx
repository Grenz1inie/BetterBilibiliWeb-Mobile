import * as React from "react";
import { motion } from "framer-motion";
import { IoSearch } from "react-icons/io5";
import Logo from "../../components/Logo";
import Avatar from "../../components/Avatar";

import style from "./header.styl?css-modules";

interface HeaderProps {
  hideLogo?: boolean;
}

const Header = ({ hideLogo = false }: HeaderProps) => {
  return (
    <motion.div 
      className={style.header}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {!hideLogo ? (
        <a className={style.logo} href="/index">
          <Logo />
        </a>
      ) : (
        <div className={style.logo} />
      )}
      <div className={style.actions}>
        <motion.a 
          className={style.searchIcon} 
          href="/search"
          whileTap={{ scale: 0.9 }}
        >
          <IoSearch size={22} />
        </motion.a>
        <motion.a 
          className={style.avatar} 
          href="/space"
          whileTap={{ scale: 0.95 }}
        >
          <Avatar />
        </motion.a>
      </div>
    </motion.div>
  );
}

export default Header;
