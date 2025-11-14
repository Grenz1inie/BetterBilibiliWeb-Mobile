import * as React from "react";
import { motion } from "framer-motion";
import { IoReload } from "react-icons/io5";
import * as clsx from "clsx";

import style from "./pull-to-refresh.styl?css-modules";

interface PullToRefreshProps {
  onRefresh: () => Promise<any>;
  children: React.ReactNode;
  disabled?: boolean;
}

interface PullToRefreshState {
  status: "idle" | "pulling" | "refreshing" | "success";
  pullDistance: number;
}

class PullToRefresh extends React.Component<PullToRefreshProps, PullToRefreshState> {
  private containerRef: React.RefObject<HTMLDivElement>;
  private startY: number = 0;
  private isPulling: boolean = false;
  private readonly threshold: number = 80; // 触发刷新的阈值
  private readonly maxPullDistance: number = 120; // 最大下拉距离
  private _isMounted: boolean = false;

  constructor(props: PullToRefreshProps) {
    super(props);
    this.containerRef = React.createRef();
    this.state = {
      status: "idle",
      pullDistance: 0
    };
  }

  componentDidMount() {
    this._isMounted = true;
    // 完全禁用下拉刷新功能
    // 不添加任何触摸事件监听
  }

  componentWillUnmount() {
    this._isMounted = false;
    // 无需移除事件监听
  }

  private handleTouchStart = (e: TouchEvent) => {
    // 功能已禁用
  };

  private handleTouchMove = (e: TouchEvent) => {
    // 功能已禁用
  };

  private handleTouchEnd = () => {
    // 功能已禁用
  };

  private triggerRefresh = async () => {
    if (this._isMounted) {
      this.setState({ status: "refreshing", pullDistance: this.threshold });
    }

    try {
      await this.props.onRefresh();
      if (this._isMounted) {
        this.setState({ status: "success" });
      }
      
      // 显示成功状态 500ms 后回弹
      setTimeout(() => {
        if (this._isMounted) {
          this.setState({
            status: "idle",
            pullDistance: 0
          });
        }
      }, 500);
    } catch (error) {
      // 出错也回弹
      if (this._isMounted) {
        this.setState({
          status: "idle",
          pullDistance: 0
        });
      }
    }
  };

  private getStatusText = () => {
    switch (this.state.status) {
      case "pulling":
        return "松开刷新";
      case "refreshing":
        return "刷新中...";
      case "success":
        return "刷新成功";
      default:
        return "下拉刷新";
    }
  };

  public render() {
    const { children } = this.props;

    // 安全检查：确保 children 存在
    if (!children) {
      console.error("PullToRefresh: children is undefined");
      return null;
    }

    // 直接渲染内容，不添加任何下拉刷新效果
    return (
      <div className={style.pullToRefresh} ref={this.containerRef}>
        <div className={style.contentWrapper}>
          {children}
        </div>
      </div>
    );
  }
}

export default PullToRefresh;
