package com.topguo.feima;

import android.content.Intent;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.mob68.ad.RewardVideoAd;
import com.mob68.ad.listener.IRewardVideoAdListener;
import java.util.HashMap;

public class FeiMaModule extends ReactContextBaseJavaModule {

    private static final String TAG = FeiMaModule.class.getSimpleName();


    private ReactContext mReactContext;



    public FeiMaModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return "FeiMaModule";
    }

    @ReactMethod
    public void openLookVideo(String sign,String url,String api,String token,String timeSpan,String auth) {
        Intent intent = new Intent();
        intent.setClass(mReactContext, LookVideoActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.putExtra("api",api);
        intent.putExtra("sign",sign);
        intent.putExtra("token",token);
        intent.putExtra("timeSpan",timeSpan);
        intent.putExtra("auth",auth);
        intent.putExtra("url",url);

        mReactContext.startActivity(intent);
    }
}
