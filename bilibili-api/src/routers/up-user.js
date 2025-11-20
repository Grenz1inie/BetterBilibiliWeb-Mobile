const express = require("express");
const {
  fetchUserData,
  fetchUserVideo
} = require("../api");
const router = express.Router();

router.get("/up/:uId", (req, res, next) => {
  if (req.path === "/up/video") {
    next();
    return;
  }
  fetchUserData(req.params.uId).then((data) => {
    const resData = {
      code: "1",
      msg: "success",
      data
    }
    res.send(resData);
  }).catch(next);
});

router.get("/up/video", (req, res, next) => {
  const param = {
    uId: req.query.uId,
    p: req.query.p,
    size: req.query.size
  }
  fetchUserVideo(param).then((data) => {
    console.log('B站API返回数据:', JSON.stringify(data, null, 2));
    let resData = {
      code: "1",
      msg: "success"
    }
    if (data.code === 0 && data.data) {
      // 适配新API返回的数据结构
      let vlist = [];
      let pageInfo = {
        count: 1,
        pn: 1,
        ps: 10
      };
      
      // 检查数据结构
      if (data.data.list) {
        if (Array.isArray(data.data.list)) {
          // list 直接就是数组
          vlist = data.data.list;
        } else if (data.data.list.vlist && Array.isArray(data.data.list.vlist)) {
          // list 是对象，包含 vlist 数组
          vlist = data.data.list.vlist;
        }
      }
      
      // 字段映射 - 将新API的字段映射为旧API的字段
      vlist = vlist.map(video => ({
        aid: video.aid || video.id,
        title: video.title,
        pic: video.pic,
        author: video.author,
        mid: video.mid,
        play: video.play || video.stat?.view || 0,
        video_review: video.video_review || video.comment || video.stat?.danmaku || 0,
        length: video.length || video.duration,
        created: video.created || video.ctime,
        description: video.description
      }));
      
      if (data.data.page) {
        pageInfo = {
          count: data.data.page.count || 1,
          pn: data.data.page.pn || 1,
          ps: data.data.page.ps || 10
        };
      }
      
      resData.data = {
        list: {
          vlist: vlist
        },
        page: pageInfo
      };
      
      console.log('处理后返回给前端的数据:', JSON.stringify(resData, null, 2));
    } else {
      resData.code = "0";
      resData.msg = data.message || "fail";
      console.log('B站API返回错误:', data);
    }
    res.send(resData);
  }).catch((err) => {
    console.error('获取用户视频失败:', err);
    next(err);
  });
});


module.exports = router;
