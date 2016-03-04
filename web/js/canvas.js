/**
 * Created by Yc on 2016/3/1.
 */

window.onload = function () {
    function randomColorStr(){
        function randomInt(bound){
            return Math.floor(Math.random()*bound);
        }
        return 'rgb('+[randomInt(256),randomInt(256),randomInt(256)].join(',')+')';
    }
    var first = true;

    var colorList = document.getElementById('color-list');
    (function (n) {
        for(var i = 0;i<n; i++) {
            var t = document.createElement('div');
            t.className = 'item rect';
            if(i==0)
                t.className+=' active';
            t.style.backgroundColor = randomColorStr();
            t.setAttribute('role','color-item');
            colorList.appendChild(t);
        }
        var t = document.createElement('div');
        t.style.clear='left';
        colorList.appendChild(t);
    })(30);
    var saveFile = function(data, filename){
        var save_link = document.createElement('a');
        save_link.href = data;
        save_link.download = filename;

        save_link.click()
    };
    canvas = document.getElementById('canvas');
    $(window).on('resize', function () {
        canvas.width=$('.painter-container').width();
    })
    $(window).resize()
    var paint = canvas.getContext('2d');
    paint.points =[],paint.images =[];
    $('[role$=item]').click(function () {
        $(this).parent().children('.active').removeClass('active');
        $(this).addClass('active')
        var role = $(this).attr('role').replace(/-.*/,'')
        if(role=='color')
            paint.color=$(this).css('background-color');
        else
            eval("paint."+role+"=$(this).text();");
    });
    function createCanvas(w,h){
        var c = document.createElement('canvas');
        c.width=w, c.height=h;
        return c.getContext('2d');
    }
    $('.active').each(function (i) {
        switch (i){
            case 0: paint.color=$(this).css('background-color'); break;
            case 1: paint.lineWidth=$(this).text(); break;
            case 2: paint.shapeType=$(this).text(); break;
        }
    });

    $('#canvas').on('mousedown', function (e) {
        paint.points=[]
        if(paint.moveImg) return;
        var x = e.offsetX, y = e.offsetY;
        if(paint.shapeType=='Pen')  return;
        paint.downPoint = new Shape.Point(x,y);
        paint.prevBg=paint.getImageData(0,0,paint.canvas.width,paint.canvas.height);
    }).on('mouseup', function (e) {
        paint.points=[]
        if(paint.moveImg) return;
        if(paint.shapeType=='Pen') return;
        if(!paint.downPoint) return;
        var x = e.offsetX, y = e.offsetY, arg;
        switch (paint.shapeType){
            case 'Line':arg=new Shape.Point(x,y);break;
            case 'Circle':arg=paint.downPoint.distance(new Shape.Point(x,y));break;
        }
        if(paint.prevBg) {
            paint.clearRect(0,0,paint.canvas.width,paint.canvas.height);
            paint.putImageData(paint.prevBg, 0, 0);
        }
        eval("new Shape."+paint.shapeType+"(paint.downPoint,arg).draw(paint,paint.color,paint.lineWidth)")

        paint.prevBg=paint.getImageData(0,0,paint.canvas.width,paint.canvas.height);
        //paint.prevBg=paint.getImageData(0,0,paint.canvas.width,paint.canvas.height);
    }).on('mousemove',function (e) {
        if(paint.moveImg) return;
        if(e.buttons==1) {
            var x = e.offsetX, y = e.offsetY;
            if (paint.shapeType == 'Pen') {
                paint.points.push(new Shape.Point(x, y));
                penDraw(paint.points, paint, paint.color, paint.lineWidth);
            }else{
                var arg; paint.movePoint = new Shape.Point(x,y);
                switch (paint.shapeType){
                    case 'Line':arg=paint.movePoint;break;
                    case 'Circle':arg=paint.downPoint.distance(paint.movePoint);break;
                }
                paint.clearRect(0,0,paint.canvas.width,paint.canvas.height);
                paint.putImageData(paint.prevBg,0,0);
                eval("new Shape."+paint.shapeType+"(paint.downPoint,arg).draw(paint,paint.color,paint.lineWidth)")
            }
        }
    })
    var Console=$('#console');
    Console.log = function (text) {
        $(this).append('<p>'+text+'</p>').scroll($(this).prop('scrollHeight'));
    };
    $(document).on('keyup',function(e){
        //if(e.ctrlKey && e.keyCode==90)//ctrl+z
        //    paint.restore();
    })

    imageHandle = function () {
        var f = $('#image-file')[0];
        f.click();
        f.onchange= function () {
            if(!f.files[0]) return;
            if(!f.files[0].type || !/image\/.*/i.test(f.files[0].type))
                alert('Please choose a picture.');
            else{
                var fr = new FileReader();
                fr.onload = function (f) {
                    $('#canvas').click(function (e) {
                        $(this).off('click');
                        var x = e.offsetX,y= e.offsetY;
                        paint.drawImage(img,x,y);
                        paint.images.push(new Image(x,y,img.width,img.height));
                        //rgb
                        var imgData = paint.getImageData(x,y,img.width,img.height),
                            map = (function (limit,n) {
                                var a={},t=Math.floor(limit/n);
                                a.keySet=[];
                                for(var i=0;i<n;i++) {
                                    var v = i*t;
                                    var key = [v,v+t-1].join('~');
                                    a.keySet.push(key);
                                    a[key]=0;
                                }
                                return a;
                            })(256,8);
                        var t = 256/8
                        for (var i=0;i<imgData.data.length;i+=4) {
                            var value = Math.floor((imgData.data[i+0]+imgData.data[i+1]+imgData.data[i+2])/3);
                            var index = Math.floor(value/t),v=index* t, key =[v,v+t-1].join('~');
                            map[key] = map[key]+1;
                        }
                        var str='';
                        for(var i in map.keySet){
                            var key = map.keySet[i];
                            str+= key +' -> '+map[key]+'<br>'
                        }
                        $('#msg-content').html(str);
                    });
                    var img = document.getElementById('img-container');
                    img.src=this.result;
                    if(first) {
                        alert('please click a point in painter as a begin point.');
                        first=false;
                    }
                }
                fr.readAsDataURL(f.files[0]);
            }
        }
    };
    alphaHandle = function () {
        setImageAlpha = function(index,alph){
            if(paint.images && paint.images.length>index ) {
                var image = paint.images[index],
                    img = paint.getImageData(image.x,image.y,image.width,image.height);
                for(var i=0;i<img.data.length;i+=4){
                    img.data[i+3] = alph;
                }
                paint.save();
                paint.putImageData(img,image.x,image.y);
                paint.restore();
            }
        };
        var alph;
        while((alph=parseInt(prompt('please set images alpha. (0~255)',120)))>255 || alph<0);
        for(var i=0;i<paint.images.length;i++)
            setImageAlpha(i,alph);
    };

    clearImages = function () {
        removeImage = function (index) {
            if(paint.images && paint.images.length>index ) {
                var image = paint.images[index]
                paint.save();
                paint.clearRect(image.x, image.y, image.width, image.height);
                paint.restore();
            }
        }
        for(var i=0 ;i<paint.images.length;i++)
            removeImage(i);
        paint.images = []
    };
    imgSelectHandle = function () {
        if(paint.images.length==0)
            alert('please import your image firstly.');
        else{
            alert('please click your image to download.');
            $('#canvas').click(function (e) {
                var _t=$(this);
                var x= e.offsetX, y = e.offsetY;
                for(var i =0 ;i<paint.images.length;i++){
                    var ele = paint.images[i];
                    if(x>=ele.x&&x<=ele.x+ele.width && y>=ele.y&&y<=ele.y+ele.height){
                        _t.off('click');
                        var data = paint.getImageData(ele.x,ele.y,ele.width,ele.height);
                        var can = createCanvas(ele.width,ele.height);
                        can.putImageData(data,0,0,0,0,data.width,data.height);
                        saveFile(can.canvas.toDataURL(),'download.png');
                        return;
                    }
                }
                alert('please click your image to download.');
            });
        }
    };
    moveImgHandle = function () {
        if(paint.images.length==0)
            alert('please import your image firstly.');
        else{
            alert('please drap your image to anywhere');
            function mouseDown(e) {
                var x = e.offsetX, y = e.offsetY;
                for (var i = 0; i < paint.images.length; i++) {
                    var ele = paint.images[i];
                    if (x >= ele.x && x <= ele.x + ele.width && y >= ele.y && y <= ele.y + ele.height) {
                        paint.moveImg=ele;
                        var data = paint.getImageData(ele.x, ele.y, ele.width, ele.height);
                        paint.clearRect(ele.x,ele.y,ele.width,ele.height);
                        paint.prevBg = paint.getImageData(0,0,paint.canvas.width,paint.canvas.height);
                        paint.putImageData(data,x,y);
                        return;
                    }
                }
            };
            function mouseMove(e){
                var x = e.offsetX, y = e.offsetY;
                if(paint.moveImg && e.buttons===1) {
                    var ele = paint.moveImg;
                    var data = paint.getImageData(ele.x, ele.y, ele.width, ele.height);
                    paint.clearRect(ele.x,ele.y,ele.width,ele.height);
                    paint.putImageData(data,x,y);
                    paint.moveImg=new Image(x,y,ele.width,ele.height);
                }
            };
            function mouseUp(e){
                var x = e.offsetX, y = e.offsetY;
                if(paint.moveImg) {
                    var ele = paint.moveImg;
                    var data = paint.getImageData(ele.x, ele.y, ele.width, ele.height);
                    paint.clearRect(ele.x,ele.y,ele.width,ele.height);
                    paint.putImageData(paint.prevBg,0,0);
                    paint.putImageData(data,x,y);
                    paint.moveImg=null;
                }
            }
            $('#canvas').on('mousedown', mouseDown).on('mousemove',mouseMove).on('mouseup',mouseUp);
        }
    }
    imgGrayHandle = function () {
        paint.images.forEach(function (ele) {
            var imgData = paint.getImageData(ele.x,ele.y,ele.width,ele.height);
            for (var i=0;i<imgData.data.length;i+=4) {
                var value = Math.floor((imgData.data[i+0]+imgData.data[i+1]+imgData.data[i+2])/3);
                imgData.data[i]=imgData.data[i+1]=imgData.data[i+2]=value;
            }
            paint.putImageData(imgData,ele.x,ele.y);
        })
    };
    hgHandle = function () {
        paint.images.forEach(function (ele) {
            var imgData = paint.getImageData(ele.x,ele.y,ele.width,ele.height);
            for (var i=0;i<imgData.data.length;i+=4) {
                imgData.data[i] = 255-imgData.data[i];
                imgData.data[i+1] = 255-imgData.data[i+1];
                imgData.data[i+2] = 255-imgData.data[i+2];
            }
            paint.putImageData(imgData,ele.x,ele.y);
        })
    };
    function ConvolutionMatrix(input, matrix, divisor, offset) {
        // 创建一个输出的 imageData 对象
        var output = document.createElement("canvas")
            .getContext('2d').createImageData(input);
        var w = input.width, h = input.height;
        var iD = input.data, oD = output.data;
        var m = matrix;
        // 对除了边缘的点之外的内部点的 RGB 进行操作，透明度在最后都设为 255
        for (var y = 1; y < h - 1; y += 1) {
            for (var x = 1; x < w - 1; x += 1) {
                for (var c = 0; c < 3; c += 1) {
                    var i = (y * w + x) * 4 + c;
                    oD[i] = offset
                        + (m[0] * iD[i - w * 4 - 4] + m[1] * iD[i - w * 4] + m[2] * iD[i - w * 4 + 4]
                        + m[3] * iD[i - 4] + m[4] * iD[i] + m[5] * iD[i + 4]
                        + m[6] * iD[i + w * 4 - 4] + m[7] * iD[i + w * 4] + m[8] * iD[i + w * 4 + 4])
                        / divisor;
                    oD[(y * w + x) * 4 + 3] = 255; // 设置透明度
                }
            }
        }
        return output;
    };
    cameoHandle = function () {
        paint.images.forEach(function (ele) {
            var imgData = paint.getImageData(ele.x,ele.y,ele.width,ele.height);
            paint.putImageData(ConvolutionMatrix(imgData,[-6,3,0,-3,-1,3,0,3,6],1,0),ele.x,ele.y);
        })
    }
    antiHandle = function () {
        paint.images.forEach(function (ele) {
            var imgData = paint.getImageData(ele.x,ele.y,ele.width,ele.height);
            paint.putImageData(ConvolutionMatrix(imgData,[0,0,0,0,1,0,0,0,0],-1,255),ele.x,ele.y);
        })
    }
};