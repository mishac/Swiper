(function($) {
  'use strict';

  var defaultOptions = {
    'numPages': 3,
    'initialPage': 0,
    'loop': false,
    'generatePages': function(index) { this.html('Page ' + index); },
    'onbeforemovein': function() { },
    'onmovein': function() { },
    'onbeforemoveout': function() { },
    'onmoveout': function() { },
    'onflip': function() { },
    'oncreate': function() { },
    'duration': 300,
    'easing': 'linear',
    'transition': null,
    'snapDistance': 100
  };

  var publicMethods = {
    'init': function(options) {
      options = $.extend(defaultOptions, options);

      return this.each(function() {
        var $this = $(this),
            data = $this.data('swiper'), 
            hasTouch =  (function() {
              var el = document.createElement('div');
              el.setAttribute('ongesturestart', 'return;');
              return (typeof el.ongesturestart === "function");
            })(),
            $wrapper = $('<div />', { 'class':  'swiper-wrapper' }),
            width = $this.width();

        if (! data) {
          data = {
            options: options,
            'currentPage': options.initialPage,
            'hasTouch': hasTouch,
            'touchEvent': hasTouch ? 'touchstart': 'mousedown',
            'moveEvent': hasTouch ? 'touchmove' : 'mousemove',
            'endEvent': hasTouch ? 'touchend' : 'mouseup',
            'leaveEvent': hasTouch ? 'touchcancel' : 'mouseleave'
          };

          $this.css({ 'position': 'relative', 'overflow': 'hidden' })
               .addClass('swiper swiper-processed');

          $wrapper.css({
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'width': '100%',
            'height': '100%'
          });

          for (var i = 0; i < 3; i++) {
            var pageIndex = options.initialPage + i - 1,
                $newPage;
            if (pageIndex < 0) {
              pageIndex = data.options.numPages + pageIndex;
            }
            $newPage = $('<div />', { 'class': ((options.initialPage === pageIndex) ? 'swiper-active' : '') + ' swiper-page swiper-page-' + i })
              .css({
                'width': width + 'px',
                'height': '100%',
                'position': 'absolute',
                'left': (i - 1) * width + 'px',
                'top': 0
              })
              .data('page-index', pageIndex)
              .appendTo($wrapper);
            data.options.generatePages.call($newPage, pageIndex);
          }
        }

        data.wrapper = $wrapper;
        data.pages = $wrapper.find('.swiper-page');

        $this.on(data.touchEvent + '.swiper', { 'hasTouch': hasTouch }, events.touchstart)
             .on('flip.swiper', events.flip);
        $this.data('swiper', data);
        $this.append($wrapper);
      });
    },
    'destroy': function(removeDOM) {
      removeDOM = removeDOM || false;
      return this.each(function() {
        var $this = $(this),
            data = $this.data('swiper');
        $this.off('.swiper');

        if (removeDOM) {
          $this.children.remove();
        }
        $this.removeData('swiper');
      });

    },
    'swipe': function(direction, numPages) {
      return this.each(function() {
        var $swiper = $(this),
            width = $swiper.width(),
            data = $swiper.data('swiper'),
            $pages = $swiper.find('.swiper-page'),
            $activePage = $pages.filter('.swiper-active'),
            $pageToMove,
            $newActivePage,
            movedPagePosition = (direction === 'left') ? width : -width;

        if (!data.options.loop) {
          if ((direction === 'left' && data.currentPage >= data.options.numPages - 1) || 
              (direction === 'right' && data.currentPage <= 0)) {
            return privateMethods._move.call($swiper, 0, true);
          }
        }


        if (direction === 'left') {
          $pageToMove = $activePage.prev();
          $newActivePage = $activePage.next();
        } 
        else {
          $pageToMove = $activePage.next();
          $newActivePage = $activePage.prev();
        }

        data.options.onbeforemoveout.call($activePage);
        data.options.onbeforemovein.call($newActivePage);

        $activePage.removeClass('swiper-active');

        $newActivePage.addClass('swiper-active');
        data.currentPage = $newActivePage.data('page');

        $pageToMove.detach()
                   .css({'left': movedPagePosition + 'px'});
        
        if (direction === 'left') {
          $pageToMove.appendTo(data.wrapper);
        } else {
          $pageToMove.prependTo(data.wrapper);
        }

        $pages.not($pageToMove).each(function() {
          var $this = $(this),
              pagePosition = (direction === 'left') ? ($this.index() - 1) * width + 'px' : ($this.index() - 1) * width + 'px';
          privateMethods._transition.call($swiper, $this, { 'left': pagePosition }, data.options.duration, data.options.easing, function() {
            data.isMoving = false;
            $this.data('swiper', data);
          });
        });
        data.options.onmoveout.call($activePage);
        data.options.onmovein.call($newActivePage);
        $swiper.trigger('flip');
      });
    },
    'prev': function() {
      return publicMethods.swipe.call(this, 'right');
    },
    'next': function() {
      return publicMethods.swipe.call(this, 'left');
    },
    'goto': function(page) {
      return this.each(function() {
        var $this = $(this),
            data = $this.data('swiper'),
            $pages = $this.find('.swiper-page');
        
        data.options.onmoveout.call($pages.eq(1));
        
        if (page < 0) {
          page = (data.options.numPages + page) % data.options.numPages;
        }
        if (page > data.options.numPages) {
          page %= data.options.numPages;
        }

        for (var i = 0; i < 3; i++) {
          var pageIndex = page + i - 1;
          if (pageIndex < 0) {
            page = (data.options.numPages + page) % data.options.numPages;
          }
          if (pageIndex >= data.options.numPages) {
            pageIndex %= data.options.numPages;
          }
          $pages.eq(i).data('page-index', pageIndex);
          data.options.generatePages.call($pages.eq(i), pageIndex);
        }

        data.currentPage = page;
        $this.data('swiper', data);

        data.options.onmovein.call($pages.eq(1));

        $this.trigger('flip');
      });
    },
    'option': function(options) {
      if (options || typeof options === 'object') {
        return this.each(function() {
          var $this = $(this),
              data = $this.data('swiper');
          $.extend(data.options, options);
          $this.data('swiper', data);
        });
      } 
      else {
        return $(this).data('options');
      }
    }
  };

  var privateMethods = {
    '_move': function(position, animated) {
      animated = animated || false;
      return this.each(function() {
        var $swiper = $(this),
            data = $swiper.data('swiper');
        data.pages.each(function() {
          var $this = $(this),
              width = $this.width(),
              newCSS = { 'left': ($this.index() - 1) * width + position + 'px' },
              duration;

          if (animated) {
            data.isMoving = true;
            $swiper.data('swiper', data);
            duration = data.options.duration * Math.abs(position / width);
            privateMethods._transition.call($swiper, $this, newCSS, duration, data.options.easing, function() {
              data.isMoving = false;
              $swiper.data('swiper', data);
            });
          } else {
            $this.css(newCSS);
          }
        });
      });
    },
    '_transition': function($element, properties, duration, easing, complete) {
      var data = this.data('swiper');
      if (typeof data.options.transition === 'function') {
        data.options.transition.apply($element, Array.prototype.slice.call(arguments, 1));
      }
      else {
        $element.animate(properties, duration, easing, complete);
      }
    }
  };

  var events = {
    'flip': function(e) {
      var $this = $(this),
          data = $this.data('swiper'),
          $pages = $this.find('.swiper-page'),
          $activePage = $pages.filter('.swiper-active'),
          currentPage = $activePage.data('page-index'),
          $leftPage = $activePage.prev(),
          $rightPage = $activePage.next(),
          newIndex;

      if ($leftPage.data('page-index') !== currentPage - 1) {
        newIndex = currentPage - 1;
        if (newIndex < 0) {
          newIndex = (data.options.numPages + newIndex) % data.options.numPages;
        }
        $leftPage.data('page-index', newIndex);
        data.options.generatePages.call($leftPage, newIndex);
      }
      if ($rightPage.data('page-index') !== currentPage + 1) {
        newIndex = currentPage + 1;
        if (newIndex >= data.options.numPages) {
          newIndex %= data.options.numPages;
        }
        $rightPage.data('page-index', newIndex);
        data.options.generatePages.call($rightPage, newIndex);
      }

      data.options.onflip.call($this, e);
    },
    'touchstart': function(e) {
      var $this = $(this),
          hasTouch = e.data.hasTouch,
          data = $this.data('swiper'),
          point = hasTouch ? e.originalEvent.touches[0] : e;

      e.preventDefault();
      if (!data.swipeBlocked && !data.isMoving) {
        e.data.touchPosition = point.pageX;
        $this.on(data.moveEvent + '.swiper', e.data, events.touchmove);
        $this.on(data.endEvent + '.swiper', e.data, events.touchend);
        $this.on(data.leaveEvent + '.swiper', e.data, events.touchend);
      }
    },
    'touchmove': function(e) {
      var $this = $(this),
          data = $this.data('swiper'),
          point = e.data.hasTouch ? e.originalEvent.touches[0] : e,
          delta = point.pageX - e.data.touchPosition,
          absDelta = Math.abs(delta);
      if (absDelta > 10) {
        data.isMoving = true;
        $this.data('swiper', data);
        privateMethods._move.call($this, delta);
      }
    },
    'touchend': function(e) {
      var $this = $(this),
          data = $this.data('swiper'),
          point = e.data.hasTouch ? e.originalEvent.changedTouches[0] : e,
          delta = point.pageX - e.data.touchPosition;
      if (data.isMoving) {
        if (delta > data.options.snapDistance) {
          publicMethods.prev.call($this);
        }
        else if (delta < -data.options.snapDistance) {
          publicMethods.next.call($this);
        }
        else {
          privateMethods._move.call($this, 0, true);
        }
      }
      else {
        //didn't move, so must be a click
        $(document.elementFromPoint(point.pageX, point.pageY)).trigger('click');
      }

      $this.off(data.moveEvent + '.swiper ' + data.endEvent + '.swiper ' + data.leaveEvent + '.swiper');
    }
  };

  jQuery.fn.swiper = function(options) {
    if (publicMethods[options]) {
      return publicMethods[options].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    else if ( typeof options === 'object' || ! options ) {
      return publicMethods.init.apply(this, arguments);
    }
    else {
      $.error('Method ' + options + ' does not exist on jQuery.swiper');
    }
  };
})(jQuery);