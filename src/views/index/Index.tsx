import * as React from "react";
import { forceCheck } from "react-lazyload";
import { motion, AnimatePresence } from "framer-motion";
import { connect } from "react-redux";
import Header from "../../components/header/Header";
import TabBar from "../../components/tab-bar/TabBar";
import Drawer from "../../components/drawer/Drawer";
import VideoItem from "../../components/video-item/VideoItem";
import PullToRefresh from "../../components/pull-to-refresh/PullToRefresh";
import { PartitionType, Video } from "../../models";
import Context from "../../context";
import { getPicSuffix } from "../../util/image";
import getIndexContent from "../../redux/async-actions/index";

import "swiper/dist/css/swiper.css";
import style from "./index.styl?css-modules";

interface IndexProps {
  oneLevelPartitions: PartitionType[];
  banners: Array<{ id: number, name: string, pic: string, url: string }>;
  additionalVideos: Video[];
  rankingVideos: Video[];
  staticContext?: { picSuffix: string };
  dispatch?: any;
}

class Index extends React.Component<IndexProps> {
  private drawerRef: React.RefObject<Drawer>;
  constructor(props) {
    super(props);

    this.drawerRef = React.createRef();
  }
  public componentDidMount() {
    // 服务端引入会抛异常
    const Swiper = require("swiper");
    new Swiper(".swiper-container", {
      loop: true,
      autoplay: 3000,
      autoplayDisableOnInteraction: false,
      pagination: ".swiper-pagination"
    });
    setTimeout(() => {
      // 开发环境中，样式在js加载后动态添加会导致图片被检测到未出现在屏幕上
      // 强制检查懒加载组件是否出现在屏幕上
      forceCheck();
    }, 10);
  }
  /**
   * tabBar或drawer组件点击事件处理
   */
  private handleClick = (tab) => {
    // 直播
    if (tab.id === -1) {
      window.location.href = "/live";
      return;
    }
    if (tab.id === 0) {
      window.location.href = "/index";
    } else {
      window.location.href = "/channel/" + tab.id;
    }
  }
  private handleSwitchClick = () => {
    this.drawerRef.current.show();
  }
  /**
   * 下拉刷新处理
   */
  private handleRefresh = async () => {
    // 重新获取首页数据
    if (this.props.dispatch) {
      await this.props.dispatch(getIndexContent());
      // 强制检查懒加载组件
      setTimeout(() => {
        forceCheck();
      }, 100);
    }
  }
  private getPicUrl(url, format) {
    const { picURL } = this.context;
    let suffix = ".webp";
    if (process.env.REACT_ENV === "server") {
      // 服务端获取图片后缀
      suffix = this.props.staticContext.picSuffix;
    } else {
      suffix = getPicSuffix();
    }
    // picURL + "?pic=" + url + "@480w_300h.webp"
    return `${picURL}?pic=${url}${format + suffix}`;
  }
  public render() {
    const { oneLevelPartitions, additionalVideos, rankingVideos } = this.props;

    const tabBarData = [{ id: 0, name: "首页"} as PartitionType]
      .concat(oneLevelPartitions);

    tabBarData.push(new PartitionType(-1, "直播"));

    let videos = rankingVideos;
    if (additionalVideos.length > 0) {
      // 过滤重复的video
      videos = rankingVideos.filter((video) => {
        let filter = false;
        for (const v of additionalVideos) {
          if (v.aId === video.aId) {
            filter = true;
          }
        }
        return !filter;
      });
    }

    // 总视频数量多余100，截取掉
    const totalVideos = additionalVideos.length + videos.length;
    if (totalVideos > 100) {
      videos.splice(videos.length - (totalVideos - 100));
    }

    const bannerElements = this.props.banners.map((banner) => (
      <div className="swiper-slide" key={banner.id}>
        <a href={banner.url}>
          <img src={this.getPicUrl(banner.pic, "@480w_300h")} width="100%" height="100%" alt={banner.name} />
        </a>
      </div>
    ));
    const additionalVideoElements = this.props.additionalVideos.map((video) => {
      if (video.pic.indexOf("@320w_200h") === -1) {
        video.pic = this.getPicUrl(video.pic, "@320w_200h");
      }
      return <VideoItem video={video} key={video.aId} showStatistics={false} />
    });
    const videoElements = videos.map((video) => {
      if (video.pic.indexOf("@320w_200h") === -1) {
        video.pic = this.getPicUrl(video.pic, "@320w_200h");
      }
      return <VideoItem video={video} key={video.aId} showStatistics={true} />
    });
    return (
      <PullToRefresh onRefresh={this.handleRefresh}>
        <div className="index">
          {/* 顶部 */}
          <motion.div 
            className={style.topWrapper}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Header />
            <div className={style.partition}>
              <div className={style.tabBar}>
                <TabBar data={tabBarData} type={"indicate"} onClick={this.handleClick} />
              </div>
              <div className={style.switch} onClick={this.handleSwitchClick}>
                <i className="icon-arrow-down" />
              </div>
            </div>
            <div className={style.drawerPosition}>
              <Drawer data={tabBarData} ref={this.drawerRef} onClick={this.handleClick} />
            </div>
          </motion.div>
          
          {/* 内容 */}
          <motion.div 
            className={style.contentWrapper}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {
              this.props.banners.length > 0 ? (
                <motion.div 
                  className={style.bannerSlider}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="swiper-container">
                    <div className="swiper-wrapper">
                      {bannerElements}
                    </div>
                    <div className="swiper-pagination-wrapper">
                      <div className="swiper-pagination clear" />
                    </div>
                  </div>
                </motion.div>
              ) : null
            }
            <div className={style.videoList + " clear"}>
             {additionalVideoElements}
              {videoElements}
            </div>
          </motion.div>
        </div>
      </PullToRefresh>
    );
  }
}

Index.contextType = Context;

export default Index;
