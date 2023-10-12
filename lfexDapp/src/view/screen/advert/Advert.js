import BloomAd from 'react-native-bloom-ad';
// import { Pletfome} from 'react-native';

const Advert = {};

Advert.init = (callback) => {
    BloomAd.init("ba88b40c2c04cd5752")
    .then((appId) => {
        // 初始化成功
        callback && callback(true)
    })
    .catch((error) => {
        // 初始化失败
        callback && callback(false)
        console.log(error);
    });
}

Advert.setUserId = (userId) => {
    // 登录时请设置 userId
    BloomAd.setUserId(`${userId}`);
}

Advert.setUserId = () => {
    // 登录时请设置 userId
    BloomAd.setUserId();
}

Advert.showSplash = () => {
    const interval = 1000 * 60 * 3;  // 设置时间间隔，单位是毫秒，切到后台后超过间隔返回时重新加载开屏
    BloomAd.showSplash({
    unitId: "s1", // 广告位 id
    time: interval,
    onAdDismiss(params) {
        // 广告被关闭
        console.log(params);
    },
    onError(params) {
        // 广告出错
        console.log(params);
    },
    });
}


Advert.rewardVideo = (callback) => {
    BloomAd.rewardVideo({
        unitId: "rv1", // 广告位 id
        showWhenCached: false, // 是否完全加载后才开始播放
        onAdLoad(params) {
            // 广告加载成功
            console.log(params);
        },
        onVideoCached(params) {
            // 视频素材缓存成功
            console.log(params);
        },
        onAdShow(params) {
            // 广告页面展示
            console.log(params);
        },
        onReward(params) {
            // 广告激励发放
            console.log(params);
            callback && callback(true)
        },
        onAdClick(params) {
            // 广告被点击
            console.log(params);
        },
        onVideoComplete(params) {
            // 广告播放完毕
            console.log(params);
            // callback && callback(true)
        },
        onAdClose(params) {
            // 广告被关闭
            console.log(params);
        },
        onError(params) {
            // 广告出错
            console.log(params);
            callback && callback(false)
        },
    });
}

Advert.interstitial = () => {
    BloomAd.interstitial({
        unitId: "i1", // 广告位 id
        width: 300, // 插屏广告广告宽度
        onAdLoad(params) {
        // 广告加载成功
        console.log(params);
        },
        onAdShow(params) {
        // 广告页面展示
        console.log(params);
        },
        onAdClick(params) {
        // 广告被点击
        console.log(params);
        },
        onAdClose(params) {
        // 广告被关闭
        console.log(params);
        },
        onError(params) {
        // 广告出错
        console.log(params);
        },
    });
}



















export default Advert;