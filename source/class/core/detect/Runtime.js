/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2010-2012 Zynga Inc.
  Copyright 2012-2013 Sebastian Werner
==================================================================================================
*/

(function() 
{
	var global = core.Main.getGlobal();
	
	/**
	 * Holds basic informations about the environment the script is running in.
	 */
	core.Module("core.detect.Runtime", {
		VALUE :	core.Main.isHostType(global, 'document') && core.Main.isHostType(global, 'navigator') ? "browser" : "native"
	});

})();