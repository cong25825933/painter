/**
 * Created by Yc on 2016/3/1.
 */
Shape = {
    Point: function (x, y) {
        this.x = x;
        this.y = y;
        this.distance = function (p) {
            p = p?p:new Shape.Point(0,0);
            return Math.sqrt(Math.pow(p.x-this.x,2)+Math.pow(p.y-this.y,2));
        }
        this.draw = function (paint, color, linewidth) {
            paint.strokeStyle = color ? color : 'black';
            paint.lineWidth = linewidth ? linewidth : 1;
            paint.beginPath();
            paint.moveTo(this.x, this.y);
            paint.lineTo(this.x + 1, this.y + 1);
            paint.stroke();
            paint.save();
        }
    },
    Line: function (p1, p2) {
        this.sp = p1;
        this.ep = p2;
        this.draw = function (paint, color, linewidth) {
            var ep = this.ep, sp = this.sp,
                dX = ep.x - sp.x,
                dY = ep.y - sp.y,
                a = sp.y - ep.y,
                b = ep.x - sp.x;
            if (Math.abs(dX) >= Math.abs(dY)) {
                if (dX >= 0 && dY >= 0) {
                    var d = b + 2 * a, d1 = 2 * a, d2 = 2 * (a + b);
                    new Shape.Point(sp.x, sp.y).draw(paint, color, linewidth);
                    for (var x = sp.x + 1, y = sp.y; x < ep.x; x++) {
                        if (d >= 0) d = d + d1;
                        else {
                            y++;
                            d = d + d2;
                        }
                        new Shape.Point(x, y).draw(paint, color, linewidth);
                    }
                }
                else if (dX >= 0 && dY <= 0) {
                    var d = -b + a << 1, d1 = (a - b) << 1, d2 = a << 1;
                    new Shape.Point(sp.x, sp.y).draw(paint, color, linewidth);
                    for (var x = sp.x + 1, y = sp.y; x < ep.x; x++) {
                        if (d >= 0) {
                            y--;
                            d = d + d1;
                        }
                        else d = d + d2;
                        new Shape.Point(x, y).draw(paint, color, linewidth);
                    }
                }
                else if (dX <= 0 && dY <= 0) {
                    var d = -b - 2 * a, d1 = -2 * a, d2 = -2 * (a + b);
                    new Shape.Point(sp.x, sp.y).draw(paint, color, linewidth);
                    for (var x = sp.x - 1, y = sp.y; x > ep.x; x--) {
                        if (d >= 0) d = d + d1;
                        else {
                            y--;
                            d = d + d2;
                        }
                        new Shape.Point(x, y).draw(paint, color, linewidth);
                    }
                }
                else {
                    var d = b - 2 * a, d1 = 2 * (b - a), d2 = -2 * a;
                    new Shape.Point(sp.x, sp.y).draw(paint, color, linewidth);
                    for (var x = sp.x - 1, y = sp.y; x > ep.x; x--) {
                        if (d >= 0) {
                            y++;
                            d = d + d1;
                        }
                        else d = d + d2;
                        new Shape.Point(x, y).draw(paint, color, linewidth);
                    }
                }
            }
            else {
                if (dX >= 0 && dY >= 0) {
                    var d = a + 2 * b, d1 = 2 * (a + b), d2 = 2 * b;
                    new Shape.Point(sp.x, sp.y).draw(paint, color, linewidth);
                    for (var x = sp.x, y = sp.y + 1; y < ep.y; y++) {
                        if (d >= 0) {
                            x++;
                            d = d + d1;
                        }
                        else {
                            d = d + d2;
                        }
                        new Shape.Point(x, y).draw(paint, color, linewidth);
                    }
                }
                else if (dX >= 0 && dY <= 0) {
                    var d = a - 2 * b, d1 = -2 * b, d2 = 2 * (a - b);
                    new Shape.Point(sp.x, sp.y).draw(paint, color, linewidth);
                    for (var x = sp.x, y = sp.y - 1; y > ep.y; y--) {
                        if (d >= 0)      d = d + d1;
                        else {
                            x++;
                            d = d + d2;
                        }
                        new Shape.Point(x, y).draw(paint, color, linewidth);
                    }

                }
                else if (dX <= 0 && dY <= 0) {
                    var d = -a - 2 * b, d1 = -2 * (a + b), d2 = -2 * b;
                    new Shape.Point(sp.x, sp.y).draw(paint, color, linewidth);
                    for (var x = sp.x, y = sp.y - 1; y > ep.y; y--) {
                        if (d >= 0) {
                            x--;
                            d = d + d1;
                        }
                        else               d = d + d2;
                        new Shape.Point(x, y).draw(paint, color, linewidth);
                    }

                }
                else {
                    var d = -a + 2 * b, d1 = 2 * b, d2 = 2 * (b - a);
                    new Shape.Point(sp.x, sp.y).draw(paint, color, linewidth);
                    for (var x = sp.x, y = sp.y + 1; y < ep.y; y++) {
                        if (d >= 0)           d = d + d1;
                        else {
                            x--;
                            d = d + d2;
                        }
                        new Shape.Point(x, y).draw(paint, color, linewidth);
                    }
                }
            }
        }
    },
    Circle: function (cp, r) {
        this.cp = cp;
        this.r = r;
        this.draw = function (paint, color, linewidth) {
            var r = this.r, cp = this.cp,
                d = 1 - r, p = new Shape.Point(0, r);
            while (p.x <= p.y) {
                new Shape.Point(cp.x + p.x, cp.y + p.y).draw(paint, color, linewidth);
                new Shape.Point(cp.x + p.x, cp.y - p.y).draw(paint, color, linewidth);
                new Shape.Point(cp.x - p.x, cp.y + p.y).draw(paint, color, linewidth);
                new Shape.Point(cp.x - p.x, cp.y - p.y).draw(paint, color, linewidth);
                new Shape.Point(cp.x + p.y, cp.y + p.x).draw(paint, color, linewidth);
                new Shape.Point(cp.x + p.y, cp.y - p.x).draw(paint, color, linewidth);
                new Shape.Point(cp.x - p.y, cp.y + p.x).draw(paint, color, linewidth);
                new Shape.Point(cp.x - p.y, cp.y - p.x).draw(paint, color, linewidth);
                p.x++;
                if (d < 0) d = d + 2 * p.x + 1;
                else {
                    p.y--;
                    d = d + 2 * p.x - 2 * p.y + 1;
                }
            }
        }
    },
}
Image = function (x,y,width,height) {
    this.x=x,this.y=y,this.width=width,this.height=height;
}
penDraw = function (arr,paint,color,linewidth) {
    if(arr.length==0)  return;
    paint.beginPath();
    paint.strokeStyle = color ? color : 'black';
    paint.lineWidth = linewidth ? linewidth : 1;
    paint.moveTo(arr[0].x,arr[0].y);
    for(var i =1;i<arr.length;i++){
        paint.lineTo(arr[i].x,arr[i].y);
    }
    paint.stroke();
    paint.save();
}