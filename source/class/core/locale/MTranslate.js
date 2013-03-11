/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2013 Sebastian Werner
==================================================================================================
*/

(function(Translate, slice) 
{
  core.Class("core.locale.MTranslate",
  {
    members :
    {
      /**
       * {String} Translates the given @message {String} and replaces any numeric placeholders 
       * (`%[0-9]`) with the corresponding number arguments passed via @varargs {var...?}.
       */
      tr : function(message, varargs) {
        return Translate.tr.apply(Translate, slice.call(arguments));
      },


      /**
       * {String} Translates the given @message {String} und while choosing the one which matches the 
       * given @context {String} and replaces any numeric placeholders (`%[0-9]`) with the corresponding 
       * number arguments passed via @varargs {var...?}.
       */
      trc : function(context, message, varargs) {
        return Translate.trc.apply(Translate, slice.call(arguments));
      },


      /**
       * {String} Translates the given @messageSingular {String} or @messagePlural {String} 
       * depending on the @number {Number} passed to the method.
       * Like the other methods it also supports replacing any numeric placeholders 
       * (`%[0-9]`) with the corresponding number arguments passed via @varargs {var...?}.
       */
      trn : function(messageSingular, messagePlural, varargs) {
        return Translate.trn.apply(Translate, slice.call(arguments));
      },


      /**
       * Optimized method being used by Jasy-replaced `trn()` method
       */
      trnc : function(messages, number, varargs) {
        return Translate.trnc.apply(Translate, slice.call(arguments));
      }    
    }
  });
})(core.locale.Translate, Array.prototype.slice);
