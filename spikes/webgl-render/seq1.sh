set -x
node render.js tag=H_png w=1920 h=1080 flags=eglmesa read=png q=skip=1 passes=2 out=out/horizontal_1920x1080.mp4 stills=0,90,179
node render.js tag=V_jpeg w=1080 h=1920 flags=eglmesa read=jpeg q=skip=1 passes=2 out=out/vertical_1080x1920.mp4 stills=0,90,179
node render.js tag=H_jpeg w=1920 h=1080 flags=eglmesa read=jpeg q=skip=1 passes=2 out=out/horizontal_1920x1080_jpegpipe.mp4
node render.js tag=H540_up w=960 h=540 flags=eglmesa read=jpeg q=skip=1 passes=2 scale=1920x1080 out=out/horizontal_540p_upscaled_to_1080p.mp4 stills=90
node render.js tag=H_sw_jpeg w=1920 h=1080 flags=swangle read=jpeg q=skip=1 passes=2 out=out/horizontal_1080p_swiftshader.mp4
node render.js tag=H_noaa_jpeg w=1920 h=1080 flags=eglmesa read=jpeg aa=0 q=skip=1 passes=2 stills=90
