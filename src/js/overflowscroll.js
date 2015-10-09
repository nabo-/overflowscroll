/// <reference path="definitions/jquery.d.ts" />
/// <reference path="definitions/jquery.cookie.d.ts" />
var OverFlowScrolling;
(function (OverFlowScrolling) {
    var Creater = (function () {
        function Creater(target) {
            this.target = target;
            this.ua_checker = new UAChecker();
            if (this.ua_checker.check()) {
                this.target_setter = new TargetSetter(target);
            }
        }
        return Creater;
    })();
    OverFlowScrolling.Creater = Creater;
    // Androidのみ
    var UAChecker = (function () {
        function UAChecker() {
        }
        UAChecker.prototype.check = function () {
            if (navigator.userAgent.indexOf('Android') > 0) {
                return true;
            }
            return false;
        };
        return UAChecker;
    })();
    OverFlowScrolling.UAChecker = UAChecker;
    var TargetSetter = (function () {
        function TargetSetter(target) {
            this.target = target;
            this.ready();
            this.resize();
        }
        TargetSetter.prototype.ready = function () {
            var _this = this;
            $.each(this.target, function () {
                var parent = $(this);
                var child = parent.find('.scrolling__body');
                var wrap = parent.find('.scrolling__layout');
                child.css({
                    'position': 'absolute',
                    'overflow': '',
                    'top': '0',
                    'left': '0',
                    'transform': 'translate3d(0,0,0)',
                    '-webkit-transform': 'translate3d(0,0,0)'
                });
                wrap.css({
                    'height': child.height(),
                    'overflow': 'hidden'
                });
                // この辺の要素もう一度見直す必要あり？？？　いらないのがある
                var event_dispatcher = new EventDispatcher({
                    target: parent,
                    scroll_obj: child
                });
            });
        };
        TargetSetter.prototype.resize = function () {
            var _this = this;
            $(window).resize(function () {
                _this.ready();
            });
        };
        return TargetSetter;
    })();
    OverFlowScrolling.TargetSetter = TargetSetter;
    var EventDispatcher = (function () {
        function EventDispatcher(options) {
            this.options = options;
            this.touchmove_arry = [];
            this.scroll_size_x = 0;
            this.max_scroll_size_x = this.options.scroll_obj.width() - $(window).innerWidth();
            if (this.max_scroll_size_x > 0) {
                this.touchEvent();
            }
            if (this.max_scroll_size_x <= 0) {
                this.offEvent();
            }
        }
        EventDispatcher.prototype.touchEvent = function () {
            var _this = this;
            this.options.target.on('touchstart', function (event) {
                _this.touch_start_X = event.originalEvent.changedTouches[0].pageX;
                _this.options.scroll_obj.css({
                    'transition': 'none',
                    '-webkit-transition': 'none'
                });
            });
            this.options.target.on('touchmove', function (event) {
                event.preventDefault();
                _this.touch_move_X = event.originalEvent.changedTouches[0].pageX;
                _this.options.scroll_obj.css({
                    'transition': 'transform 0ms ease-in-out',
                    '-webkit-transition': '-webkit-transform 0ms ease-in-out'
                });
                _this.move();
            });
            this.options.target.on('touchend', function (event) {
                // moveの座標をいれた配列を初期化する
                _this.touchmove_arry = [];
            });
        };
        EventDispatcher.prototype.offEvent = function () {
            this.options.target.off();
        };
        EventDispatcher.prototype.move = function () {
            var touchmove_len;
            // touchmoveは動いている間、常に取得する為、配列にpushする
            this.touchmove_arry.push(this.touch_move_X);
            touchmove_len = this.touchmove_arry.length;
            // touchmoveの配列に１つしかない時はtouchstartとの差をスクロール対象に加算する
            if (touchmove_len === 1) {
                this.scroll_size_x += this.touchmove_arry[0] - this.touch_start_X;
            }
            // touchmoveの配列の隣同士の差を取得して　スクロール対象に加算していく
            if (touchmove_len > 1) {
                this.scroll_size_x += this.touchmove_arry[touchmove_len - 1] - this.touchmove_arry[touchmove_len - 2];
            }
            // スクロール対象が初期位置に近ずいた時に強制的にゼロにする
            if (this.scroll_size_x > -10) {
                this.scroll_size_x = 0;
            }
            // スクロール対象が限界を超えた瞬間に　限界の値を強制的に代入してこれ以上進まないようにする
            if (this.scroll_size_x <= (this.max_scroll_size_x * -1)) {
                this.scroll_size_x = (this.max_scroll_size_x * -1);
            }
            // スクロール範囲内の場合に値を設定していく
            if (this.scroll_size_x <= 0 && this.scroll_size_x >= (this.max_scroll_size_x * -1)) {
                this.options.scroll_obj.css({
                    'transform': 'translate3d(' + this.scroll_size_x + 'px' + ',0,0)',
                    '-webkit-transform': 'translate3d(' + this.scroll_size_x + 'px' + ',0,0)'
                });
            }
        };
        return EventDispatcher;
    })();
    OverFlowScrolling.EventDispatcher = EventDispatcher;
})(OverFlowScrolling || (OverFlowScrolling = {}));
(function () {
    var overflow_scrolling = new OverFlowScrolling.Creater($('.scrolling'));
})();
