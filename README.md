jQuery Swiper
=========

A jQuery based widget for creating touch-swipable carousels.  Inspired by <http://cubiq.org/swipeview>

Overview
--------

Only 3 pages will be loaded at any time, keeping the memory footprint low.  A function must be provided to generate the content of each page.

Usage
-----

    $('element').swiper(options);

Where options is an object with any of the following keys:
    
    numPages - The number of pages in the swiper (defaults to 3)
    initialPage - The initially selected page (defaults to 0)
    loop - whether or not the carousel will be circular, allowing you to go from the last to the first page.  (default false)
    duration - time in milliseconds for page change animations.  Defaults to 300.  Any string acceptable by jQuery.animate can be used ('fast' or 'slow', etc.)
    easing - string name of the easing function to be used.  Defaults to 'linear'
    snapDistance - how far a user must move his finger or mouse before the swiper automatically swipes to the next page.  Defaults to 100px.
    
The following function options are available:

    generatePage
    -------------
        function(index)

    This function is bound to the jQuery object of the page to be displayed, and index is the page number.  A trivial example of this function:

        function(index) {
          this.html('You are on page #' + index);
        }

    transition
    ----------

    Custom animation functions, to be documented.

    onbeforemovein
    --------------
    This function fires on a page before it is swiped into view

    onmovein
    --------
    This function fires on a page after it is swiped into view

    onbeforemoveout
    ---------------
    This function fires on a page before it is swiped out of view

    onmoveout
    ---------
    This function fires on a page after it is swiped out of view

    onflip
    ------
    Fires on the swiper element whenever a page is changed

    oncreate
    --------
    Fires on the swiper when it is initialized


Methods
-------
    $('element').swiper('init');

Alias of $().swiper();

    $('element').swiper('destroy');

Removes the swiper.  An additional boolean parameter indicates whether all the pages should be removed from the DOM (defaults to false).

    $('element').swiper('swipe', direction);

Moves the swiper one page to the left or right.  Direction is a string, either "left" or "right".

    $('element').swiper('prev');

Alias for $('element').swiper('swipe', 'right');

    $('element').swiper('next');

Alias for $('element').swiper('swipe', 'left');

    $('element').swiper('goto', page);

Switch to the indicated page, instantly, with no animation.

    $('element').swiper('option');

Returns the options the swiper was created with.  New options can be specified by passing an options object.


