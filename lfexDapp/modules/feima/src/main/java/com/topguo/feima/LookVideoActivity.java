package com.topguo.feima;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import android.os.Bundle;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.widget.Toast;

import com.alibaba.fastjson.JSON;
import com.mob68.ad.RewardVideoAd;
import com.mob68.ad.listener.IRewardVideoAdListener;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import okhttp3.Call;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class LookVideoActivity extends AppCompatActivity implements IRewardVideoAdListener {

    private RewardVideoAd mRewardVideoAd;
    private Context mContext;
    private String _imei;
    private String _token;
    private String _timeSpan;
    private String _url;
    private String _sign;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.mContext = this;
        Intent intent = getIntent();

        _token = intent.getStringExtra("token");
        _timeSpan=intent.getStringExtra("timeSpan");
        _url=intent.getStringExtra("url");
        String api=intent.getStringExtra("api");
        String auth=intent.getStringExtra("auth");
        _sign=intent.getStringExtra("sign");//Sign(api,_token,_timeSpan,auth);
        setContentView(R.layout.activity_look_video);

        if (ActivityCompat.checkSelfPermission(this, "android.permission.READ_PHONE_STATE") != 0) {
            _imei="999";
            ActivityCompat.requestPermissions(this, new String[] { "android.permission.READ_PHONE_STATE" }, 100);
        } else {
            TelephonyManager telephonyMgr = (TelephonyManager)getSystemService(TELEPHONY_SERVICE);
            if (telephonyMgr != null) {
                _imei = telephonyMgr.getDeviceId();
                if (_imei==null) _imei="888";
            }else {
                _imei="999";
            }
            onCallPermission();
        }

        mRewardVideoAd = new RewardVideoAd(LookVideoActivity.this, "2308","3415","LfUrGWxJ",new IRewardVideoAdListener() {
            @Override
            public void onAdSuccess() {
                if (mRewardVideoAd.isReady()) {
                    mRewardVideoAd.showAd();
                }else {
                    printStatusMsg("请稍后");
                }
            }
            @Override
            public void onAdFailed(String s) {
                printStatusMsg("视频onAdFailed");
            }
            @Override
            public void onAdClick(long l) {
                printStatusMsg("视频onAdClick.");
            }
            @Override
            public void onVideoPlayStart() {
                printStatusMsg("视频onVideoPlayStart.");
            }
            @Override
            public void onVideoPlayComplete() {
                printStatusMsg("视频onVideoPlayComplete.");
            }
            @Override
            public void onVideoPlayError(String s) {
                printStatusMsg("视频onAdClick.");
            }
            @Override
            public void onVideoPlayClose(long l) {
                printStatusMsg("视频onVideoPlayClose.");
            }
            @Override
            public void onAdPreSuccess() {
                printStatusMsg("视频onAdPreSuccess.");
            }
            @Override
            public void onLandingPageOpen() {
                printStatusMsg("视频onLandingPageOpen.");
            }
            @Override
            public void onLandingPageClose() {
                printStatusMsg("视频onLandingPageClose.");
                if (_token!=""){
                    MediaType MediaTypeJSON = MediaType.parse("application/json; charset=utf-8");
                    Map<String, String> map = new HashMap<String, String>();
                    map.put("postId","3415");
                    map.put("imei",_imei);
                    String json= JSON.toJSONString(map);
                    RequestBody requestBody=RequestBody.create(MediaTypeJSON,json);

                    final Request request = new Request.Builder()
                            .url(_url)
                            .addHeader("token",_token)
                            .addHeader("sign",_sign)
                            .addHeader("timeSpan",_timeSpan)
                            .post(requestBody)
                            .build();

                    new Thread(new Runnable() {
                        @Override
                        public void run() {
                            new OkHttpClient().newCall(request).enqueue(new okhttp3.Callback() {
                                @Override
                                public void onFailure(Call call, IOException e) {
                                    Log.e(TAG, "onFailure");
                                }

                                @Override
                                public void onResponse(Call call, Response response) throws IOException {
                                    if (response.isSuccessful()) {
                                        String responseString = response.body().string();
                                        Log.e(TAG, responseString);
                                    } else {
                                        Log.e(TAG, "onResponse error" + response.body().string());
                                    }
                                }
                            });
                        }
                    }).start();
                }
                LookVideoActivity.this.finish();
            }
            @Override
            public void onReward(HashMap<String, String> hashMap) {
                printStatusMsg("视频奖励："+hashMap.toString());
            }
        });
    }

    public String Sign(String api,String token,String timeSpan,String AUTH_SECRET)
    {
        String stringArray[] = {timeSpan,api, token,  AUTH_SECRET};
        String stringArray2[] =new  String[4];
        StringBuffer str = new StringBuffer();
        for (String s : stringArray) {
//            str.append(s.toUpperCase());
//            stringArray2.add(s);
        }
        for (String s : stringArray) {
            str.append(s.toUpperCase());
        }
        Arrays.sort(stringArray);
        String signStr=str.toString();
        String signMd5=Md5(signStr).substring(5,29);
        return signMd5;
    }

    public String Md5(String content) {
        byte[] hash;
        try {
            hash = MessageDigest.getInstance("MD5").digest(content.getBytes("UTF-8"));
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("NoSuchAlgorithmException",e);
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("UnsupportedEncodingException", e);
        }
        //对生成的16字节数组进行补零操作
        StringBuilder hex = new StringBuilder(hash.length * 2);
        for (byte b : hash) {
            if ((b & 0xFF) < 0x10){
                hex.append("0");
            }
            hex.append(Integer.toHexString(b & 0xFF));
        }
        return hex.toString();
    }

    public void onCallPermission()
    {
        if (Build.VERSION.SDK_INT >= 23)
        {
            if (checkSelfPermission("android.permission.WRITE_EXTERNAL_STORAGE") != PackageManager.PERMISSION_GRANTED)
            {
                if (shouldShowRequestPermissionRationale("android.permission.RECORD_AUDIO"))
                {
                    Toast.makeText(this, "Please grant the permission this time", Toast.LENGTH_LONG).show();
                }

                ActivityCompat.requestPermissions(this, new String[] { "android.permission.WRITE_EXTERNAL_STORAGE" }, 102);
            } else {
                Log.i("wei", "onClick granted");
            }
        }
    }

    protected void onResume()
    {
        super.onResume();
    }


    protected void onDestroy()
    {
        this.mContext = null;
        super.onDestroy();
    }

    private void printStatusMsg(String txt) {
        if (null != txt) {
            Log.d(TAG, txt);
        }
    }
    @Override
    public void onAdSuccess() {
        printStatusMsg("视频获取成功.");
    }
    @Override
    public void onAdFailed(String msg) {
        printStatusMsg("请求视频广告失败. msg=" + msg);
    }
    @Override
    public void onAdClick(long currentPosition) {
        printStatusMsg("视频广告被点击，当前播放进度 = " + currentPosition + " 秒");
    }
    @Override
    public void onVideoPlayStart() {
        printStatusMsg("视频开始播放.");
    }
    @Override
    public void onVideoPlayComplete() {
        printStatusMsg("视频播放完成.");
    }
    @Override
    public void onVideoPlayError(String msg) {
        printStatusMsg("视频播放错误，错误信息=" + msg);
    }
    @Override
    public void onVideoPlayClose(long currentPosition) {
        printStatusMsg("视频广告被关闭，当前播放进度 = " + currentPosition + " 秒");
    }
    @Override
    public void onAdPreSuccess() {
        printStatusMsg("视频onAdPreSuccess.");
    }
    @Override
    public void onLandingPageOpen() {
        printStatusMsg("视频广告页打开.");
    }
    @Override
    public void onLandingPageClose() {
        printStatusMsg("视频广告页关闭.");
    }
    @Override
    public void onReward(HashMap<String, String> info) {
        printStatusMsg("奖励："+info.toString());

    }
}
