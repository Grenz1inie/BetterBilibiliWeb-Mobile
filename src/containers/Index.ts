import { connect } from "react-redux";
import Index from "../views/index/Index";

const mapStateToProps = (state) => ({
  oneLevelPartitions: state.oneLevelPartitions,
  banners: state.banners,
  additionalVideos: state.additionalVideos,
  rankingVideos: state.rankingVideos
});

const mapDispatchToProps = (dispatch) => ({
  dispatch
});

export default connect(mapStateToProps, mapDispatchToProps)(Index);
