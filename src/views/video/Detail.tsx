import * as React from "react";
import { Link, match } from "react-router-dom";
import { Helmet } from "react-helmet";
import LazyLoad from "react-lazyload";
import { History } from "history";
import { motion } from "framer-motion";
import Header from "../../components/header/Header";
import ScrollToTop from "../../components/scroll-to-top/ScrollToTop";
import Context from "../../context";
import VideoPlayer from "./VideoPlayer";
import { Video, createVideo, UpUser } from "../../models";
import { formatTenThousand, formatDuration } from "../../util/string";
import { getRecommendVides, getComments } from "../../api/video";
import { getPicSuffix } from "../../util/image";
import { formatDate } from "../../util/datetime";
import storage from "../../util/storage";

import style from "./detail.styl?css-modules";

const getPubdate = (timestamp: number) => {
	const publicDate = new Date(timestamp * 1000); // unix时间转换成本地时间戳
	let publicDateStr = "";
	const date = new Date();
	if (publicDate.getFullYear() === date.getFullYear()) {
		if (publicDate.getMonth() === date.getMonth()) {
			const diffDate = date.getDate() - publicDate.getDate();
			switch (diffDate) {
				case 0:
					if (date.getHours() - publicDate.getHours() === 0) {
						publicDateStr = `${date.getMinutes() - publicDate.getMinutes()}分钟前`;
					} else {
						publicDateStr = `${date.getHours() - publicDate.getHours()}小时前`;
					}
					break;
				case 1:
					publicDateStr = "昨天";
					break;
				case 2:
					publicDateStr = "前天";
					break;
				default:
					publicDateStr = `${publicDate.getMonth() + 1}-${publicDate.getDate()}`;
			}
		} else {
			publicDateStr = `${publicDate.getMonth() + 1}-${publicDate.getDate()}`;
		}
	} else {
		publicDateStr = `${publicDate.getFullYear()}-${publicDate.getMonth() + 1}-${publicDate.getDate()}`;
	}
	return publicDateStr;
};

interface DetailProps {
	video: Video;
	match: match<{ aId: string }>; // aId 是路由参数，类型为 string
	history: History;
	staticContext?: { picSuffix: string };
}

interface DetailState {
	loading: boolean;
	recommendVides: Video[];
	showLoadMore: boolean;
	comments: Array<{
		content: string;
		date: string;
		user: UpUser;
	}>;
}

class Detail extends React.Component<DetailProps, DetailState> {
	private arrowRef: React.RefObject<HTMLDivElement>;
	private infoContainerRef: React.RefObject<HTMLDivElement>;
	private infoRef: React.RefObject<HTMLDivElement>;
	private infoExpand: boolean;
	private commentPage: { pageNumber: number; pageSize: number; count: number };

	constructor(props: DetailProps) {
		super(props);

		this.arrowRef = React.createRef();
		this.infoContainerRef = React.createRef();
		this.infoRef = React.createRef();
		this.infoExpand = false;
		this.commentPage = {
			pageNumber: 1,
			pageSize: 20,
			count: 0,
		};

		this.state = {
			loading: true,
			recommendVides: [],
			showLoadMore: true,
			comments: [],
		};
	}

	public componentDidMount() {
		this.getRecommentVides();
		this.getComments();

		const { video } = this.props;
		storage.setViewHistory({
			aId: video.aId,
			title: video.title,
			pic: video.pic,
			viewAt: new Date().getTime(),
		});
	}

	// 修复：路由参数 aId 是 string，需转为 number 传给接口（接口参数要求 number 类型）
	private getRecommentVides = () => {
		const aId = Number(this.props.match.params.aId); // 关键：string → number 转换
		getRecommendVides(aId).then((result) => {
			if (result.code === "1") {
				const recommendVides = result.data.map((item) => createVideo(item));
				this.setState({
					loading: false,
					recommendVides,
				});
			}
		});
	};

	// 修复：同上，aId 转为 number 类型
	private getComments = () => {
		const aId = Number(this.props.match.params.aId); // 关键：string → number 转换
		getComments(aId, this.commentPage.pageNumber).then((result) => {
			if (result.code === "1") {
				const page = result.data.page;
				const maxPage = Math.ceil(page.count / page.size);
				const showLoadMore = this.commentPage.pageNumber < maxPage;

				this.commentPage = {
					pageNumber: this.commentPage.pageNumber,
					pageSize: page.size,
					count: page.count,
				};

				const comments = result.data.replies
					? result.data.replies.map((item) => {
							const date = new Date(item.ctime * 1000);
							return {
								content: item.content.message,
								date: formatDate(date, "yyyy-MM-dd hh:mm"),
								user: new UpUser(item.member.mid, item.member.uname, item.member.avatar),
							};
					})
					: [];

				this.setState((prevState) => ({
					showLoadMore,
					comments: prevState.comments.concat(comments),
				}));
			}
		});
	};

	private toggle = () => {
		const arrowDOM = this.arrowRef.current;
		const infoContainerDOM = this.infoContainerRef.current;
		const infoDOM = this.infoRef.current;
		if (!arrowDOM || !infoContainerDOM || !infoDOM) return;

		const titleDOM = infoDOM.getElementsByTagName("div")[0];
		if (!this.infoExpand) {
			titleDOM.style.whiteSpace = "normal";
			infoContainerDOM.style.height = `${infoDOM.offsetHeight}px`;
			arrowDOM.classList.add(style.rotate);
			this.infoExpand = true;
		} else {
			titleDOM.style.whiteSpace = "nowrap";
			infoContainerDOM.style.height = "auto";
			arrowDOM.classList.remove(style.rotate);
			this.infoExpand = false;
		}
	};

