/// <reference path="definitions/jquery.d.ts" />
/// <reference path="definitions/jquery.cookie.d.ts" />
module OverFlowScrolling {

    export class Creater {
        private ua_checker: UAChecker;
        private target_setter: TargetSetter;

        constructor(public target: JQuery) {
            this.ua_checker = new UAChecker();
            if (this.ua_checker.check()) {
                this.target_setter = new TargetSetter(target);
            }
        }
    }

    // Androidのみ
    export class UAChecker {
        constructor() {
        }
        check(): boolean {
            if (navigator.userAgent.indexOf('Android') > 0) {
                return true;
            }
            return false;
        }
    }

    export class TargetSetter {

        constructor(public target: JQuery) {
            this.ready();
            this.resize();
        }

        ready(): void {
            var _this = this;

            $.each(this.target, function() {

                var parent: JQuery = $(this);
                var child: JQuery = parent.find('.scrolling__body');
                var wrap: JQuery = parent.find('.scrolling__layout');

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
        }

        resize(): void {
            var _this = this;
            $(window).resize(function(){
                _this.ready();
            });
        }
    }

    export class EventDispatcher {
        public touch_start_X: number;
        public touch_move_X: number;
        public scroll_size_x: number;
        public touchmove_arry: any;
        public max_scroll_size_x: number;

        constructor(public options: any) {
            this.touchmove_arry = [];
            this.scroll_size_x = 0;
            this.max_scroll_size_x = this.options.scroll_obj.width() - $(window).innerWidth();

            if(this.max_scroll_size_x > 0){
                this.touchEvent();
            }

            if (this.max_scroll_size_x <= 0) {
                this.offEvent();
            }
        }

        touchEvent(): void {

            var _this = this;

            this.options.target.on('touchstart', function(event) {

                _this.touch_start_X = event.originalEvent.changedTouches[0].pageX;

                _this.options.scroll_obj.css({
                    'transition': 'none',
                    '-webkit-transition': 'none'
                });

            });

            this.options.target.on('touchmove', function(event) {

                event.preventDefault();
                _this.touch_move_X = event.originalEvent.changedTouches[0].pageX;

                _this.options.scroll_obj.css({
                    'transition': 'transform 0ms ease-in-out',
                    '-webkit-transition': '-webkit-transform 0ms ease-in-out'
                });

                _this.move();
            });

            this.options.target.on('touchend', function(event) {

                // moveの座標をいれた配列を初期化する
                _this.touchmove_arry = [];

            });
        }

        offEvent(): void {
            this.options.target.off();
        }

        move(): void {
            var touchmove_len: number;

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
                    '-webkit-transform': 'translate3d(' + this.scroll_size_x + 'px' + ',0,0)',
                });
            }

        }

    }
}

(function(){
    var overflow_scrolling = new OverFlowScrolling.Creater($('.scrolling'));
})();