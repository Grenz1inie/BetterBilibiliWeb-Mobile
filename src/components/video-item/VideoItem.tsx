import * as React from "react";
import LazyLoad from "react-lazyload";
import { motion } from "framer-motion";
import { IoPlay, IoChatbubbleEllipses } from "react-icons/io5";
import { Video } from "../../models";
import { formatTenThousand } from "../../util/string";

import tv from "../../assets/images/tv.png";
import style from "./video-item.styl?css-modules";

interface VideoItemProps {
  video: Video;
  showStatistics: boolean;
}

const VideoItem = (props: VideoItemProps) => {
  const { video, showStatistics } =  props;
  return (
    <motion.div 
      className={style.video}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <a className={style.videoLink} href={"/video/av" + video.aId}>
        <div className={style.imageContainer}>
          <div className={style.imageWrapper}>
            <img className={style.tv} src={tv} alt="placeholder" />
            {
              video.pic ? (
                <LazyLoad height={"100%"} offset={100}>
                  <img src={video.pic} className={style.pic} alt={video.title} 
                    onLoad={(e) => {(e.currentTarget as HTMLImageElement).style.opacity = "1"}} />
                </LazyLoad>
              ) : null
            }
            <div className={style.cover} />
            {
              showStatistics === true ? (
                <div className={style.info}>
                  <span className={style.statItem}>
                    <IoPlay className={style.icon} />
                    <span className={style.count}>
                      {video.playCount ? formatTenThousand(video.playCount) : "0"}
                    </span>
                  </span>
                  <span className={style.statItem}>
                    <IoChatbubbleEllipses className={style.icon} />
                    <span className={style.count}>
                      {video.barrageCount ? formatTenThousand(video.barrageCount) : "0"}
                    </span>
                  </span>
                </div>
              ) : null
            }
          </div>
        </div>
        <div className={style.title}>
          {video.title}
        </div>
      </a>
    </motion.div>
  );
}

export default VideoItem;