	private loadMoreComment = () => {
		this.commentPage.pageNumber += 1;
		this.getComments();
	};

	private getPicUrl = (url: string, format: string) => {
		const { picURL } = this.context;
		let suffix = ".webp";

		if (process.env.REACT_ENV === "server") {
			suffix = (this.props.staticContext && this.props.staticContext.picSuffix) || ".webp";
		} else {
			suffix = getPicSuffix();
		}

		if (url.indexOf(".gif") !== -1) {
			return `${picURL}?pic=${url}`;
		}
		return `${picURL}?pic=${url}${format}${suffix}`;
	};

	private toSpace = (mId: string | number) => {
		this.props.history.push(`/space/${mId}`);
	};

	public render() {
		const { video } = this.props;

		const videoPic = video.pic.indexOf("@400w_300h") === -1 ? this.getPicUrl(video.pic, "@400w_300h") : video.pic;

		return (
			<div className="video-detail">
				<Helmet>
					<title>{video.title}</title>
					<meta name="title" content={video.title} />
					<meta name="description" content={video.desc} />
					<meta name="author" content={video.owner.name} />
				</Helmet>
				<motion.button className={style.backBtn} onClick={() => this.props.history.goBack()} whileTap={{ scale: 0.9 }}>
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
				</motion.button>
				<div className={style.topWrapper}>
					<Header hideLogo={true} />
				</div>
				<div className={style.contentWrapper}>
					<div className={style.videoContainer}>
						<VideoPlayer
							video={{
								aId: video.aId,
								cId: video.cId,
								title: video.title,
								cover: videoPic,
								duration: video.duration,
								url: video.url,
							}}
						/>
					</div>
					<div className={style.videoInfoContainer} ref={this.infoContainerRef}>
						<i className={`icon-arrow-down ${style.iconArrow}`} ref={this.arrowRef} onClick={this.toggle} />
						<div className={style.infoWrapper} ref={this.infoRef}>
							<div className={style.title}>{video.title}</div>
							<div className={style.videoInfo}>
								<Link to={`/space/${video.owner.mId}`}>
									<span className={style.upUserName}>{video.owner.name}</span>
								</Link>
								<span className={style.play}>{formatTenThousand(video.playCount)}次观看</span>
								<span>{formatTenThousand(video.barrageCount)}弹幕</span>
								<span>{getPubdate(Number(video.publicDate))}</span> {/* 修复：若 publicDate 是 string，转为 number */}
							</div>
							<div className={style.desc}>{video.desc || "暂无简介"}</div>
							<div className={style.position}>
								<a href="/index">主页</a>
								<span>&gt;</span>
								<a href={`/channel/${video.twoLevel.id}`}>{video.twoLevel.name}</a>
								<span>&gt;</span>
								<span className={style.aid}>av{video.aId}</span>
							</div>
						</div>
					</div>
					<div className={style.recommendList}>
						{this.state.recommendVides.map((v) => (
							<div className={style.videoWrapper} key={v.aId}>
								<Link to={`/video/av${v.aId}`}>
									<div className={style.imageContainer}>
										<LazyLoad height="10.575rem">
											{/* 修复：移除 loading 属性（旧版 React 类型定义不支持） */}
											<img src={this.getPicUrl(v.pic, "@320w_200h")} alt={v.title} />
										</LazyLoad>
										<div className={style.duration}>{formatDuration(v.duration, "0#:##:##")}</div>
									</div>
									<div className={style.infoWrapper}>
										<div className={style.title}>{v.title}</div>
										<div className={style.upUser}>
											<Link to={`/space/${v.owner.mId}`}>
												<span>{v.owner.name}</span>
											</Link>
										</div>
										<div className={style.videoInfo}>
											<span>{formatTenThousand(v.playCount)}次观看</span>
											<span>&nbsp;·&nbsp;</span>
											<span>{formatTenThousand(v.barrageCount)}弹幕</span>
										</div>
									</div>
								</Link>
							</div>
						))}
						{this.state.loading && <div className={style.loading}>加载中...</div>}
					</div>
					{this.state.comments.length > 0 && (
						<div className={style.comment}>
							<div className={style.commentTitle}>
								评论<span className={style.commentCount}>(&nbsp;{this.commentPage.count}&nbsp;)</span>
							</div>
							<div className={style.commentList}>
								{this.state.comments.map((comment, i) => (
									<div className={style.commentWrapper} key={i}>
										<Link to={`/space/${comment.user.mId}`}>
											<LazyLoad height="2rem">
												{/* 修复：移除 loading 属性 */}
												<img className={style.commentUpPic} src={this.getPicUrl(comment.user.face, "@60w_60h")} alt={comment.user.name} />
											</LazyLoad>
										</Link>
										<span className={style.commentTime}>{comment.date}</span>
										<div className={style.commentUpUser}>
											<Link to={`/space/${comment.user.mId}`}>{comment.user.name}</Link>
										</div>
										<div className={style.commentContent}>{comment.content}</div>
									</div>
								))}
							</div>
							{this.state.showLoadMore ? (
								<div className={style.loadMore} onClick={this.loadMoreComment}>
									点击加载更多评论
								</div>
							) : (
								<div className={style.noMore}>没有更多了 ~</div>
							)}
						</div>
					)}
				</div>
				<ScrollToTop />
			</div>
		);
	}
}

Detail.contextType = Context;

export default Detail;
