/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2013-2014 Sebastian Werner
==================================================================================================
*/

"use strict";

(function()
{
  var name = "transitionend";

  if (jasy.Env.isSet("engine", "webkit")) {
    name = "webkitTransitionEnd";
  }

  var Style = core.bom.Style;

  /**
   * Adds a transition end event to the given @elem {Element}
   * which executes @callback {Function} in @context {Object?}
   * whenever a transition on the element was finished.
   */
  var addListener = function(elem, callback, context)
  {
    if (context) {
      callback = core.Function.bind(callback, context);
    }

    elem.addEventListener(name, callback, false);
  };

  /**
   * Removes the @callback {Function} with its @context {Object?}
   * from the transition end event of the given @elem {Element}
   */
  var removeListener = function(elem, callback, context)
  {
    if (context) {
      callback = core.Function.bind(callback, context);
    }

    elem.removeEventListener(name, callback, false);
  };

  /**
   * Helper functions for simplifying work with CSS transitions
   */
  core.Module("core.bom.Transition",
  {
    addListener : addListener,
    removeListener : removeListener,

    /**
     * Stops current fade process on the given @elem {Element}.
     */
    fadeStop : function(elem) {
      elem.fading = null;
    },


    /**
     * Fades in the given @elem {Element} moving @from {Map?} styles
     * to @to {Map} styles. Executes the @callback {Function?} in the
     * given @context {Object?} as soon as the fade in process was completed.
     */
    fadeIn : function(elem, from, to, callback, context)
    {
      // Already running
      if (elem.fading == "in") {
        return;
      }

      elem.fading = "in";

      // Move element to initial position
      if (from != null)
      {
        Style.set(elem, "transitionDuration", "0ms");
        Style.set(elem, from);
      }

      // Show element and enforce rendering via access to offsetWidth
      elem.style.display = "block";
      elem.offsetWidth;

      // Post-pone visible animation to next render frame
      core.effect.AnimationFrame.request(function()
      {
        Style.set(elem, "transitionDuration", "");
        Style.set(elem, to);
      });

      // Connect to transition end event
      var helper = function()
      {
        removeListener(elem, helper);

        if (elem.fading == "in") {
          elem.fading = null;
        }

        if (callback) {
          context ? callback.call(context) : callback();
        }
      };

      addListener(elem, helper);
    },


    /**
     * Fades in the given @elem {Element} moving @from {Map?} styles
     * to @to {Map} styles. Executes the @callback {Function?} in the
     * given @context {Object?} as soon as the fade in process was completed.
     */
    fadeOut : function(elem, to, reset, callback, context)
    {
      // Already running
      if (elem.fading == "out") {
        return;
      }

      // Figure out whether there is an actual change which is transitioning.
      // Otherwise the transitionEnd event will never fire which leads to unwanted effects.
      var changed = false;
      for (var property in to)
      {
        if (Style.get(elem, property) != to[property])
        {
          changed = true;
          break;
        }
      }

      // Fast path for cases where no changes for transitioning are detected
      if (!changed)
      {
        // Hide element first
        elem.style.display = "none";

        // Then apply reset rules
        if (reset != null)
        {
          Style.set(elem, "transitionDuration", "0ms");
          Style.set(elem, reset);
        }

        // Finally let requester know
        if (callback) {
          context ? callback.call(context) : callback();
        }

        return;
      }

      elem.fading = "out";

      // Post-pone visible animation to next render frame
      core.effect.AnimationFrame.request(function()
      {
        Style.set(elem, "transitionDuration", "");
        Style.set(elem, to);
      });

      // Connect to transition end event
      var helper = function()
      {
        // Only execute this helper once
        removeListener(elem, helper);

        if (elem.fading == "out")
        {
          elem.fading = null;

          // Hide element first
          elem.style.display = "none";

          // Then apply reset rules
          if (reset != null)
          {
            Style.set(elem, "transitionDuration", "0ms");
            Style.set(elem, reset);
          }
        }

        // And when all is done execute the callback
        if (callback) {
          context ? callback.call(context) : callback();
        }
      };

      addListener(elem, helper);
    }
  });
})();
