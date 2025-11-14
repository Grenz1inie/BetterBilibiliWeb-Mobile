import { AnyAction, Dispatch } from "redux";
import { getRoomInfo, getPlayUrl } from "../../../api/live";
import { setRoomData } from "../../actions";
import { Live } from "../../../models";

export default function getRoomData(roomId: number) {
  return (dispatch: Dispatch<AnyAction>) => {
    const promises = [getRoomInfo(roomId), getPlayUrl(roomId)];
    return Promise.all(promises).then(([result1, result2]) => {
      if (result1.code === "1" && result2.code === "1") {
        const data = result1.data;
        const live = new Live(
          data.title,
          data.room_id,
          data.online,
          data.user_cover,
          data.live_status,
          "",
          null
        );
        // 修复：直接使用第一个播放地址，因为 durl 数组通常只有一个元素
        live.playUrl = result2.data.durl && result2.data.durl.length > 0 
          ? result2.data.durl[0].url 
          : "";
        
        dispatch(setRoomData({
          parentAreaId: data.parent_area_id,
          parentAreaName: data.parent_area_name,
          areaId: data.area_id,
          areaName: data.area_name,
          uId: data.uid,
          description: data.description,
          liveTime: data.live_time,
          live,
        }));
      }
    });
  };
}
