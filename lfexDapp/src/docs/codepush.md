## ak
327c6582a354e950c9c5afbe61b6f88f5256a70a


[topbrids@bogon ~]$ code-push access-key ls
┌───────┬───────────────┐
│ Name  │ Created       │
├───────┼───────────────┤
│ GY    │ Dec 4, 2018   │
├───────┼───────────────┤
│ bogon │ 3 minutes ago │
└───────┴───────────────┘
[topbrids@bogon ~]$ 
[topbrids@bogon ~]$ 
[topbrids@bogon ~]$ code-push access-key rm GY
Are you sure? (y/N): y
Successfully removed the "GY" access key.
[topbrids@bogon ~]$ code-push access-key ls
┌───────┬───────────────┐
│ Name  │ Created       │
├───────┼───────────────┤
│ bogon │ 4 minutes ago │
└───────┴───────────────┘
[topbrids@bogon ~]$ code-push app add yoyoba android react-native
Successfully added the "yoyoba" app, along with the following default deployments:
┌────────────┬────────────────────────────────────────┐
│ Name       │ Deployment Key                         │
├────────────┼────────────────────────────────────────┤
│ Production │ 73DmyIdfkpjxeMc9M9-et0xi7fRzX8wrXqU_ta │
├────────────┼────────────────────────────────────────┤
│ Staging    │ XoEM7H9accPNvSirOSvrsCT8J8z5T1fqKD6fq  │
└────────────┴────────────────────────────────────────┘

[topbrids@bogon ~]$ code-push app add yoyoba-ios ios react-native
Successfully added the "yoyoba-ios" app, along with the following default deployments:
┌────────────┬────────────────────────────────────────┐
│ Name       │ Deployment Key                         │
├────────────┼────────────────────────────────────────┤
│ Production │ Z1HuYOolqeDY1nIrUfcB8dWpVh1AZ93b1g5xBm │
├────────────┼────────────────────────────────────────┤
│ Staging    │ RkZDY0WeR1yo4fjd_6CTZUjP8jB_yplbkm79P  │
└────────────┴────────────────────────────────────────┘

向CodePush添加应用时需要指明应用的平台，成功注册CodePush应用后，每个应用都会生成两个deployment key。其中，Production是用于生产环境的deployment key，Staging则是用于模拟环境的deployment key。
注册成功后，可以通过
https://appcenter.ms/apps 
来查看注册的CodePush应用的信息，如图11-14所示。


code-push release-react codepush ios

code-push release-react yoyoba android


我们可以通过code-push release-react命令发布更新包。多次发布更新包也是如此。

$ code-push release-react <Appname> <Platform> --t <本更新包面向的旧版本号> --des <本次更新说明>

注意： CodePush默认是更新Staging 环境的，如果发布生产环境的更新包，需要指定--d参数：--d Production，如果发布的是强制更新包，需要加上 --m true强制更新

//例如
$ code-push release-rereact CodePushDemo_IOS ios --t 1.0.0 --des "本次更新了hello world!" --m true


查询提交过哪些更新包:

 查询Production
 $ code-push deployment history CodePushDemo_IOS Production
 
 查询Staging
 $ code-push deployment history projectName Staging

react-native-code-push进阶篇

https://www.jianshu.com/p/6e96c6038d80

code-push release-rereact yoyoba android --t 1.1.0 --des "优化实名认证问题" --m true


code-push release-react yoyoba android  --t 1.1.6 --dev false --d Production --des "修复显示问题" --m true

code-push deployment history yoyoba Production

code-push release-react yoyoba android  --t 1.2.4 --dev false --d Production --des "撸哟帮之前版本" --m true

// ----------------------------------------------------------------

appcenter codepush deployment add -a topbrids-gmail.com/lfexapp-ios Staging
Deployment Staging has been created for topbrids-gmail.com/lfexapp-ios with key ix_YY2DPs561ZWgOuAKJUTsH279WYA75M_hP3
appcenter codepush deployment add -a topbrids-gmail.com/lfexapp-ios Production
Deployment Production has been created for topbrids-gmail.com/lfexapp-ios with key 2hgJffbBPhQXt-RHbuhpk41Af2IJXa3itd6Hg

推送更新：
appcenter codepush release-react -a topbrids-gmail.com/lfexapp-android -d Staging -m true  // -m true 是强制更新可以不加
appcenter codepush release-react -a topbrids-gmail.com/lfexapp-android -d Production -m true  // -m true 是强制更新可以不加

appcenter codepush release-react -a topbrids-gmail.com/lfexapp-ios -d Staging -m true  // -m true 是强制更新可以不加
appcenter codepush release-react -a topbrids-gmail.com/lfexapp-ios -d Production -m true  // -m true 是强制更新可以不加