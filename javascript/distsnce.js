var old_units = app.preferences.rulerUnits;    
app.preferences.rulerUnits = Units.PIXELS;    

try { app.activeDocument.suspendHistory("Get Text Bounds", "var bounds = get_selected_layers_bounds()") } catch(e) { alert(e); }  

try { executeAction( charIDToTypeID( "undo" ), undefined, DialogModes.NO ); } catch(e) { alert(e); }  

app.preferences.rulerUnits = old_units;    

if (bounds)    
    {    
    if (bounds.length == 2)    
        {    
        var distance = 0;

        if (bounds[0].bottom <= bounds[1].top) distance = bounds[1].top - bounds[0].bottom;    
        else if (bounds[1].bottom <= bounds[0].top) distance = bounds[0].top - bounds[1].bottom;    

        else  alert("Intersecting layers")    

        var distance_in_css = distance - (bounds[0].leading - 1.2*bounds[0].size)/2 - (bounds[1].leading - 1.2*bounds[1].size)/2;

        alert("distance = " + distance + "\ndistance_in_css = " + distance_in_css);
        }    
    else    
        alert("More then 2 selected layers")     

    }    
else     
    alert("There is no selected layers")     

/////////////////////////////////////////////////////////////////////////////////////////////////    
function get_selected_layers_bounds()    
    {    
    try {    
        var ref = new ActionReference();    

        ref.putProperty( charIDToTypeID( "Prpr" ), stringIDToTypeID( "targetLayers" ) );    
        ref.putEnumerated( charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );    
        var desc = executeActionGet(ref);    

        if (!desc.hasKey( stringIDToTypeID("targetLayers") ) ) return null;    

        var n = 0;    
        try { activeDocument.backgroundLayer } catch (e) { n = 1; }    

        desc = desc.getList( stringIDToTypeID("targetLayers"));    

        var len = desc.count;    

        var selected_bounds = new Array();    

        for (var i = 0; i < len; i++)    
            {    
            try     
                {    
                var r = new ActionReference();    
                r.putIndex( charIDToTypeID( "Lyr " ), desc.getReference(i).getIndex() + n);    

                var ret = executeActionGet(r);    

                var size    = 0;
                var leading = 0;

                if (ret.hasKey(stringIDToTypeID("textKey")))  
                    {  
                    var textStyleRangeList = ret.getObjectValue(stringIDToTypeID("textKey")).getList(charIDToTypeID("Txtt" ));

                    if (textStyleRangeList.count > 1) { alert("More than one textStyleRange in layer", "Oops!!"); }

                    var textStyle = textStyleRangeList.getObjectValue(0).getObjectValue(charIDToTypeID("TxtS" ));

                    var auto_leading = textStyle.getBoolean(stringIDToTypeID("autoLeading"));

                    size = textStyle.getUnitDoubleValue(stringIDToTypeID("size"));
                    leading = auto_leading?size*1.2:textStyle.getUnitDoubleValue(stringIDToTypeID("leading"));

                    var s = ret.getObjectValue(stringIDToTypeID("textKey")).getString(charIDToTypeID("Txt " ));  
                    s = s.replace(/^./gm, String.fromCharCode(0x2588));  

                    var d1 = new ActionDescriptor();  
                    d1.putReference( charIDToTypeID( "null" ), r );  

                    var d2 = new ActionDescriptor();  
                    d2.putString( charIDToTypeID( "Txt " ), s);  

                    d1.putObject( charIDToTypeID( "T   " ), charIDToTypeID( "TxLr" ), d2 );  

                    executeAction( charIDToTypeID( "setd" ), d1, DialogModes.NO );  

                    ret = executeActionGet(r);    
                    }  


                // var bounds = ret.getObjectValue(stringIDToTypeID("bounds"));  // use this in CS6 or when you want to take into account the effects    

                var bounds = ret.getObjectValue(stringIDToTypeID("boundsNoEffects")); // in CS6 does not work    

                var obj = { 
                          left   : bounds.getUnitDoubleValue(stringIDToTypeID("left")),    
                          top    : bounds.getUnitDoubleValue(stringIDToTypeID("top")),    
                          right  : bounds.getUnitDoubleValue(stringIDToTypeID("right")),    
                          bottom : bounds.getUnitDoubleValue(stringIDToTypeID("bottom")),
                          size   : size,
                          leading: leading,
                          };    

                    selected_bounds.push(obj);    
                }

                catch (e) { alert(e); return null; }    
            }    

            return selected_bounds;    
        }    

    catch (e) { alert(e); return null; }    
}