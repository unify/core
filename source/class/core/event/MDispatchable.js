/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2012-2013 Sebastian Werner
==================================================================================================
*/

/**
 * Basic event class adding support for setTarget/getTarget which is used during
 * event dispatching by {core.event.MEventTarget}.
 */
core.Class("core.event.MDispatchable",
{
  members :
  {
    // Interface implementation
    setTarget : function(target) {
      this.__target = target;
    },

    // Interface implementation
    getTarget : function() {
      return this.__target;
    }   
  }
});