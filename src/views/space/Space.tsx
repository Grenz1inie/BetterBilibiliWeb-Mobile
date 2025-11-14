import * as React from "react";
import { motion } from "framer-motion";
import Header from "../../components/header/Header";
import { NestedRoute } from "../../router";
import { History } from "history";

import banner from "../../assets/images/banner-top.png";
import style from "./space.styl?css-modules";

const Space = (props) => (
  <div className="space">
    <motion.button 
      className={style.backBtn}
      onClick={() => props.history.goBack()}
      whileTap={{ scale: 0.9 }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </motion.button>
    <div className={style.topWrapper}>
      <Header hideLogo={true} />
    </div>
    <div className={style.banner}>
      <img src={banner} />
    </div>
    {
      props.router.map((route, i) =>
        <NestedRoute {...route} key={i} />
      )
    }
  </div>
);

export default Space;
